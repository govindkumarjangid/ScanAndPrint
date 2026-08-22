import crypto from 'crypto'
import os from 'os'
import nodeMachineId from 'node-machine-id'
const machineIdSync = nodeMachineId.machineIdSync || nodeMachineId
import si from 'systeminformation'

let cachedDeviceFingerprint = null
let cachedDeviceMeta = null

/**
 * Extracts the accurate physical network adapter IPv4 address (e.g., Wi-Fi / Ethernet 10.227.120.67)
 * Filters out all VMware, VirtualBox, WSL, Hyper-V, loopback, and pseudo virtual adapters.
 */
export async function getAccuratePhysicalIp() {
  try {
    const [defaultIface, ifaces, defaultGw] = await Promise.all([
      si.networkInterfaceDefault().catch(() => null),
      si.networkInterfaces().catch(() => []),
      si.networkGatewayDefault().catch(() => null),
    ])

    if (Array.isArray(ifaces) && ifaces.length > 0) {
      // 1. Exact default active physical interface recognized by the OS (e.g. "Wi-Fi" -> 10.227.120.67)
      if (defaultIface) {
        const defObj = ifaces.find(
          (i) =>
            (i.iface === defaultIface || i.ifaceName === defaultIface) &&
            i.ip4 &&
            !i.virtual &&
            i.ip4 !== '127.0.0.1' &&
            !i.ip4.startsWith('169.254.')
        )
        if (defObj?.ip4) return defObj.ip4
      }

      // 2. Any active interface marked as default === true with valid non-virtual IPv4
      const defActive = ifaces.find(
        (i) =>
          i.default === true &&
          i.ip4 &&
          !i.virtual &&
          i.ip4 !== '127.0.0.1' &&
          !i.ip4.startsWith('169.254.')
      )
      if (defActive?.ip4) return defActive.ip4

      // 3. Any physical wireless or wired adapter with active operstate === 'up'
      const physicalUp = ifaces.find(
        (i) =>
          !i.virtual &&
          !i.internal &&
          (i.operstate === 'up' || (i.speed && i.speed > 0)) &&
          i.ip4 &&
          i.ip4 !== '127.0.0.1' &&
          !i.ip4.startsWith('169.254.')
      )
      if (physicalUp?.ip4) return physicalUp.ip4

      // 4. Any non-virtual adapter not on virtual subnet ranges (192.168.23.x / 192.168.248.x)
      const nonVmAdapter = ifaces.find(
        (i) =>
          !i.virtual &&
          !i.internal &&
          i.ip4 &&
          !i.ip4.startsWith('192.168.23.') &&
          !i.ip4.startsWith('192.168.248.') &&
          !i.ip4.startsWith('169.254.') &&
          !i.ip4.startsWith('127.')
      )
      if (nonVmAdapter?.ip4) return nonVmAdapter.ip4
    }
  } catch (e) {
    console.warn('[DeviceFingerprint] Accurate IP detection note:', e.message)
  }

  // Fallback via os.networkInterfaces()
  try {
    const interfaces = os.networkInterfaces()
    const virtualKeywords = [
      'vmware', 'virtualbox', 'vbox', 'vethernet', 'wsl', 'hyper-v',
      'loopback', 'pseudo', 'teredo', 'isatap', 'tunnel', 'tap', 'tun',
      'npcap', 'pcap', 'bluetooth', 'tailscale', 'zerotier', 'wireguard', 'vmnet',
    ]

    for (const name of Object.keys(interfaces)) {
      const lowerName = name.toLowerCase()
      const isVirtual = virtualKeywords.some((kw) => lowerName.includes(kw))
      if (!isVirtual) {
        for (const net of interfaces[name]) {
          if (net.family === 'IPv4' && !net.internal && net.address && net.address !== '127.0.0.1' && !net.address.startsWith('169.254.') && !net.address.startsWith('192.168.23.') && !net.address.startsWith('192.168.248.')) {
            return net.address
          }
        }
      }
    }
  } catch (e) {}

  return '127.0.0.1'
}

/**
 * Generates a stable, multi-signal SHA-256 hardware device fingerprint and metadata
 * Combines Machine ID + CPU specifications + Motherboard Serial + System UUID + Hostname/Arch
 * @returns {Promise<{ fingerprint: string, meta: object }>}
 */
