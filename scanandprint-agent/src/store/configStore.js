import path from 'path'
import fs from 'fs'

function getUserDataPath() {
  let baseDir = ''
  if (process.env.APPDATA) {
    baseDir = path.join(process.env.APPDATA, 'scanandprint-agent')
    return baseDir
  }
  if (process.platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', 'scanandprint-agent')
  }
  return path.join(process.env.HOME || process.cwd(), '.config', 'scanandprint-agent')
}

// Custom lightweight JSON store for reliability across Electron versions
class ConfigStore {
  constructor() {
    this.configPath = path.join(getUserDataPath(), 'config.json')
    this.data = this.loadConfig()
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const rawData = fs.readFileSync(this.configPath, 'utf8')
        const parsed = JSON.parse(rawData)
        if (parsed.shopId && parsed.secretKey) {
          if (parsed.serverUrl === 'https://scanandprint.onrender.com') {
            parsed.serverUrl = 'http://localhost:5000'
          }
          return parsed
        }
      }
    } catch (err) {
      console.error('Error reading config file:', err)
    }
    
    return {
      shopId: '',
      secretKey: '',
      serverUrl: 'http://localhost:5000',
      defaultBwPrinter: '',
      defaultColorPrinter: '',
      autoStartOnBoot: true,
    }
  }

  saveConfig(newConfig) {
    this.data = { ...this.data, ...newConfig }
    try {
      const dir = path.dirname(this.configPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error saving config file:', err)
      return false
    }
  }

  get(key) {
    return this.data[key]
  }

  getAll() {
    return { ...this.data }
  }

  set(key, value) {
    this.data[key] = value
    this.saveConfig({})
  }
}

const configStore = new ConfigStore()
export default configStore
