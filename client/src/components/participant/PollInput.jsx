import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PollInput({ activity, onSubmit }) {
  const [selected, setSelected] = useState(null)
  const options = activity.config?.options || []
  const pollType = activity.config?.pollType || 'custom'

  const handleSubmit = () => {
    if (selected === null) return
    onSubmit(options[selected])
  }

  const isEmoji = pollType === 'emoji'
  const isScale = pollType === 'scale5' || pollType === 'scale10'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">{activity.title}</h2>

      {isEmoji ? (
        <div className="flex justify-center gap-4">
          {options.map((emoji, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`text-5xl p-4 rounded-xl transition-all ${
                selected === index
                  ? 'bg-primary-100 scale-125'
                  : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : isScale ? (
        <div className="flex justify-center gap-2">
          {options.map((value, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`w-12 h-12 rounded-full text-lg font-bold transition-all ${
                selected === index
                  ? 'bg-primary-600 text-white scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                selected === index
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selected === null}
        className="w-full mt-6 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        Valider
      </button>
    </motion.div>
  )
}