export async function getDeviceFingerprint() {
  if (cachedDeviceFingerprint && cachedDeviceMeta) {
    // Refresh live IP dynamically
    const liveIp = await getAccuratePhysicalIp()
    cachedDeviceMeta.ipAddress = liveIp
    cachedDeviceMeta.localIp = liveIp
    return {
      fingerprint: cachedDeviceFingerprint,
      meta: cachedDeviceMeta,
    }
  }

  let rawMachineId = 'UNKNOWN_MACHINE_ID'
  try {
    rawMachineId = machineIdSync({ original: true })
  } catch (err) {
    console.warn('[DeviceFingerprint] machineIdSync note:', err.message)
    try {
      rawMachineId = machineIdSync()
    } catch (e) {}
  }

  let cpuInfo = { manufacturer: 'Unknown', brand: 'Unknown', physicalCores: 1 }
  let baseboardInfo = { manufacturer: 'Unknown', model: 'Unknown', serial: 'Unknown' }
  let systemInfo = { manufacturer: 'Unknown', model: 'Unknown', serial: 'Unknown', uuid: 'Unknown' }

  try {
    const [cpu, baseboard, system] = await Promise.all([
      si.cpu().catch(() => ({})),
      si.baseboard().catch(() => ({})),
      si.system().catch(() => ({})),
    ])

    if (cpu?.brand || cpu?.manufacturer) {
      cpuInfo = {
        manufacturer: cpu.manufacturer || 'Unknown',
        brand: cpu.brand || 'Unknown',
        physicalCores: cpu.physicalCores || cpu.cores || 1,
        speed: cpu.speed || 'Unknown',
      }
    }

    if (baseboard?.serial || baseboard?.manufacturer) {
      baseboardInfo = {
        manufacturer: baseboard.manufacturer || 'Unknown',
        model: baseboard.model || 'Unknown',
        serial: baseboard.serial || 'Unknown',
      }
    }

    if (system?.uuid || system?.serial) {
      systemInfo = {
        manufacturer: system.manufacturer || 'Unknown',
        model: system.model || 'Unknown',
        serial: system.serial || 'Unknown',
        uuid: system.uuid || 'Unknown',
      }
    }
  } catch (err) {
    console.warn('[DeviceFingerprint] System info query note:', err.message)
  }

  const hostname = os.hostname() || 'localhost'
  const platform = process.platform || os.platform()
  const arch = process.arch || os.arch()
  const release = os.release() || ''
  const totalMemoryGb = Math.round(os.totalmem() / (1024 * 1024 * 1024)) || 4
  const exactIp = await getAccuratePhysicalIp()

  // Combine multi-source hardware signals into a deterministic string
  const signals = [
    `MACHINE_ID:${rawMachineId}`,
    `CPU_BRAND:${cpuInfo.brand}`,
    `CPU_MANUFACTURER:${cpuInfo.manufacturer}`,
    `CPU_CORES:${cpuInfo.physicalCores}`,
    `BASEBOARD_SERIAL:${baseboardInfo.serial}`,
    `BASEBOARD_MODEL:${baseboardInfo.model}`,
    `SYSTEM_UUID:${systemInfo.uuid}`,
    `SYSTEM_SERIAL:${systemInfo.serial}`,
    `HOSTNAME:${hostname.toUpperCase()}`,
    `PLATFORM:${platform}`,
    `ARCH:${arch}`,
  ].join('|#|')

  // Generate cryptographic SHA-256 hardware hash
  const fingerprint = crypto.createHash('sha256').update(signals).digest('hex')

  let defaultGateway = ''
  try {
    const gw = await si.networkGatewayDefault().catch(() => null)
    if (gw) defaultGateway = gw
  } catch (e) {}

  const meta = {
    hostname,
    platform: platform === 'win32' ? 'Windows' : platform,
    osRelease: release,
    arch,
    cpuModel: cpuInfo.brand !== 'Unknown' ? cpuInfo.brand : `${cpuInfo.manufacturer} (${cpuInfo.physicalCores} Cores)`,
    motherboardSerial: baseboardInfo.serial !== 'Unknown' ? baseboardInfo.serial : systemInfo.serial,
    systemUuid: systemInfo.uuid,
    totalMemoryGb,
    appVersion: '1.0.3',
    ipAddress: exactIp,
    localIp: exactIp,
    defaultGateway,
  }

  cachedDeviceFingerprint = fingerprint
  cachedDeviceMeta = meta

  console.log(`🔒 [DeviceFingerprint] Hardware Fingerprint Generated: ${fingerprint.slice(0, 16)}... (${hostname} | ${meta.cpuModel} | IP: ${exactIp} | Gateway: ${defaultGateway})`)

  return { fingerprint, meta }
}
