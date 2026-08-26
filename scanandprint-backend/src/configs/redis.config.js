import Redis from 'ioredis'
import { envConfig } from './env.config.js'

// In-memory session cache for 0ms ultra-fast lookup and glitch resilience
const inMemorySessionMap = new Map()

const redis = new Redis(envConfig.redisUrl, {
  maxRetriesPerRequest: null, // Let ioredis queue and reconnect without aborting with max retries error
  keepAlive: 10000, // Send TCP keepalive packets every 10s to prevent Upstash/Cloud idle ECONNRESET
  connectTimeout: 5000,
  commandTimeout: 2000, // Never let a single command block the API request for more than 2s
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 150, 1500)
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError) || err.message.includes('ECONNRESET')) {
      return true
    }
    return false
  },
})

redis.on('connect', () => {
  console.log('✅ Redis connected for session management')
})

redis.on('error', (err) => {
  // Graceful log without crashing or spamming unhandled errors
  if (!err.message.includes('ECONNRESET')) {
    console.warn('⚠️  Redis connection notice:', err.message)
  }
})

/**
 * Set active shop session in Redis and in-memory cache
 */
export async function setShopSession(shopId, sessionId, ttlSeconds = 7 * 24 * 60 * 60) {
  const id = String(shopId)
  inMemorySessionMap.set(id, { sessionId, expiresAt: Date.now() + ttlSeconds * 1000 })

  try {
    await Promise.race([
      redis.set(`session:${id}`, sessionId, 'EX', ttlSeconds),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis set timeout')), 1500)),
    ])
  } catch (err) {
    console.warn('[Redis setSession notice]:', err.message)
  }
}

/**
 * Get active shop session with 0ms memory fallback
 */
export async function getShopSession(shopId) {
  const id = String(shopId)

  // 1. Try Redis with fast 1s timeout
  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      const redisSessionId = await Promise.race([
        redis.get(`session:${id}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis get timeout')), 1000)),
      ])
      if (redisSessionId) {
        inMemorySessionMap.set(id, { sessionId: redisSessionId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 })
        return redisSessionId
      }
    }
  } catch (err) {
    // Redis had a network glitch / timeout -> safely fall back to memory
  }

  // 2. In-memory fallback
  const cached = inMemorySessionMap.get(id)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.sessionId
  }

  return null
}

/**
 * Delete shop session on logout
 */
export async function deleteShopSession(shopId) {
  const id = String(shopId)
  inMemorySessionMap.delete(id)

  try {
    await Promise.race([
      redis.del(`session:${id}`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis del timeout')), 1000)),
    ])
  } catch (err) {
    console.warn('[Redis delSession notice]:', err.message)
  }
}

export default redis
