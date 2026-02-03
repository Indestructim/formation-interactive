import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db, queries } from '../db/database.js'

const router = Router()

// Generate a unique 6-character code
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// List all sessions
router.get('/', (req, res) => {
  const sessions = db.data.sessions
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  res.json(sessions)
})

// Create a new session
router.post('/', async (req, res) => {
  console.log('[Sessions] POST / - Creating new session')
  console.log('[Sessions] Request body:', req.body)
  console.log('[Sessions] Origin:', req.headers.origin)

  const { name } = req.body

  if (!name?.trim()) {
    console.log('[Sessions] Error: name is required')
    return res.status(400).json({ error: 'Session name is required' })
  }

  let code = generateCode()
  while (queries.getSessionByCode(code)) {
    code = generateCode()
  }

  const session = {
    id: nanoid(),
    code,
    name: name.trim(),
    created_at: new Date().toISOString(),
    is_active: true
  }

  await queries.createSession(session)
  res.json(session)
})

// Get session by code
router.get('/:code', (req, res) => {
  const { code } = req.params
  const session = queries.getSessionByCode(code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  res.json(session)
})

// Join a session as participant
router.post('/:code/join', async (req, res) => {
  const { code } = req.params
  const { nickname } = req.body

  const session = queries.getSessionByCode(code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const participant = {
    id: nanoid(),
    session_id: session.id,
    nickname: nickname || 'Anonyme',
    joined_at: new Date().toISOString()
  }

  await queries.createParticipant(participant)
  res.json({ session, participant })
})

// Get session activities
router.get('/:code/activities', (req, res) => {
  const { code } = req.params
  const session = queries.getSessionByCode(code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const activities = queries.getActivitiesBySession(session.id)
  res.json(activities)
})

// Create activity for a session
router.post('/:code/activities', async (req, res) => {
  const { code } = req.params
  const { type, title, config } = req.body

  const session = queries.getSessionByCode(code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  if (!type || !title?.trim()) {
    return res.status(400).json({ error: 'Type and title are required' })
  }

  const activity = {
    id: nanoid(),
    session_id: session.id,
    type,
    title: title.trim(),
    config: config || null,
    created_at: new Date().toISOString(),
    is_active: false
  }

  await queries.createActivity(activity)
  res.json(activity)
})

// Get session participants
router.get('/:code/participants', (req, res) => {
  const { code } = req.params
  const session = queries.getSessionByCode(code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const participants = queries.getParticipantsBySession(session.id)
  res.json(participants)
})

// End a session
router.post('/:code/end', async (req, res) => {
  const { code } = req.params
  const session = db.data.sessions.find(s => s.code === code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  await queries.updateSession(session.id, { is_active: false })
  res.json({ success: true })
})

// Reactivate a session
router.post('/:code/reactivate', async (req, res) => {
  const { code } = req.params
  const session = db.data.sessions.find(s => s.code === code.toUpperCase())

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  await queries.updateSession(session.id, { is_active: true })
  res.json({ success: true })
})

// Delete a session
router.delete('/:code', async (req, res) => {
  const { code } = req.params
  const sessionIndex = db.data.sessions.findIndex(s => s.code === code.toUpperCase())

  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const session = db.data.sessions[sessionIndex]

  // Delete all related data
  db.data.activities = db.data.activities.filter(a => a.session_id !== session.id)
  db.data.responses = db.data.responses.filter(r => {
    const activity = db.data.activities.find(a => a.id === r.activity_id)
    return activity && activity.session_id !== session.id
  })
  db.data.participants = db.data.participants.filter(p => p.session_id !== session.id)
  db.data.sessions.splice(sessionIndex, 1)

  await db.write()
  res.json({ success: true })
})

export default router
