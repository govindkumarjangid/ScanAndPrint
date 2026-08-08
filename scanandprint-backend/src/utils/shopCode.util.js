import crypto from 'crypto'

/**
 * Generates a unique Shop Code (e.g. SHOP_982345 or SHARMA_CYBER_101)
 */
export const generateShopCode = (shopName) => {
  const cleanName = (shopName || 'SHOP')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `${cleanName}_${randomDigits}`
}

/**
 * Generates a secure Secret API Key for Print Agent authentication
 */
export const generateSecretApiKey = () => {
  return `sec_live_${crypto.randomBytes(16).toString('hex')}`
}
