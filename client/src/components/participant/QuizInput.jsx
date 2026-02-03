import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function QuizInput({ activity, onSubmit }) {
  const questions = activity.config?.questions || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)

  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    if (!currentQuestion?.timeLimit) {
      setTimeLeft(null)
      return
    }

    setTimeLeft(currentQuestion.timeLimit)
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentIndex])

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentIndex]: answer })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onSubmit(answers)
    }
  }

  const isLastQuestion = currentIndex === questions.length - 1
  const hasAnswered = answers[currentIndex] !== undefined

  if (!currentQuestion) return null

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} / {questions.length}
        </span>
        {timeLeft !== null && (
          <span className={`text-sm font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
            {timeLeft}s
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full mb-6">
        <div
          className="h-1 bg-primary-500 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">{currentQuestion.text}</h2>

      {/* MCQ Options */}
      {currentQuestion.type === 'mcq' && (
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                answers[currentIndex] === index
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      )}

      {/* True/False */}
      {currentQuestion.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer('true')}
            className={`p-6 text-xl font-bold rounded-xl border-2 transition-all ${
              answers[currentIndex] === 'true'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Vrai
          </button>
          <button
            onClick={() => handleAnswer('false')}
            className={`p-6 text-xl font-bold rounded-xl border-2 transition-all ${
              answers[currentIndex] === 'false'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Faux
          </button>
        </div>
      )}

      {/* Free text */}
      {currentQuestion.type === 'freetext' && (
        <textarea
          value={answers[currentIndex] || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Votre réponse..."
          rows={4}
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!hasAnswered}
        className="w-full mt-6 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {isLastQuestion ? 'Terminer' : 'Question suivante'}
      </button>
    </motion.div>
  )
}
