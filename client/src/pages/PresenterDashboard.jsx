import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../context/SocketContext'
import { useSession } from '../context/SessionContext'
import { API_URL } from '../lib/config'
import WordCloudActivity from '../components/activities/WordCloudActivity'
import QuizActivity from '../components/activities/QuizActivity'
import PollActivity from '../components/activities/PollActivity'
import WordCloudResults from '../components/results/WordCloudResults'
import QuizResults from '../components/results/QuizResults'
import PollResults from '../components/results/PollResults'

export default function PresenterDashboard() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const { session, setSession, participants, setParticipants, currentActivity, setCurrentActivity, responses, setResponses } = useSession()

  const [activeTab, setActiveTab] = useState('activities')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activityType, setActivityType] = useState(null)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (!sessionCode) return

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

    fetch(`${API_URL}/api/sessions/${sessionCode}/activities`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(console.error)
  }, [sessionCode])

  useEffect(() => {
    if (!socket) return

    socket.emit('session:join', { sessionCode, isPresenter: true })

    socket.on('participant:joined', (data) => {
      setParticipants(prev => [...prev, data])
    })

    socket.on('participant:left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId))
    })

    socket.on('response:new', (data) => {
      setResponses(prev => [...prev, data])
    })

    socket.on('participants:list', (data) => {
      setParticipants(data)
    })

    return () => {
      socket.off('participant:joined')
      socket.off('participant:left')
      socket.off('response:new')
      socket.off('participants:list')
    }
  }, [socket, sessionCode])

  const handleCreateActivity = async (activityData) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionCode}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      })
      const newActivity = await res.json()
      setActivities(prev => [...prev, newActivity])
      setShowCreateModal(false)
      setActivityType(null)
    } catch (error) {
      console.error('Error creating activity:', error)
    }
  }

  const handleStartActivity = async (activity) => {
    try {
      await fetch(`${API_URL}/api/activities/${activity.id}/start`, { method: 'POST' })
      setCurrentActivity(activity)
      setResponses([])
      socket.emit('activity:start', { sessionCode, activity })
    } catch (error) {
      console.error('Error starting activity:', error)
    }
  }

  const handleStopActivity = async () => {
    if (!currentActivity) return

    try {
      await fetch(`${API_URL}/api/activities/${currentActivity.id}/stop`, { method: 'POST' })
      socket.emit('activity:stop', { sessionCode })
      setCurrentActivity(null)
    } catch (error) {
      console.error('Error stopping activity:', error)
    }
  }

  const openPresentationMode = () => {
    window.open(`/present/${sessionCode}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sessions')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Retour aux sessions"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {session?.name || 'Chargement...'}
              </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-gray-500">
                Code : <span className="font-mono font-bold text-primary-600">{sessionCode}</span>
              </span>
              <span className={`inline-flex items-center gap-1 text-sm ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{participants.length}</div>
              <div className="text-xs text-gray-500">participant{participants.length > 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={openPresentationMode}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Mode présentation
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Activities Panel */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Activités</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  + Nouvelle activité
                </button>
              </div>

              {currentActivity && (
                <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary-600 uppercase">En cours</span>
                      <h3 className="font-semibold text-gray-800">{currentActivity.title}</h3>
                      <p className="text-sm text-gray-500">{responses.length} réponse(s)</p>
                    </div>
                    <button
                      onClick={handleStopActivity}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Arrêter
                    </button>
                  </div>

                  {/* Live Results */}
                  <div className="mt-4">
                    {currentActivity.type === 'wordcloud' && (
                      <WordCloudResults responses={responses} />
                    )}
                    {currentActivity.type === 'quiz' && (
                      <QuizResults activity={currentActivity} responses={responses} />
                    )}
                    {currentActivity.type === 'poll' && (
                      <PollResults activity={currentActivity} responses={responses} />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucune activité créée. Cliquez sur "Nouvelle activité" pour commencer.
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase">
                          {activity.type === 'wordcloud' ? 'Nuage de mots' :
                           activity.type === 'quiz' ? 'Quiz' : 'Sondage'}
                        </span>
                        <h3 className="font-medium text-gray-800">{activity.title}</h3>
                      </div>
                      <button
                        onClick={() => handleStartActivity(activity)}
                        disabled={currentActivity !== null}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Lancer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Participants Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Participants</h2>
            <div className="space-y-2">
              {participants.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  En attente de participants...
                </p>
              ) : (
                participants.map((p, index) => (
                  <div
                    key={p.id || index}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                      {(p.nickname || 'A')[0].toUpperCase()}
                    </div>
                    <span className="text-sm">{p.nickname || 'Anonyme'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Activity Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowCreateModal(false)
              setActivityType(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {!activityType ? (
                  <>
                    <h2 className="text-xl font-bold mb-4">Nouvelle activité</h2>
                    <div className="grid gap-3">
                      <button
                        onClick={() => setActivityType('wordcloud')}
                        className="p-4 border-2 rounded-xl text-left hover:border-primary-500 transition-colors"
                      >
                        <div className="font-semibold">Nuage de mots</div>
                        <div className="text-sm text-gray-500">
                          Collectez les idées des participants sous forme de nuage
                        </div>
                      </button>
                      <button
                        onClick={() => setActivityType('quiz')}
                        className="p-4 border-2 rounded-xl text-left hover:border-primary-500 transition-colors"
                      >
                        <div className="font-semibold">Quiz</div>
                        <div className="text-sm text-gray-500">
                          QCM, Vrai/Faux ou questions ouvertes
                        </div>
                      </button>
                      <button
                        onClick={() => setActivityType('poll')}
                        className="p-4 border-2 rounded-xl text-left hover:border-primary-500 transition-colors"
                      >
                        <div className="font-semibold">Sondage rapide</div>
                        <div className="text-sm text-gray-500">
                          Oui/Non, échelle ou réactions emoji
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {activityType === 'wordcloud' && (
                      <WordCloudActivity
                        onSubmit={handleCreateActivity}
                        onCancel={() => setActivityType(null)}
                      />
                    )}
                    {activityType === 'quiz' && (
                      <QuizActivity
                        onSubmit={handleCreateActivity}
                        onCancel={() => setActivityType(null)}
                      />
                    )}
                    {activityType === 'poll' && (
                      <PollActivity
                        onSubmit={handleCreateActivity}
                        onCancel={() => setActivityType(null)}
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
