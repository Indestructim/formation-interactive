import { useState } from 'react'

export default function WordCloudActivity({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [maxWords, setMaxWords] = useState(3)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      type: 'wordcloud',
      title,
      config: { maxWords }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Nouveau nuage de mots</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question / Sujet
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quels mots vous viennent à l'esprit quand on dit 'innovation' ?"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre max de mots par participant
          </label>
          <select
            value={maxWords}
            onChange={(e) => setMaxWords(Number(e.target.value))}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={1}>1 mot</option>
            <option value={2}>2 mots</option>
            <option value={3}>3 mots</option>
            <option value={5}>5 mots</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Créer
        </button>
      </div>
    </form>
  )
}
