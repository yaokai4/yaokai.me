export type SecureEndpointInput = {
  id?: string;
  status?: string | null;
  publicHost?: string | null;
  publicIp?: string | null;
  listenPort?: number | null;
  serviceStatus?: string | null;
  wireGuardInstalled?: boolean | null;
  wireGuardQuickInstalled?: boolean | null;
  wgInterfacePresent?: boolean | null;
  serverPublicKey?: string | null;
  dryRun?: boolean | null;
  allowSystemApply?: boolean | null;
  serviceConfigReady?: boolean | null;
  serviceApplied?: boolean | null;
  serviceRunning?: boolean | null;
  portListening?: boolean | null;
  ipForwardingEnabled?: boolean | null;
  publicHostResolved?: boolean | null;
};

export type SecureProfileInput = {
  id?: string;
  status?: string | null;
  expiresAt?: string | Date | null;
  configText?: string | null;
  encryptedConfig?: string | null;
  publicKey?: string | null;
  serverPeerStatus?: string | null;
  peerApplied?: boolean | null;
  serviceReloadedAfterPeer?: boolean | null;
};

export type SecureAccessReadiness = {
  endpointReady: boolean;
  profileReady: boolean;
  peerReady: boolean;
  hasImportableConfig: boolean;
  usable: boolean;
  canGenerateProfile: boolean;
  canShowConfig: boolean;
  canDownloadConfig: boolean;
  canRotateProfile: boolean;
  canPauseProfile: boolean;
  canActivateProfile: boolean;
  reasons: string[];
  nextSteps: string[];
};

function validPort(port?: number | null) {
  return Number.isInteger(port) && Number(port) > 0 && Number(port) <= 65535;
}

function isExpired(value?: string | Date | null) {
  if (!value) return true;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getTime() <= Date.now();
}

