import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#14B8A6', '#EF4444', '#6366F1']
const DARK_COLORS = ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA', '#2DD4BF', '#F87171', '#818CF8']

export default function WordCloudResults({ responses, darkMode = false }) {
  const words = useMemo(() => {
    const wordCounts = {}

    responses.forEach(response => {
      const answerWords = Array.isArray(response.answer) ? response.answer : [response.answer]
      answerWords.forEach(word => {
        if (typeof word === 'string') {
          const normalized = word.toLowerCase().trim()
          if (normalized) {
            wordCounts[normalized] = (wordCounts[normalized] || 0) + 1
          }
        }
      })
    })

    const maxCount = Math.max(...Object.values(wordCounts), 1)

    return Object.entries(wordCounts)
      .map(([text, count], index) => ({
        text,
        count,
        size: Math.max(1, Math.min(4, Math.ceil((count / maxCount) * 4))),
        color: (darkMode ? DARK_COLORS : COLORS)[index % COLORS.length]
      }))
      .sort(() => Math.random() - 0.5) // Shuffle
  }, [responses, darkMode])

  if (words.length === 0) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        En attente des réponses...
      </div>
    )
  }

  const sizeClasses = {
    1: 'text-lg',
    2: 'text-2xl',
    3: 'text-4xl',
    4: 'text-5xl'
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4 min-h-[200px]">
      <AnimatePresence>
        {words.map((word, index) => (
          <motion.span
            key={word.text}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
            className={`${sizeClasses[word.size]} font-bold cursor-default transition-transform hover:scale-110`}
            style={{ color: word.color }}
            title={`${word.count} fois`}
          >
            {word.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
