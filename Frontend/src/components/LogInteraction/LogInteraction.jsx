import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setSessionId } from '../../store/chatSlice'
import { fetchHCPs, fetchMaterials, fetchSamples } from '../../store/interactionSlice'
import InteractionForm from './InteractionForm'
import AIAssistant from './AIAssistant'
import './LogInteraction.css'

export default function LogInteraction() {
  const dispatch = useDispatch()

  useEffect(() => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    dispatch(setSessionId(id))
    dispatch(fetchHCPs(''))
    dispatch(fetchMaterials(''))
    dispatch(fetchSamples(''))
  }, [dispatch])

  return (
    <div className="log-interaction-page">
      <header className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Log HCP Interaction</h1>
            <p className="page-subtitle">Record and manage healthcare professional interactions</p>
          </div>
        </div>
      </header>

      <div className="log-interaction-layout">
        <div className="form-panel">
          <InteractionForm />
        </div>
        <div className="chat-panel">
          <AIAssistant />
        </div>
      </div>
    </div>
  )
}
