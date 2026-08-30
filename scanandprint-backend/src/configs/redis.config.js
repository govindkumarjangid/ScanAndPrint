import Redis from 'ioredis';
import { envConfig } from './env.config.js';

const inMemorySessionMap = new Map()

const redis = new Redis(envConfig.redisUrl, {
  maxRetriesPerRequest: null,
  keepAlive: 10000,
  connectTimeout: 5000,
  commandTimeout: 2000,
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 150, 1500)
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError) || err.message.includes('ECONNRESET'))
      return true
    return false
  },
})

redis.on('connect', () => {
  console.log('✅ Redis connected for session management')
})

redis.on('error', (err) => {
  if (!err.message.includes('ECONNRESET'))
    console.warn('⚠️  Redis connection notice:', err.message)
})


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


export async function getShopSession(shopId) {
  const id = String(shopId)

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
   // safely fall back to memory
  }

  // In-memory fallback
  const cached = inMemorySessionMap.get(id)
  if (cached && cached.expiresAt > Date.now())
    return cached.sessionId

  return null
}


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

/**
 * Agent presence tracking via Redis Hashes
 */
export async function setAgentPresence(shopCode, agentData) {
  const code = String(shopCode || '').trim().toUpperCase()
  if (!code) return
  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.hset('active_agents', code, JSON.stringify(agentData))
    }
  } catch (err) {
    console.warn('[Redis setAgentPresence]:', err.message)
  }
}

export async function removeAgentPresence(shopCode) {
  const code = String(shopCode || '').trim().toUpperCase()
  if (!code) return
  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.hdel('active_agents', code)
    }
  } catch (err) {
    console.warn('[Redis removeAgentPresence]:', err.message)
  }
}

export async function getActiveAgentsFromRedis() {
  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      const raw = await redis.hgetall('active_agents')
      const result = {}
      for (const [k, v] of Object.entries(raw || {})) {
        try {
          result[k] = JSON.parse(v)
        } catch (e) {}
      }
      return result
    }
  } catch (err) {
    console.warn('[Redis getActiveAgents]:', err.message)
  }
  return null
}

export default redis;