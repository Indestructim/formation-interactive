import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { initDB } from './db/database.js'
import sessionsRouter from './routes/sessions.js'
import activitiesRouter from './routes/activities.js'
import { setupSocketHandlers } from './socket/handlers.js'

const app = express()
const httpServer = createServer(app)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors({
  origin: allowedOrigins
}))
app.use(express.json())

// Make io available to routes
app.set('io', io)

// Routes
app.use('/api/sessions', sessionsRouter)
app.use('/api/activities', activitiesRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Socket.io handlers
setupSocketHandlers(io)

// Initialize database and start server
const PORT = process.env.PORT || 3001

async function start() {
  await initDB()
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
  })
}

start().catch(console.error)
