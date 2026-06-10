import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type WgDumpPeer = {
  publicKey: string;
  remoteEndpoint: string;
  allowedIps: string;
  latestHandshakeEpoch: number;
  transferRxBytes: number;
  transferTxBytes: number;
  persistentKeepalive: number;
};

export type WireGuardPeerRuntimeStatus = {
  available: boolean;
  interfaceName: string;
  checkedAt: string;
  status: "connected" | "seen" | "waiting_handshake" | "not_applied" | "unavailable";
  hasRuntimePeer: boolean;
  latestHandshakeAt: string | null;
  latestHandshakeEpoch: number;
  latestHandshakeAgeSeconds: number | null;
  transferRxBytes: number;
  transferTxBytes: number;
  transferTotalBytes: number;
  hasTransfer: boolean;
  hasRemoteEndpoint: boolean;
  detail?: string;
};

async function run(command: string, args: string[]) {
  return execFileAsync(command, args, {
    timeout: 5000,
    maxBuffer: 1024 * 1024
  });
}

async function wgDump(interfaceName: string) {
  const wgPath = process.env.VPS_WG_PATH || "wg";
  try {
    const { stdout } = await run(wgPath, ["show", interfaceName, "dump"]);
    return stdout;
  } catch {
    const { stdout } = await run("sudo", ["-n", wgPath, "show", interfaceName, "dump"]);
    return stdout;
  }
}

function parseNumber(value: string | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePeer(line: string): WgDumpPeer | null {
  const fields = line.split("\t");
  if (fields.length < 8) return null;
  return {
    publicKey: fields[0] || "",
    remoteEndpoint: fields[2] || "",
    allowedIps: fields[3] || "",
    latestHandshakeEpoch: parseNumber(fields[4]),
    transferRxBytes: parseNumber(fields[5]),
    transferTxBytes: parseNumber(fields[6]),
    persistentKeepalive: parseNumber(fields[7])
  };
}

function unavailable(interfaceName: string, detail: string): WireGuardPeerRuntimeStatus {
  return {
    available: false,
    interfaceName,
    checkedAt: new Date().toISOString(),
    status: "unavailable",
    hasRuntimePeer: false,
    latestHandshakeAt: null,
    latestHandshakeEpoch: 0,
    latestHandshakeAgeSeconds: null,
    transferRxBytes: 0,
    transferTxBytes: 0,
    transferTotalBytes: 0,
    hasTransfer: false,
    hasRemoteEndpoint: false,
    detail
  };
}

export async function getWireGuardPeerRuntimeStatus(
  publicKey: string,
  interfaceName = process.env.VPS_WG_INTERFACE || "wg0"
): Promise<WireGuardPeerRuntimeStatus> {
  const checkedAt = new Date();

  if (!publicKey) {
    return unavailable(interfaceName, "当前 Access Profile 尚未生成 peer public key。");
  }

  let dump = "";
  try {
    dump = await wgDump(interfaceName);
  } catch {
    return unavailable(interfaceName, "应用进程当前不能读取 wg show。请在服务器执行 sudo wg show wg0 验证，或为只读检查配置受控权限。");
  }

  const lines = dump.trim().split(/\r?\n/).filter(Boolean);
  const peer = lines.slice(1).map(parsePeer).find((item) => item?.publicKey === publicKey) || null;

  if (!peer) {
    return {
      available: true,
      interfaceName,
      checkedAt: checkedAt.toISOString(),
      status: "not_applied",
      hasRuntimePeer: false,
      latestHandshakeAt: null,
      latestHandshakeEpoch: 0,
      latestHandshakeAgeSeconds: null,
      transferRxBytes: 0,
      transferTxBytes: 0,
      transferTotalBytes: 0,
      hasTransfer: false,
      hasRemoteEndpoint: false,
      detail: "服务端 wg show 当前没有找到这个 Access Profile 的 peer。"
    };
  }

  const latestHandshakeAt = peer.latestHandshakeEpoch > 0
    ? new Date(peer.latestHandshakeEpoch * 1000)
    : null;
  const latestHandshakeAgeSeconds = latestHandshakeAt
    ? Math.max(0, Math.floor((checkedAt.getTime() - latestHandshakeAt.getTime()) / 1000))
    : null;
  const transferTotalBytes = peer.transferRxBytes + peer.transferTxBytes;
  const status = !latestHandshakeAt
    ? "waiting_handshake"
    : latestHandshakeAgeSeconds !== null && latestHandshakeAgeSeconds <= 180
      ? "connected"
      : "seen";

  return {
    available: true,
    interfaceName,
    checkedAt: checkedAt.toISOString(),
    status,
    hasRuntimePeer: true,
    latestHandshakeAt: latestHandshakeAt ? latestHandshakeAt.toISOString() : null,
    latestHandshakeEpoch: peer.latestHandshakeEpoch,
    latestHandshakeAgeSeconds,
    transferRxBytes: peer.transferRxBytes,
    transferTxBytes: peer.transferTxBytes,
    transferTotalBytes,
    hasTransfer: transferTotalBytes > 0,
    hasRemoteEndpoint: Boolean(peer.remoteEndpoint && peer.remoteEndpoint !== "(none)")
  };
}
