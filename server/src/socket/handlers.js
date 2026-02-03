import { queries } from '../db/database.js'

// Track connected users per session
const sessionUsers = new Map()

// Track active activities with expected participant count
export const activeActivities = new Map()

// Helper to get participant count for a session
function getParticipantCount(io, sessionCode) {
  const users = sessionUsers.get(sessionCode)
  if (!users) return 0

  return Array.from(users).filter(id => {
    const s = io.sockets.sockets.get(id)
    return s && !s.data?.isPresenter
  }).length
}

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
      const count = getParticipantCount(io, sessionCode)
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
      // Capture participant count at activity start
      const expectedCount = getParticipantCount(io, sessionCode)

      // Store activity info
      activeActivities.set(activity.id, {
        sessionCode,
        expectedCount,
        respondedParticipants: new Set()
      })

      io.to(`session:${sessionCode}`).emit('activity:started', {
        activity,
        expectedCount
      })
      console.log(`Activity started in session ${sessionCode}: ${activity.title} (expecting ${expectedCount} responses)`)
    })

    // Stop an activity
    socket.on('activity:stop', ({ sessionCode, activityId }) => {
      // Get final responses if activity exists
      const activityInfo = activeActivities.get(activityId)
      let responses = []

      if (activityInfo) {
        responses = queries.getResponsesByActivity(activityId)
        activeActivities.delete(activityId)
      }

      io.to(`session:${sessionCode}`).emit('activity:stopped', { responses })
      console.log(`Activity stopped in session ${sessionCode}`)
    })

    // Submit a response - now only broadcasts count, not results
    socket.on('response:submit', ({ sessionCode, activityId, participantId, answer }) => {
      const activityInfo = activeActivities.get(activityId)

      if (activityInfo) {
        // Track this participant as having responded
        activityInfo.respondedParticipants.add(participantId)

        const respondedCount = activityInfo.respondedParticipants.size
        const expectedCount = activityInfo.expectedCount

        // Broadcast progress
        io.to(`session:${sessionCode}`).emit('response:progress', {
          activityId,
          respondedCount,
          expectedCount
        })

        console.log(`Response submitted in session ${sessionCode}: ${respondedCount}/${expectedCount}`)

        // Check if all have responded
        if (respondedCount >= expectedCount) {
          // Get all responses from database
          const responses = queries.getResponsesByActivity(activityId)

          // Broadcast results
          io.to(`session:${sessionCode}`).emit('activity:resultsReady', {
            activityId,
            responses
          })

          console.log(`All responses received for activity ${activityId}, broadcasting results`)
        }
      }
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
        const count = getParticipantCount(io, currentSession)
        io.to(`session:${currentSession}`).emit('participants:count', count)
      }

      console.log('Client disconnected:', socket.id)
    })
  })
}
