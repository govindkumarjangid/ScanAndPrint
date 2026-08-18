class MemoryCache {
  constructor() {
    this.cache = new Map()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  set(key, value, ttlMs = 5000) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  delete(key) {
    this.cache.delete(key)
  }

  invalidateShop(shopId) {
    const prefix = `shop:${String(shopId)}`
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  clear() {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()
