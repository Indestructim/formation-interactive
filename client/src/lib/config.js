export const API_URL = import.meta.env.VITE_API_URL || ''

// Debug: log API URL in development
if (import.meta.env.DEV) {
  console.log('API_URL:', API_URL)
}

// Log in production too for debugging deployment issues
console.log('[Config] API_URL configured as:', API_URL || '(empty - using relative paths)')
