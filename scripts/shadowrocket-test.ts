import assert from "node:assert/strict";
import {
  buildShadowrocketSubscription,
  parseWireGuardConfigForShadowrocket
} from "../lib/shadowrocket";

const config = [
  "[Interface]",
  "PrivateKey = client-private-key",
  "Address = 10.66.0.2/32",
  "DNS = 1.1.1.1",
  "MTU = 1280",
  "",
  "[Peer]",
  "PublicKey = server-public-key",
  "AllowedIPs = 0.0.0.0/0",
  "Endpoint = yaokai.me:51820",
  "PersistentKeepalive = 25"
].join("\n");

const parsed = parseWireGuardConfigForShadowrocket(config);
assert.equal(parsed.endpointHost, "yaokai.me");
assert.equal(parsed.endpointPort, 51820);
assert.deepEqual(parsed.addresses, ["10.66.0.2/32"]);
assert.deepEqual(parsed.allowedIps, ["0.0.0.0/0"]);

const output = buildShadowrocketSubscription(config, "Tokyo Secure Access");
const node = Buffer.from(output.trim(), "base64").toString("utf8");
assert.equal(
  node,
  "Tokyo Secure Access=wireguard,yaokai.me,51820,privateKey=client-private-key,publicKey=server-public-key,ip=10.66.0.2,udp=1,dns=1.1.1.1,mtu=1280,keepalive=25"
);

const ipv6 = parseWireGuardConfigForShadowrocket(config.replace("yaokai.me:51820", "[2001:db8::1]:51820"));
assert.equal(ipv6.endpointHost, "2001:db8::1");
assert.equal(ipv6.endpointPort, 51820);

assert.throws(
  () => buildShadowrocketSubscription(config.replace("PublicKey = server-public-key", ""), "Broken"),
  /SHADOWROCKET_CONFIG_INCOMPLETE/
);

console.log("shadowrocket checks passed");
