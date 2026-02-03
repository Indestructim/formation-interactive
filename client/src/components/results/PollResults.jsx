import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#EF4444', '#6366F1', '#84CC16', '#F97316']

export default function PollResults({ activity, responses, darkMode = false }) {
  const options = activity.config?.options || []
  const pollType = activity.config?.pollType || 'custom'

  const data = useMemo(() => {
    const counts = {}
    options.forEach(opt => {
      counts[opt] = 0
    })

    responses.forEach(r => {
      if (r.answer && counts[r.answer] !== undefined) {
        counts[r.answer]++
      }
    })

    return options.map((opt, index) => ({
      name: opt,
      value: counts[opt],
      color: COLORS[index % COLORS.length]
    })).filter(d => d.value > 0)
  }, [options, responses])

  const total = responses.length

  if (responses.length === 0) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        En attente des réponses...
      </div>
    )
  }

  const isEmoji = pollType === 'emoji'
  const isScale = pollType === 'scale5' || pollType === 'scale10'

  if (isEmoji || isScale) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {options.map((opt, index) => {
          const count = responses.filter(r => r.answer === opt).length
          const percentage = total > 0 ? (count / total) * 100 : 0

          return (
            <div key={index} className="flex items-center gap-4">
              <span className={`w-12 text-center ${isEmoji ? 'text-2xl' : 'font-bold'}`}>
                {opt}
              </span>
              <div className="flex-1">
                <div className={`h-8 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
              </div>
              <span className={`w-16 text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {count} ({Math.round(percentage)}%)
              </span>
            </div>
          )
        })}
        <p className={`text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {total} réponse{total > 1 ? 's' : ''}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ height: darkMode ? 350 : 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1F2937' : '#fff',
                borderColor: darkMode ? '#374151' : '#E5E7EB',
                color: darkMode ? '#F9FAFB' : '#111827'
              }}
            />
            <Legend
              wrapperStyle={{ color: darkMode ? '#D1D5DB' : '#374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {total} réponse{total > 1 ? 's' : ''}
      </p>
    </motion.div>
  )
}
