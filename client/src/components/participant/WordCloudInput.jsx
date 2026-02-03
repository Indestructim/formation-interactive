import { useState } from 'react'
import { motion } from 'framer-motion'

export default function WordCloudInput({ activity, onSubmit }) {
  const maxWords = activity.config?.maxWords || 3
  const [words, setWords] = useState(Array(maxWords).fill(''))

  const updateWord = (index, value) => {
    const updated = [...words]
    updated[index] = value.trim().toLowerCase()
    setWords(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validWords = words.filter(w => w.trim())
    if (validWords.length === 0) return
    onSubmit(validWords)
  }

  const validWordsCount = words.filter(w => w.trim()).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-2">{activity.title}</h2>
      <p className="text-gray-500 text-sm mb-6">
        Entrez jusqu'à {maxWords} mot{maxWords > 1 ? 's' : ''}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {words.map((word, index) => (
          <input
            key={index}
            type="text"
            value={word}
            onChange={(e) => updateWord(index, e.target.value)}
            placeholder={`Mot ${index + 1}`}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg"
            autoFocus={index === 0}
          />
        ))}

        <button
          type="submit"
          disabled={validWordsCount === 0}
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Envoyer {validWordsCount > 0 ? `(${validWordsCount} mot${validWordsCount > 1 ? 's' : ''})` : ''}
        </button>
      </form>
    </motion.div>
  )
}
