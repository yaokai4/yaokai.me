export function isVpsPrivateMode() {
  const value = process.env.VPS_PRIVATE_MODE;
  return value === "1" || value === "true";
}
