import { API_URL } from './config'

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  return response
}
