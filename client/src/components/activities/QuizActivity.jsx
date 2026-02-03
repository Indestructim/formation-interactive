import { useState } from 'react'

export default function QuizActivity({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([
    { text: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: 0, timeLimit: null }
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: 0, timeLimit: null }
    ])
  }

  const removeQuestion = (index) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (questions.some(q => !q.text.trim())) return

    onSubmit({
      type: 'quiz',
      title,
      config: { questions }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-auto">
      <h2 className="text-xl font-bold mb-4">Nouveau quiz</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du quiz
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quiz sur les fondamentaux React"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Question {qIndex + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                placeholder="Intitulé de la question"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              <div className="flex gap-2">
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="mcq">QCM</option>
                  <option value="truefalse">Vrai/Faux</option>
                  <option value="freetext">Texte libre</option>
                </select>

                <select
                  value={question.timeLimit || ''}
                  onChange={(e) => updateQuestion(qIndex, 'timeLimit', e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Pas de limite</option>
                  <option value="15">15 secondes</option>
                  <option value="30">30 secondes</option>
                  <option value="60">1 minute</option>
                  <option value="120">2 minutes</option>
                </select>
              </div>

              {question.type === 'mcq' && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Options de réponse :</label>
                  {question.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        className="text-primary-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Sélectionnez la bonne réponse</p>
                </div>
              )}

              {question.type === 'truefalse' && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctAnswer === 'true'}
                      onChange={() => updateQuestion(qIndex, 'correctAnswer', 'true')}
                      className="text-primary-600"
                    />
                    <span>Vrai</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctAnswer === 'false'}
                      onChange={() => updateQuestion(qIndex, 'correctAnswer', 'false')}
                      className="text-primary-600"
                    />
                    <span>Faux</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
        >
          + Ajouter une question
        </button>
      </div>

      <div className="flex gap-3 mt-6 sticky bottom-0 bg-white py-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={!title.trim() || questions.some(q => !q.text.trim())}
          className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Créer
        </button>
      </div>
    </form>
  )
}
