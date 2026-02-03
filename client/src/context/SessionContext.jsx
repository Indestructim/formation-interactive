import { createContext, useContext, useState, useCallback } from 'react'
import { useSocket } from './SocketContext'
import { API_URL } from '../lib/config'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const { socket } = useSocket()
  const [session, setSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [currentActivity, setCurrentActivity] = useState(null)
  const [responses, setResponses] = useState([])
  const [isPresenter, setIsPresenter] = useState(false)

  const createSession = useCallback(async (name) => {
    const res = await fetch(`${API_URL}/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    const data = await res.json()
    setSession(data)
    setIsPresenter(true)

    if (socket) {
      socket.emit('session:join', { sessionCode: data.code, isPresenter: true })
    }

    return data
  }, [socket])

  const joinSession = useCallback(async (code, nickname) => {
    const res = await fetch(`/api/sessions/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    })

    if (!res.ok) {
      throw new Error('Session non trouvée')
    }

    const data = await res.json()
    setSession(data.session)
    setIsPresenter(false)

    if (socket) {
      socket.emit('session:join', {
        sessionCode: code,
        participantId: data.participant.id,
        nickname
      })
    }

    return data
  }, [socket])

  const value = {
    session,
    setSession,
    participants,
    setParticipants,
    currentActivity,
    setCurrentActivity,
    responses,
    setResponses,
    isPresenter,
    createSession,
    joinSession
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
