import crypto from 'crypto'

export const generateShopCode = (shopName) => {
  const cleanName = (shopName || 'SHOP')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `${cleanName}_${randomDigits}`
}

export const generateSecretApiKey = () => {
  return `sec_live_${crypto.randomBytes(16).toString('hex')}`
}
