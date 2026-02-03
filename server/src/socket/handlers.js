import { queries } from '../db/database.js'

// Track connected users per session
const sessionUsers = new Map()

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    let currentSession = null
    let isPresenter = false

    // Join a session room
    socket.on('session:join', ({ sessionCode, participantId, nickname, isPresenter: presenter }) => {
      currentSession = sessionCode
      isPresenter = presenter

      // Join the socket room
      socket.join(`session:${sessionCode}`)

      // Track user
      if (!sessionUsers.has(sessionCode)) {
        sessionUsers.set(sessionCode, new Set())
      }

      sessionUsers.get(sessionCode).add(socket.id)

      // Notify others
      if (!presenter) {
        socket.to(`session:${sessionCode}`).emit('participant:joined', {
          id: participantId,
          nickname: nickname || 'Anonyme',
          socketId: socket.id
        })
      }

      // Send participant count
      const count = Array.from(sessionUsers.get(sessionCode)).filter(id => {
        const s = io.sockets.sockets.get(id)
        return s && !s.data?.isPresenter
      }).length

      io.to(`session:${sessionCode}`).emit('participants:count', count)

      // Store session info on socket
      socket.data = { sessionCode, participantId, isPresenter: presenter }

      // If presenter, send current participants list
      if (presenter) {
        const session = queries.getSessionByCode(sessionCode)
        if (session) {
          const participants = queries.getParticipantsBySession(session.id)
          socket.emit('participants:list', participants)
        }
      }

      console.log(`${presenter ? 'Presenter' : 'Participant'} joined session ${sessionCode}`)
    })

    // Start an activity
    socket.on('activity:start', ({ sessionCode, activity }) => {
      io.to(`session:${sessionCode}`).emit('activity:started', { activity })
      console.log(`Activity started in session ${sessionCode}: ${activity.title}`)
    })

    // Stop an activity
    socket.on('activity:stop', ({ sessionCode }) => {
      io.to(`session:${sessionCode}`).emit('activity:stopped')
      console.log(`Activity stopped in session ${sessionCode}`)
    })

    // Submit a response
    socket.on('response:submit', ({ sessionCode, activityId, participantId, answer }) => {
      // Broadcast to presenters in the session
      socket.to(`session:${sessionCode}`).emit('response:new', {
        activityId,
        participantId,
        answer
      })
      console.log(`Response submitted in session ${sessionCode}`)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentSession) {
        // Remove from tracking
        if (sessionUsers.has(currentSession)) {
          sessionUsers.get(currentSession).delete(socket.id)

          // Clean up empty sessions
          if (sessionUsers.get(currentSession).size === 0) {
            sessionUsers.delete(currentSession)
          }
        }

        // Notify others
        if (!isPresenter) {
          socket.to(`session:${currentSession}`).emit('participant:left', {
            socketId: socket.id,
            participantId: socket.data?.participantId
          })
        }

        // Update participant count
        const remaining = sessionUsers.get(currentSession)
        if (remaining) {
          const count = Array.from(remaining).filter(id => {
            const s = io.sockets.sockets.get(id)
            return s && !s.data?.isPresenter
          }).length

          io.to(`session:${currentSession}`).emit('participants:count', count)
        }
      }

      console.log('Client disconnected:', socket.id)
    })
  })
}
