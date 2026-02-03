import { useState } from 'react'

export default function PollActivity({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [pollType, setPollType] = useState('yesno')
  const [customOptions, setCustomOptions] = useState(['', ''])

  const pollTypes = {
    yesno: { label: 'Oui / Non', options: ['Oui', 'Non'] },
    scale5: { label: 'Échelle 1-5', options: ['1', '2', '3', '4', '5'] },
    scale10: { label: 'Échelle 1-10', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
    emoji: { label: 'Réactions emoji', options: ['😀', '🙂', '😐', '🙁', '😢'] },
    custom: { label: 'Personnalisé', options: customOptions.filter(o => o.trim()) }
  }

  const addCustomOption = () => {
    setCustomOptions([...customOptions, ''])
  }

  const removeCustomOption = (index) => {
    if (customOptions.length <= 2) return
    setCustomOptions(customOptions.filter((_, i) => i !== index))
  }

  const updateCustomOption = (index, value) => {
    const updated = [...customOptions]
    updated[index] = value
    setCustomOptions(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const options = pollType === 'custom'
      ? customOptions.filter(o => o.trim())
      : pollTypes[pollType].options

    if (options.length < 2) return

    onSubmit({
      type: 'poll',
      title,
      config: {
        pollType,
        options
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Nouveau sondage</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Comment évaluez-vous cette session ?"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de sondage
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(pollTypes).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPollType(key)}
                className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                  pollType === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {pollType === 'custom' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Options personnalisées
            </label>
            {customOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateCustomOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {customOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeCustomOption(index)}
                    className="px-3 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCustomOption}
              className="w-full py-2 text-sm text-primary-600 hover:text-primary-700"
            >
              + Ajouter une option
            </button>
          </div>
        )}

        {pollType !== 'custom' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Aperçu des options : </span>
            <span className="text-sm font-medium">
              {pollTypes[pollType].options.join(' • ')}
            </span>
          </div>
        )}
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
          disabled={!title.trim() || (pollType === 'custom' && customOptions.filter(o => o.trim()).length < 2)}
          className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Créer
        </button>
      </div>
    </form>
  )
}
