import { Redis } from '@upstash/redis'

/**
 * Cache compartilhado sobre Upstash Redis (REST).
 *
 * Degrada graciosamente: sem `UPSTASH_REDIS_REST_URL`/`_TOKEN` configurados,
 * `cached()` apenas executa o fetcher — útil em dev sem infra. Erros de cache
 * nunca quebram a request: caem no fetcher.
 */

let client: Redis | null | undefined

function getRedis(): Redis | null {
  if (client !== undefined) return client

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  client = url && token ? new Redis({ url, token }) : null

  return client
}

export const CACHE_TTL = {
  leagues: 86_400, // 24h — catálogo de ligas muda raramente
  leagueFixtures: 7_200, // 2h — calendário/status dos jogos
  teamStatistics: 21_600, // 6h — só muda quando o time joga
  h2h: 86_400, // 24h — confronto direto é quase estático
  predictions: 86_400, // 24h — fixo por jogo
} as const

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const redis = getRedis()

  if (redis) {
    try {
      const hit = await redis.get<T>(key)
      if (hit !== null && hit !== undefined) return hit
    } catch (err) {
      console.warn(`[cache] leitura falhou para "${key}":`, err)
    }
  }

  const fresh = await fetcher()

  if (redis) {
    try {
      await redis.set(key, fresh, { ex: ttlSeconds })
    } catch (err) {
      console.warn(`[cache] escrita falhou para "${key}":`, err)
    }
  }

  return fresh
}
