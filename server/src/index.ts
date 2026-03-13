import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import gameRoutes from './routes/games'
import leaderboardRoutes from './routes/leaderboard'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Knight Vision API' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

app.listen(PORT, () => {
  console.log('')
  console.log('♞  Knight Vision API running')
  console.log(`   http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log('')
})
