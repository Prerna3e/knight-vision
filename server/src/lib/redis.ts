import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export async function saveGameState(gameId: string, fen: string, ttlSeconds = 120) {
  await redis.set(`game:${gameId}:fen`, fen, 'EX', ttlSeconds)
}

export async function getGameState(gameId: string): Promise<string | null> {
  return redis.get(`game:${gameId}:fen`)
}

export async function deleteGameState(gameId: string) {
  await redis.del(`game:${gameId}:fen`)
}
