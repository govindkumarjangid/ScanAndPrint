import path from 'path'
import fs from 'fs'
import { app } from 'electron'

// Custom lightweight JSON store for reliability across Electron versions
class ConfigStore {
  constructor() {
    const userDataPath = app ? app.getPath('userData') : process.cwd()
    this.configPath = path.join(userDataPath, 'config.json')
    this.data = this.loadConfig()
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const rawData = fs.readFileSync(this.configPath, 'utf8')
        const parsed = JSON.parse(rawData)
        if (parsed.shopId && parsed.secretKey) {
          return parsed
        }
      }
    } catch (err) {
      console.error('Error reading config file:', err)
    }
    
    // Default testing credentials for development & verification
    return {
      shopId: 'SHOP_TEST_999',
      secretKey: 'sec_test_secret_123456',
      serverUrl: 'http://localhost:5000',
      defaultBwPrinter: 'Microsoft Print to PDF',
      defaultColorPrinter: 'Microsoft Print to PDF',
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
