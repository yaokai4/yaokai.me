type WireGuardSection = "interface" | "peer";

type ParsedWireGuardConfig = {
  privateKey: string;
  addresses: string[];
  dns: string[];
  mtu?: number;
  publicKey: string;
  allowedIps: string[];
  endpointHost: string;
  endpointPort: number;
  persistentKeepalive?: number;
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveInteger(value: string | undefined, max: number) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed > 0 && parsed <= max ? parsed : undefined;
}

function parseEndpoint(value: string) {
  const bracketed = value.match(/^\[([^\]]+)\]:(\d+)$/);
  if (bracketed) {
    const port = parsePositiveInteger(bracketed[2], 65_535);
    if (!port) throw new Error("SHADOWROCKET_ENDPOINT_INVALID");
    return { host: bracketed[1], port };
  }

  const separator = value.lastIndexOf(":");
  if (separator <= 0) throw new Error("SHADOWROCKET_ENDPOINT_INVALID");
  const host = value.slice(0, separator).trim();
  const port = parsePositiveInteger(value.slice(separator + 1).trim(), 65_535);
  if (!host || !port) throw new Error("SHADOWROCKET_ENDPOINT_INVALID");
  return { host, port };
}

function stripCidr(address: string | undefined) {
  return address?.split("/")[0]?.trim();
}

function sanitizeNodeName(value: string) {
  return value.trim().replace(/[=,\r\n]+/g, " ") || "Secure Access";
}

export function parseWireGuardConfigForShadowrocket(configText: string): ParsedWireGuardConfig {
  const values: Record<WireGuardSection, Record<string, string>> = {
    interface: {},
    peer: {}
  };
  let section: WireGuardSection | null = null;

  for (const rawLine of configText.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const sectionMatch = line.match(/^\[(Interface|Peer)\]$/i);
    if (sectionMatch) {
      section = sectionMatch[1].toLowerCase() as WireGuardSection;
      continue;
    }
    if (!section) continue;

    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key && value) values[section][key] = value;
  }

  const privateKey = values.interface.privatekey;
  const publicKey = values.peer.publickey;
  const addresses = splitList(values.interface.address || "");
  const allowedIps = splitList(values.peer.allowedips || "");
  const endpointValue = values.peer.endpoint;
  if (!privateKey || !publicKey || !addresses.length || !allowedIps.length || !endpointValue) {
    throw new Error("SHADOWROCKET_CONFIG_INCOMPLETE");
  }

  const endpoint = parseEndpoint(endpointValue);
  return {
    privateKey,
    addresses,
    dns: splitList(values.interface.dns || ""),
    mtu: parsePositiveInteger(values.interface.mtu, 65_535),
    publicKey,
    allowedIps,
    endpointHost: endpoint.host,
    endpointPort: endpoint.port,
    persistentKeepalive: parsePositiveInteger(values.peer.persistentkeepalive, 65_535)
  };
}

export function buildShadowrocketSubscription(configText: string, profileName: string) {
  const parsed = parseWireGuardConfigForShadowrocket(configText);
  const ipv4 = stripCidr(parsed.addresses.find((address) => address.includes(".")));
  const ipv6 = stripCidr(parsed.addresses.find((address) => address.includes(":")));
  const parameters = [
    `privateKey=${parsed.privateKey}`,
    `publicKey=${parsed.publicKey}`,
    ipv4 ? `ip=${ipv4}` : null,
    ipv6 ? `ipv6=${ipv6}` : null,
    "udp=1",
    parsed.dns[0] ? `dns=${parsed.dns[0]}` : null,
    parsed.mtu ? `mtu=${parsed.mtu}` : null,
    parsed.persistentKeepalive ? `keepalive=${parsed.persistentKeepalive}` : null
  ].filter(Boolean);
  const node = `${sanitizeNodeName(profileName)}=wireguard,${parsed.endpointHost},${parsed.endpointPort},${parameters.join(",")}`;

  return `${Buffer.from(node, "utf8").toString("base64")}\n`;
}
