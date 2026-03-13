import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// POST /api/games — create a new game
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { opponentId } = req.body

  if (!opponentId) {
    return res.status(400).json({ error: 'opponentId is required' })
  }

  try {
    const opponent = await prisma.user.findUnique({ where: { id: opponentId } })
    if (!opponent) {
      return res.status(404).json({ error: 'Opponent not found' })
    }

    // randomly assign colors
    const isWhite = Math.random() > 0.5
    const game = await prisma.game.create({
      data: {
        whitePlayerId: isWhite ? req.userId! : opponentId,
        blackPlayerId: isWhite ? opponentId : req.userId!,
        status: 'ACTIVE',
      },
      include: {
        whitePlayer: { select: { id: true, username: true, elo: true } },
        blackPlayer: { select: { id: true, username: true, elo: true } },
      },
    })

    return res.status(201).json(game)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create game' })
  }
})

// GET /api/games/my — get all games for logged-in user
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [{ whitePlayerId: req.userId }, { blackPlayerId: req.userId }],
      },
      include: {
        whitePlayer: { select: { id: true, username: true, elo: true } },
        blackPlayer: { select: { id: true, username: true, elo: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(games)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch games' })
  }
})

// GET /api/games/:id — get a specific game with moves
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: {
        whitePlayer: { select: { id: true, username: true, elo: true } },
        blackPlayer: { select: { id: true, username: true, elo: true } },
        moves: { orderBy: { moveNumber: 'asc' } },
      },
    })

    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    return res.json(game)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch game' })
  }
})

// PATCH /api/games/:id/resign — resign from a game
router.patch('/:id/resign', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } })

    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    if (game.status === 'FINISHED') {
      return res.status(400).json({ error: 'Game is already finished' })
    }

    const isWhite = game.whitePlayerId === req.userId
    const result = isWhite ? 'BLACK_WIN' : 'WHITE_WIN'

    const updated = await prisma.game.update({
      where: { id: req.params.id },
      data: { status: 'FINISHED', result, finishedAt: new Date() },
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resign' })
  }
})

export default router
