import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db, queries } from '../db/database.js'

const router = Router()

// Get activity by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const activity = queries.getActivityById(id)

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' })
  }

  res.json(activity)
})

// Start an activity
router.post('/:id/start', async (req, res) => {
  const { id } = req.params
  const activity = queries.getActivityById(id)

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' })
  }

  // Deactivate all other activities in the session
  await queries.deactivateAllActivities(activity.session_id)

  // Activate this activity
  await queries.updateActivity(id, { is_active: true })

  res.json({ success: true })
})

// Stop an activity
router.post('/:id/stop', async (req, res) => {
  const { id } = req.params
  const activity = queries.getActivityById(id)

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' })
  }

  await queries.updateActivity(id, { is_active: false })
  res.json({ success: true })
})

// Submit response to an activity
router.post('/:id/respond', async (req, res) => {
  const { id } = req.params
  const { participantId, answer } = req.body

  const activity = queries.getActivityById(id)

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' })
  }

  if (!answer) {
    return res.status(400).json({ error: 'Answer is required' })
  }

  const response = {
    id: nanoid(),
    activity_id: id,
    participant_id: participantId || 'anonymous',
    answer,
    submitted_at: new Date().toISOString()
  }

  await queries.createResponse(response)

  // Broadcast to presenter via socket
  const io = req.app.get('io')
  if (io) {
    const session = queries.getSessionById(activity.session_id)
    if (session) {
      io.to(`session:${session.code}`).emit('response:new', {
        activityId: id,
        participantId: participantId || 'anonymous',
        answer
      })
    }
  }

  res.json(response)
})

// Get responses for an activity
router.get('/:id/responses', (req, res) => {
  const { id } = req.params
  const responses = queries.getResponsesByActivity(id)
  res.json(responses)
})

// Delete an activity
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const deleted = await queries.deleteActivity(id)

  if (!deleted) {
    return res.status(404).json({ error: 'Activity not found' })
  }

  res.json({ success: true })
})

export default router
