import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/leaderboard — top 20 players by Elo
router.get('/', async (_req: Request, res: Response) => {
  try {
    const players = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        elo: true,
        wins: true,
        losses: true,
        draws: true,
      },
      orderBy: { elo: 'desc' },
      take: 20,
    })

    return res.json(players)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

export default router
