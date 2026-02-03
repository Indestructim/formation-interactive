import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../../data')

// Create data directory if it doesn't exist
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const defaultData = {
  sessions: [],
  participants: [],
  activities: [],
  responses: []
}

const adapter = new JSONFile(join(dataDir, 'db.json'))
export const db = new Low(adapter, defaultData)

export async function initDB() {
  await db.read()
  db.data ||= defaultData
  await db.write()
  console.log('Database initialized')
}

// Helper functions for querying
export const queries = {
  // Sessions
  getSessionByCode: (code) => {
    return db.data.sessions.find(s => s.code === code && s.is_active)
  },

  getSessionById: (id) => {
    return db.data.sessions.find(s => s.id === id)
  },

  createSession: async (session) => {
    db.data.sessions.push(session)
    await db.write()
    return session
  },

  updateSession: async (id, updates) => {
    const index = db.data.sessions.findIndex(s => s.id === id)
    if (index !== -1) {
      db.data.sessions[index] = { ...db.data.sessions[index], ...updates }
      await db.write()
      return db.data.sessions[index]
    }
    return null
  },

  // Participants
  getParticipantsBySession: (sessionId) => {
    return db.data.participants.filter(p => p.session_id === sessionId)
  },

  createParticipant: async (participant) => {
    db.data.participants.push(participant)
    await db.write()
    return participant
  },

  // Activities
  getActivitiesBySession: (sessionId) => {
    return db.data.activities
      .filter(a => a.session_id === sessionId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  getActivityById: (id) => {
    return db.data.activities.find(a => a.id === id)
  },

  createActivity: async (activity) => {
    db.data.activities.push(activity)
    await db.write()
    return activity
  },

  updateActivity: async (id, updates) => {
    const index = db.data.activities.findIndex(a => a.id === id)
    if (index !== -1) {
      db.data.activities[index] = { ...db.data.activities[index], ...updates }
      await db.write()
      return db.data.activities[index]
    }
    return null
  },

  deactivateAllActivities: async (sessionId) => {
    db.data.activities.forEach(a => {
      if (a.session_id === sessionId) {
        a.is_active = false
      }
    })
    await db.write()
  },

  deleteActivity: async (id) => {
    const index = db.data.activities.findIndex(a => a.id === id)
    if (index !== -1) {
      db.data.activities.splice(index, 1)
      // Also delete responses
      db.data.responses = db.data.responses.filter(r => r.activity_id !== id)
      await db.write()
      return true
    }
    return false
  },

  // Responses
  getResponsesByActivity: (activityId) => {
    return db.data.responses
      .filter(r => r.activity_id === activityId)
      .sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
  },

  createResponse: async (response) => {
    db.data.responses.push(response)
    await db.write()
    return response
  }
}
