import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../context/SocketContext'
import { API_URL } from '../lib/config'
import WordCloudResults from '../components/results/WordCloudResults'
import QuizResults from '../components/results/QuizResults'
import PollResults from '../components/results/PollResults'

export default function PresentationMode() {
  const { sessionCode } = useParams()
  const { socket } = useSocket()

  const [session, setSession] = useState(null)
  const [currentActivity, setCurrentActivity] = useState(null)
  const [responses, setResponses] = useState([])
  const [participantCount, setParticipantCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/sessions/${sessionCode}`)
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(console.error)
  }, [sessionCode])

  useEffect(() => {
    if (!socket) return

    socket.emit('session:join', { sessionCode, isPresenter: true })

    socket.on('activity:started', (data) => {
      setCurrentActivity(data.activity)
      setResponses([])
    })

    socket.on('activity:stopped', () => {
      setCurrentActivity(null)
    })

    socket.on('response:new', (data) => {
      setResponses(prev => [...prev, data])
    })

    socket.on('participants:count', (count) => {
      setParticipantCount(count)
    })

    socket.on('participant:joined', () => {
      setParticipantCount(prev => prev + 1)
    })

    socket.on('participant:left', () => {
      setParticipantCount(prev => Math.max(0, prev - 1))
    })

    return () => {
      socket.off('activity:started')
      socket.off('activity:stopped')
      socket.off('response:new')
      socket.off('participants:count')
      socket.off('participant:joined')
      socket.off('participant:left')
    }
  }, [socket, sessionCode])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold opacity-80">{session?.name}</h1>
          <div className="flex items-center gap-4 text-sm opacity-60">
            <span>Code : <span className="font-mono">{sessionCode}</span></span>
            <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isFullscreen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V5a2 2 0 012-2h2a2 2 0 012 2v4m0 6v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4m-6-6h4a2 2 0 012 2v2a2 2 0 01-2 2H5m14-6h-4a2 2 0 00-2 2v2a2 2 0 002 2h4" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center p-8 pt-24">
        <AnimatePresence mode="wait">
          {!currentActivity ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-6xl font-bold mb-4 font-mono tracking-wider text-primary-400">
                {sessionCode}
              </div>
              <p className="text-2xl text-gray-400">
                Rejoignez la session avec ce code
              </p>
              <p className="mt-4 text-gray-500">
                {participantCount} participant{participantCount > 1 ? 's' : ''} connecté{participantCount > 1 ? 's' : ''}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="activity"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-8">
                <span className="text-sm uppercase tracking-wider text-gray-400">
                  {currentActivity.type === 'wordcloud' ? 'Nuage de mots' :
                   currentActivity.type === 'quiz' ? 'Quiz' : 'Sondage'}
                </span>
                <h2 className="text-4xl font-bold mt-2">{currentActivity.title}</h2>
                <p className="mt-2 text-gray-400">
                  {responses.length} réponse{responses.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
                {currentActivity.type === 'wordcloud' && (
                  <WordCloudResults responses={responses} darkMode />
                )}
                {currentActivity.type === 'quiz' && (
                  <QuizResults activity={currentActivity} responses={responses} darkMode />
                )}
                {currentActivity.type === 'poll' && (
                  <PollResults activity={currentActivity} responses={responses} darkMode />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
