import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import leadRoutes from './routes/leadRoutes.js'
import authRoutes from './routes/authRoutes.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()
connectDB()

const app = express()

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',  authRoutes)
app.use('/api/leads', leadRoutes)

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

// ── Error Handler ────────────────────────────────────────
app.use(errorHandler)

// ── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))