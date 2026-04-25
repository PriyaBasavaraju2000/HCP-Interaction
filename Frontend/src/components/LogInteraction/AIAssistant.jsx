import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sendMessage, addUserMessage } from '../../store/chatSlice'
import { updateMultipleFields } from '../../store/interactionSlice'
import './AIAssistant.css'

export default function AIAssistant() {
  const dispatch = useDispatch()
  const { messages, sessionId, loading } = useSelector(s => s.chat)
  const form = useSelector(s => s.interaction.form)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    dispatch(addUserMessage(text))

    const result = await dispatch(sendMessage({
      sessionId,
      message: text,
      currentFormData: form,
    }))

    // Auto-populate form fields from extracted data
    if (result.payload?.extracted_data) {
      const data = result.payload.extracted_data
      const fieldMap = {}
      if (data.hcp_name) fieldMap.hcp_name = data.hcp_name
      if (data.interaction_type) fieldMap.interaction_type = data.interaction_type
      if (data.date) fieldMap.date = data.date
      if (data.time) fieldMap.time = data.time
      if (data.attendees) fieldMap.attendees = data.attendees
      if (data.topics) fieldMap.topics = data.topics
      if (data.sentiment) fieldMap.sentiment = data.sentiment
      if (data.outcomes) fieldMap.outcomes = data.outcomes
      if (data.follow_up) fieldMap.follow_up = data.follow_up

      if (Object.keys(fieldMap).length > 0) {
        dispatch(updateMultipleFields(fieldMap))
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="ai-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"/>
            <rect x="2" y="2" width="20" height="8" rx="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2"/>
            <path d="M6 6h.01"/>
            <path d="M6 18h.01"/>
          </svg>
        </div>
        <div>
          <h2 className="ai-title">AI Assistant</h2>
          <p className="ai-subtitle">Log interactions naturally, I'll auto-fill</p>
        </div>
        <div className="ai-status">
          <span className="status-dot"></span>
          Online
        </div>
      </div>

      <div className="ai-messages" id="chat-messages">
        {messages.length === 0 && (
          <div className="ai-welcome">
            <div className="welcome-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="welcome-text">
              Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar assistant-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 8V4H8"/>
                  <rect x="2" y="2" width="20" height="8" rx="2"/>
                  <rect x="2" y="14" width="20" height="8" rx="2"/>
                </svg>
              </div>
            )}
            <div className={`message-bubble ${msg.role}-bubble`}>
              <p className="message-text">{msg.content}</p>
              {msg.extracted_data && Object.keys(msg.extracted_data).length > 0 && (
                <div className="extracted-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Form fields auto-populated
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-avatar assistant-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 8V4H8"/>
                <rect x="2" y="2" width="20" height="8" rx="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2"/>
              </svg>
            </div>
            <div className="message-bubble assistant-bubble">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <textarea
            id="chat-input"
            ref={inputRef}
            className="ai-input"
            placeholder="Describe interactions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            id="send-message"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
