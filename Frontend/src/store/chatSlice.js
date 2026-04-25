import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ sessionId, message, currentFormData }) => {
  const res = await api.post('/api/chat', {
    session_id: sessionId,
    message,
    current_form_data: currentFormData,
  })
  return res.data
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    sessionId: '',
    loading: false,
    error: null,
  },
  reducers: {
    setSessionId: (state, action) => {
      state.sessionId = action.payload
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      })
    },
    clearChat: (state) => {
      state.messages = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: action.payload.response,
          extracted_data: action.payload.extracted_data,
          timestamp: new Date().toISOString(),
        })
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        state.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        })
      })
  },
})

export const { setSessionId, addUserMessage, clearChat } = chatSlice.actions
export default chatSlice.reducer
