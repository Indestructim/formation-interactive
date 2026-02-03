import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6']

export default function QuizResults({ activity, responses, darkMode = false }) {
  const questions = activity.config?.questions || []

  const stats = useMemo(() => {
    return questions.map((question, qIndex) => {
      const questionResponses = responses.filter(r => r.answer && r.answer[qIndex] !== undefined)

      if (question.type === 'mcq') {
        const optionCounts = question.options.map((opt, oIndex) => ({
          name: opt,
          count: questionResponses.filter(r => r.answer[qIndex] === oIndex).length,
          isCorrect: oIndex === question.correctAnswer
        }))
        return { question, optionCounts, total: questionResponses.length }
      }

      if (question.type === 'truefalse') {
        const trueCount = questionResponses.filter(r => r.answer[qIndex] === 'true').length
        const falseCount = questionResponses.filter(r => r.answer[qIndex] === 'false').length
        return {
          question,
          optionCounts: [
            { name: 'Vrai', count: trueCount, isCorrect: question.correctAnswer === 'true' },
            { name: 'Faux', count: falseCount, isCorrect: question.correctAnswer === 'false' }
          ],
          total: questionResponses.length
        }
      }

      if (question.type === 'freetext') {
        return {
          question,
          freeTextAnswers: questionResponses.map(r => r.answer[qIndex]),
          total: questionResponses.length
        }
      }

      return null
    }).filter(Boolean)
  }, [questions, responses])

  if (responses.length === 0) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        En attente des réponses...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-gray-50'}`}
        >
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Q{index + 1}. {stat.question.text}
          </h3>

          {stat.optionCounts && (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stat.optionCounts} layout="vertical">
                  <XAxis type="number" allowDecimals={false} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: darkMode ? '#D1D5DB' : '#374151' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#fff',
                      borderColor: darkMode ? '#374151' : '#E5E7EB',
                      color: darkMode ? '#F9FAFB' : '#111827'
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {stat.optionCounts.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.isCorrect ? '#10B981' : COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {stat.freeTextAnswers && (
            <div className="space-y-2 max-h-48 overflow-auto">
              {stat.freeTextAnswers.map((answer, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${darkMode ? 'bg-white/5' : 'bg-white'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  "{answer}"
                </div>
              ))}
            </div>
          )}

          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {stat.total} réponse{stat.total > 1 ? 's' : ''}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
