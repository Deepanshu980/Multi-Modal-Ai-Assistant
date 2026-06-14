import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // Increased to 120 seconds for Gemini API calls
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

/**
 * Send a text message to the chat endpoint
 * @param {string} message - User's text message
 * @param {Array} history - Conversation history
 * @param {string} sessionId - Session identifier
 * @returns {Promise<{response: string, session_id: string}>}
 */
export const sendMessage = async (message, history = [], sessionId = null) => {
  const payload = {
    message,
    history: history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    ...(sessionId && { session_id: sessionId }),
  }

  const { data } = await api.post('/chat', payload)
  return data
}

/**
 * Upload audio blob for transcription
 * @param {Blob} audioBlob - Recorded audio blob
 * @returns {Promise<{text: string, language?: string, duration?: number}>}
 */
export const uploadAudio = async (audioBlob) => {
  const formData = new FormData()
  const filename = `recording_${Date.now()}.webm`
  formData.append('audio', audioBlob, filename)

  const { data } = await api.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Get a fresh AI response (for regeneration)
 * @param {string} message - The message to get a response for
 * @param {Array} history - Conversation history
 * @returns {Promise<{response: string}>}
 */
export const getResponse = async (message, history = []) => {
  const { data } = await api.post('/chat', {
    message,
    history: history.map((msg) => ({ role: msg.role, content: msg.content })),
    regenerate: true,
  })
  return data
}

/**
 * Send voice message and get voice response
 * @param {Blob} audioBlob - Recorded audio blob
 * @param {Array} history - Conversation history (optional)
 * @returns {Promise<Blob>} - Audio response blob
 */
export const sendVoiceMessage = async (audioBlob) => {
  const formData = new FormData()
  const filename = `voice_message_${Date.now()}.webm`
  formData.append('audio', audioBlob, filename)

  const response = await api.post('/voice/chat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  })
  return response.data
}

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  const { data } = await api.get('/health')
  return data
}

export default api
