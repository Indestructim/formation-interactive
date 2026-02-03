import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../context/SocketContext'
import { useSession } from '../context/SessionContext'
import { API_URL } from '../lib/config'
import WordCloudInput from '../components/participant/WordCloudInput'
import QuizInput from '../components/participant/QuizInput'
import PollInput from '../components/participant/PollInput'

export default function ParticipantView() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const { session, setSession } = useSession()

  const [currentActivity, setCurrentActivity] = useState(null)
  const [hasResponded, setHasResponded] = useState(false)
  const [participantId, setParticipantId] = useState(null)

  useEffect(() => {
    const storedParticipantId = localStorage.getItem(`participant_${sessionCode}`)
    if (storedParticipantId) {
      setParticipantId(storedParticipantId)
    }

    fetch(`${API_URL}/api/sessions/${sessionCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          navigate('/')
        } else {
          setSession(data)
        }
      })
      .catch(() => navigate('/'))
  }, [sessionCode])

  useEffect(() => {
    if (!socket) return

    const pid = localStorage.getItem(`participant_${sessionCode}`)
    socket.emit('session:join', {
      sessionCode,
      participantId: pid,
      isPresenter: false
    })

    socket.on('activity:started', (data) => {
      setCurrentActivity(data.activity)
      setHasResponded(false)
    })

    socket.on('activity:stopped', () => {
      setCurrentActivity(null)
      setHasResponded(false)
    })

    return () => {
      socket.off('activity:started')
      socket.off('activity:stopped')
    }
  }, [socket, sessionCode])

  const handleSubmitResponse = async (answer) => {
    if (!currentActivity) return

    const pid = localStorage.getItem(`participant_${sessionCode}`)

    try {
      await fetch(`${API_URL}/api/activities/${currentActivity.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: pid,
          answer
        })
      })

      socket.emit('response:submit', {
        sessionCode,
        activityId: currentActivity.id,
        participantId: pid,
        answer
      })

      setHasResponded(true)
    } catch (error) {
      console.error('Error submitting response:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-800">
              {session?.name || 'Chargement...'}
            </h1>
            <span className="text-xs text-gray-500">
              Session : {sessionCode}
            </span>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!currentActivity ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                En attente d'une activité
              </h2>
              <p className="text-gray-500">
                Le formateur va bientôt lancer une activité
              </p>
            </motion.div>
          ) : hasResponded ? (
            <motion.div
              key="responded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Réponse envoyée !
              </h2>
              <p className="text-gray-500">
                En attente de la prochaine activité...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg"
            >
              {currentActivity.type === 'wordcloud' && (
                <WordCloudInput
                  activity={currentActivity}
                  onSubmit={handleSubmitResponse}
                />
              )}
              {currentActivity.type === 'quiz' && (
                <QuizInput
                  activity={currentActivity}
                  onSubmit={handleSubmitResponse}
                />
              )}
              {currentActivity.type === 'poll' && (
                <PollInput
                  activity={currentActivity}
                  onSubmit={handleSubmitResponse}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
