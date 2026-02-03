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
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

// Add Vercel preview URLs pattern
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Allow any vercel.app subdomain for preview deployments
    if (origin.endsWith('.vercel.app')) {
      console.log('[CORS] Allowing Vercel preview URL:', origin)
      return callback(null, true)
    }

    console.log('[CORS] Blocked origin:', origin)
    console.log('[CORS] Allowed origins:', allowedOrigins)
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  credentials: true
}

const io = new Server(httpServer, {
  cors: corsOptions
})

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Make io available to routes
app.set('io', io)

// Routes
app.use('/api/sessions', sessionsRouter)
app.use('/api/activities', activitiesRouter)

// Health check with debug info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin || 'no-origin',
    timestamp: new Date().toISOString()
  })
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
