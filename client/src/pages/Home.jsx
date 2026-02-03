import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSession } from '../context/SessionContext'

export default function Home() {
  const navigate = useNavigate()
  const { joinSession } = useSession()
  const [mode, setMode] = useState(null)
  const [sessionCode, setSessionCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoinSession = async (e) => {
    e.preventDefault()
    if (!sessionCode.trim()) return

    setLoading(true)
    setError('')

    try {
      await joinSession(sessionCode.toUpperCase(), nickname || 'Anonyme')
      navigate(`/participant/${sessionCode.toUpperCase()}`)
    } catch (err) {
      setError('Session non trouvée ou invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Formation Interactive
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Engagez vos participants en temps réel
        </p>

        {!mode ? (
          <div className="space-y-4">
            <button
              onClick={() => navigate('/sessions')}
              className="w-full py-4 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Je suis formateur
            </button>
            <button
              onClick={() => setMode('participant')}
              className="w-full py-4 px-6 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Je suis participant
            </button>
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleJoinSession}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code de session
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest uppercase"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre pseudo (optionnel)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !sessionCode.trim()}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Rejoindre'}
            </button>

            <button
              type="button"
              onClick={() => setMode(null)}
              className="w-full py-2 text-gray-500 hover:text-gray-700"
            >
              Retour
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  )
}