export function getSecureAccessReadiness(
  endpoint?: SecureEndpointInput | null,
  profile?: SecureProfileInput | null
): SecureAccessReadiness {
  const reasons: string[] = [];
  const nextSteps: string[] = [];
  const hasEndpoint = Boolean(endpoint?.id);
  const hasPublicEntry = Boolean(endpoint?.publicHost || endpoint?.publicIp);
  const hasListenPort = validPort(endpoint?.listenPort);
  const hasServerPublicKey = Boolean(endpoint?.serverPublicKey);
  const endpointStatusActive = endpoint?.status === "active";
  const serviceActive = endpoint?.serviceStatus === "active";
  const wireGuardInstalled = endpoint?.wireGuardInstalled === true;
  const wireGuardQuickInstalled = endpoint?.wireGuardQuickInstalled === true;
  const wgInterfacePresent = endpoint?.wgInterfacePresent === true;
  const dryRunDisabled = endpoint?.dryRun === false;
  const systemApplyAllowed = endpoint?.allowSystemApply === true;
  const serviceConfigReady = endpoint?.serviceConfigReady === true;
  const serviceApplied = endpoint?.serviceApplied === true;
  const serviceRunning = endpoint?.serviceRunning === true;
  const portListening = endpoint?.portListening === true;
  const ipForwardingEnabled = endpoint?.ipForwardingEnabled === true;
  const publicEntryResolved = endpoint?.publicHost ? endpoint.publicHostResolved === true : Boolean(endpoint?.publicIp);

  if (!hasEndpoint) {
    reasons.push("尚未创建 Endpoint，系统还没有当前服务器的安全接入入口。");
    nextSteps.push("先初始化 Endpoint，让系统识别服务器名称、主机名、公网入口、端口和服务状态。");
  }
  if (hasEndpoint && !hasPublicEntry) {
    reasons.push("Endpoint 缺少 publicHost 或 publicIp，客户端无法知道要连接到哪里。");
    nextSteps.push("在 Secure Access 设置中填写当前服务器域名或公网 IP。");
  }
  if (hasEndpoint && hasPublicEntry && !publicEntryResolved) {
    reasons.push("publicHost 当前未确认可解析，客户端可能无法到达 Endpoint。");
    nextSteps.push("确认域名 DNS 记录已指向当前服务器公网 IP，或改用公网 IP。");
  }
  if (hasEndpoint && !hasListenPort) {
    reasons.push("Endpoint 监听端口无效。");
    nextSteps.push("设置 1-65535 范围内的 WireGuard listenPort，默认可使用 51820。");
  }
  if (hasEndpoint && !hasServerPublicKey) {
    reasons.push("Endpoint 尚未生成 server public key。");
    nextSteps.push("执行 Endpoint 初始化，生成 server keypair；private key 只加密保存，不会进入前端。");
  }
  if (hasEndpoint && !wireGuardInstalled) {
    reasons.push("当前服务器未检测到 WireGuard 工具，仍处于 dry-run/数据库流程，客户端不能真实连接。");
    nextSteps.push("先按设置页展示的初始化说明安装和启用 WireGuard；系统不会静默执行这些危险命令。");
  }
  if (hasEndpoint && !wireGuardQuickInstalled) {
    reasons.push("当前服务器未检测到 wg-quick，不能通过 wg-quick@wg0 管理 Endpoint。");
    nextSteps.push("安装 wireguard-tools，并确认 wg-quick 可执行。");
  }
  if (hasEndpoint && !wgInterfacePresent) {
    reasons.push("wg0 interface 尚未确认存在。");
    nextSteps.push("启动或重启 wg-quick@wg0，并重新执行健康检查。");
  }
  if (hasEndpoint && !dryRunDisabled) {
    reasons.push("Endpoint 仍处于 dry-run 模式，系统配置没有真实应用。");
    nextSteps.push("确认服务器初始化策略后，将 VPS_DRY_RUN 设置为 false，并通过安全初始化流程应用系统配置。");
  }
  if (hasEndpoint && !systemApplyAllowed) {
    reasons.push("系统级应用未开启，无法写入 WireGuard 配置或重载服务。");
    nextSteps.push("确认服务器策略后设置 VPS_ALLOW_SYSTEM_APPLY=true。");
  }
  if (hasEndpoint && !serviceConfigReady) {
    reasons.push("WireGuard 服务端配置尚未写入或未通过检查。");
    nextSteps.push("运行安全初始化流程生成 /etc/wireguard/wg0.conf，并保留备份。");
  }
  if (hasEndpoint && !serviceApplied) {
    reasons.push("WireGuard 服务端配置尚未应用到 systemd 服务。");
    nextSteps.push("执行 wg-quick@wg0 启动或重启，并在成功后运行健康检查。");
  }
  if (hasEndpoint && !serviceRunning) {
    reasons.push("wg-quick@wg0 当前未确认 active。");
    nextSteps.push("检查 systemctl status wg-quick@wg0 的错误信息。");
  }
  if (hasEndpoint && !portListening) {
    reasons.push("UDP listenPort 未确认监听。");
    nextSteps.push("确认 wg0 已启动，并检查云厂商安全组是否放行 UDP listenPort。");
  }
  if (hasEndpoint && !ipForwardingEnabled) {
    reasons.push("IPv4 forwarding 未开启，设备只能到达 Endpoint 内部地址，不能通过它访问外部网络。");
    nextSteps.push("在安全初始化流程中启用 net.ipv4.ip_forward，并应用 WireGuard NAT 规则。");
  }
  if (hasEndpoint && !endpointStatusActive) {
    reasons.push(`Endpoint 状态是 ${endpoint?.status || "unknown"}，不是 active。`);
    nextSteps.push("完成系统级初始化后运行健康检查，让 Endpoint 状态变为 active。");
  }
  if (hasEndpoint && !serviceActive) {
    reasons.push(`WireGuard 服务状态是 ${endpoint?.serviceStatus || "unknown"}，不是 active。`);
    nextSteps.push("确认 wg-quick 服务已启动，并在页面执行健康检查。");
  }

  const endpointReady = hasEndpoint && hasPublicEntry && publicEntryResolved && hasListenPort && hasServerPublicKey && wireGuardInstalled && wireGuardQuickInstalled && wgInterfacePresent && endpointStatusActive && serviceActive && dryRunDisabled && systemApplyAllowed && serviceConfigReady && serviceApplied && serviceRunning && portListening && ipForwardingEnabled;
  const hasProfile = Boolean(profile?.id);
  const profileActive = profile?.status === "active" && !isExpired(profile?.expiresAt);
  const peerReady = profile?.serverPeerStatus === "applied" && profile?.peerApplied === true && profile?.serviceReloadedAfterPeer === true;
  const hasImportableConfig = Boolean(profile?.configText || profile?.encryptedConfig);

  if (!hasProfile) {
    reasons.push("尚未生成 Access Profile。");
    if (endpointReady) nextSteps.push("点击“生成我的访问配置”创建绑定当前账号、设备和 Endpoint 的 Device Profile。");
  } else {
    if (profile?.status === "paused") {
      reasons.push("Access Profile 已暂停。");
      nextSteps.push("确认设备仍可信后再启用配置。");
    } else if (profile?.status === "revoked") {
      reasons.push("Access Profile 已吊销。");
      nextSteps.push("重新生成新的访问配置，旧配置不能继续使用。");
    } else if (profile?.status === "expired" || isExpired(profile?.expiresAt)) {
      reasons.push("Access Profile 已过期。");
      nextSteps.push("重新生成配置或设置新的过期时间。");
    }
    if (!peerReady) {
      reasons.push(`Peer 状态是 ${profile?.serverPeerStatus || "pending"}，尚未确认应用到服务端 WireGuard。`);
      nextSteps.push("通过安全初始化流程把 peer public key 写入服务端 WireGuard 配置，重载服务后执行健康检查。");
    }
    if (!hasImportableConfig) {
      reasons.push("Access Profile 没有可导入的配置内容。");
      nextSteps.push("重新生成访问配置。");
    }
  }

  const profileReady = hasProfile && profileActive && hasImportableConfig;
  const usable = endpointReady && profileReady && peerReady;

  return {
    endpointReady,
    profileReady,
    peerReady,
    hasImportableConfig,
    usable,
    canGenerateProfile: endpointReady,
    canShowConfig: usable,
    canDownloadConfig: usable,
    canRotateProfile: endpointReady && hasProfile,
    canPauseProfile: hasProfile && profile?.status === "active",
    canActivateProfile: hasProfile && profile?.status === "paused",
    reasons: Array.from(new Set(reasons)),
    nextSteps: Array.from(new Set(nextSteps))
  };
}
