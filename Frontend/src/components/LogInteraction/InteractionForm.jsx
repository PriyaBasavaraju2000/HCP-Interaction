import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  updateField, addMaterial, removeMaterial,
  addSampleEntry, removeSampleEntry, submitInteraction,
  resetForm, fetchHCPs, fetchMaterials, fetchSamples,
} from '../../store/interactionSlice'
import './InteractionForm.css'

export default function InteractionForm() {
  const dispatch = useDispatch()
  const { form, hcps, materials, samples, hcpsLoading, submitting, submitted } = useSelector(s => s.interaction)

  const [hcpSearch, setHcpSearch] = useState('')
  const [showHcpDropdown, setShowHcpDropdown] = useState(false)
  const [matSearch, setMatSearch] = useState('')
  const [showMatDropdown, setShowMatDropdown] = useState(false)
  const [showSampleDropdown, setShowSampleDropdown] = useState(false)
  const [sampleSearch, setSampleSearch] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const hcpRef = useRef(null)
  const matRef = useRef(null)
  const sampleRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (hcpRef.current && !hcpRef.current.contains(e.target)) setShowHcpDropdown(false)
      if (matRef.current && !matRef.current.contains(e.target)) setShowMatDropdown(false)
      if (sampleRef.current && !sampleRef.current.contains(e.target)) setShowSampleDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (submitted) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        dispatch(resetForm())
      }, 3000)
    }
  }, [submitted, dispatch])

  const debounceTimer = useRef(null)
  const searchHCPs = useCallback((q) => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => dispatch(fetchHCPs(q)), 300)
  }, [dispatch])

  const handleHcpSelect = (hcp) => {
    dispatch(updateField({ field: 'hcp_id', value: hcp.id }))
    dispatch(updateField({ field: 'hcp_name', value: hcp.name }))
    setHcpSearch(hcp.name)
    setShowHcpDropdown(false)
  }

  const handleChange = (field) => (e) => {
    dispatch(updateField({ field, value: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(submitInteraction(form))
  }

  const selectedMaterials = materials.filter(m => form.material_ids.includes(m.id))

  return (
    <form className="interaction-form" onSubmit={handleSubmit} id="interaction-form">
      {showSuccess && (
        <div className="success-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Interaction logged successfully!
        </div>
      )}

      {/* ─── Interaction Details ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Interaction Details
        </h2>

        <div className="form-row two-col">
          <div className="form-group" ref={hcpRef}>
            <label className="form-label" htmlFor="hcp-name">HCP Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                id="hcp-name"
                className="form-input"
                type="text"
                placeholder="Search or select HCP..."
                value={form.hcp_name || hcpSearch}
                onChange={(e) => {
                  setHcpSearch(e.target.value)
                  dispatch(updateField({ field: 'hcp_name', value: e.target.value }))
                  searchHCPs(e.target.value)
                  setShowHcpDropdown(true)
                }}
                onFocus={() => { setShowHcpDropdown(true); searchHCPs(hcpSearch) }}
                autoComplete="off"
              />
            </div>
            {showHcpDropdown && hcps.length > 0 && (
              <ul className="dropdown-list">
                {hcps.map(h => (
                  <li key={h.id} className="dropdown-item" onClick={() => handleHcpSelect(h)}>
                    <strong>{h.name}</strong>
                    {h.specialty && <span className="dropdown-sub">{h.specialty} — {h.hospital}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="interaction-type">Interaction Type</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <select
                id="interaction-type"
                className="form-input form-select"
                value={form.interaction_type}
                onChange={handleChange('interaction_type')}
              >
                <option value="Meeting">Meeting</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Conference">Conference</option>
                <option value="Lunch">Lunch</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-row two-col">
          <div className="form-group">
            <label className="form-label" htmlFor="interaction-date">Date</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <input
                id="interaction-date"
                className="form-input"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="interaction-time">Time</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <input
                id="interaction-time"
                className="form-input"
                type="time"
                value={form.time}
                onChange={handleChange('time')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Attendees ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Attendees
        </h2>
        <div className="form-group">
          <div className="input-wrapper">
            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <input
              id="attendees"
              className="form-input"
              type="text"
              placeholder="Enter names or search..."
              value={form.attendees}
              onChange={handleChange('attendees')}
            />
          </div>
        </div>
      </section>

      {/* ─── Topics Discussed ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Topics Discussed
        </h2>
        <div className="form-group">
          <textarea
            id="topics"
            className="form-textarea"
            placeholder="Enter key discussion points..."
            rows={3}
            value={form.topics}
            onChange={handleChange('topics')}
          />
        </div>
        <button type="button" className="voice-note-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          Summarize from Your Voice Note (Requires Consent)
        </button>
      </section>

      {/* ─── Materials & Samples ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Materials Shared / Samples Distributed
        </h2>

        <div className="subsection">
          <h3 className="subsection-title">Materials Shared</h3>
          <div className="chips-container">
            {selectedMaterials.map(m => (
              <span key={m.id} className="chip">
                {m.name}
                <button type="button" className="chip-remove" onClick={() => dispatch(removeMaterial(m.id))}>×</button>
              </span>
            ))}
          </div>
          <div className="form-group" ref={matRef}>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                id="material-search"
                className="form-input"
                type="text"
                placeholder="Search materials..."
                value={matSearch}
                onChange={(e) => {
                  setMatSearch(e.target.value)
                  dispatch(fetchMaterials(e.target.value))
                  setShowMatDropdown(true)
                }}
                onFocus={() => { setShowMatDropdown(true); dispatch(fetchMaterials(matSearch)) }}
              />
            </div>
            {showMatDropdown && materials.length > 0 && (
              <ul className="dropdown-list">
                {materials.filter(m => !form.material_ids.includes(m.id)).map(m => (
                  <li key={m.id} className="dropdown-item" onClick={() => { dispatch(addMaterial(m.id)); setShowMatDropdown(false); setMatSearch('') }}>
                    {m.name}
                    {m.type && <span className="dropdown-sub">{m.type}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="subsection">
          <h3 className="subsection-title">Samples Distributed</h3>
          {form.sample_entries.length === 0 && (
            <p className="empty-text">No samples added</p>
          )}
          {form.sample_entries.map((entry, idx) => {
            const sample = samples.find(s => s.id === entry.sample_id)
            return (
              <div key={idx} className="sample-row">
                <span className="sample-name">{sample?.name || `Sample #${entry.sample_id}`}</span>
                <span className="sample-qty">×{entry.quantity}</span>
                <button type="button" className="sample-remove" onClick={() => dispatch(removeSampleEntry(idx))}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )
          })}
          <div className="form-group" ref={sampleRef}>
            <button
              type="button"
              className="add-sample-btn"
              onClick={() => { setShowSampleDropdown(!showSampleDropdown); dispatch(fetchSamples(sampleSearch)) }}
            >
              + Add Sample
            </button>
            {showSampleDropdown && (
              <div className="sample-dropdown-panel">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Search samples..."
                  value={sampleSearch}
                  onChange={(e) => { setSampleSearch(e.target.value); dispatch(fetchSamples(e.target.value)) }}
                  autoFocus
                />
                <ul className="dropdown-list dropdown-list-inline">
                  {samples.map(s => (
                    <li key={s.id} className="dropdown-item" onClick={() => {
                      dispatch(addSampleEntry({ sample_id: s.id, quantity: 1 }))
                      setShowSampleDropdown(false)
                      setSampleSearch('')
                    }}>
                      {s.name}
                      {s.product && <span className="dropdown-sub">{s.product}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Sentiment ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Observed/Inferred HCP Sentiment
        </h2>
        <div className="sentiment-group">
          {['Positive', 'Neutral', 'Negative'].map(s => (
            <label key={s} className={`sentiment-option ${form.sentiment === s ? 'active' : ''}`} htmlFor={`sentiment-${s}`}>
              <input
                type="radio"
                id={`sentiment-${s}`}
                name="sentiment"
                value={s}
                checked={form.sentiment === s}
                onChange={handleChange('sentiment')}
              />
              <span className={`sentiment-dot sentiment-${s.toLowerCase()}`}></span>
              {s}
            </label>
          ))}
        </div>
      </section>

      {/* ─── Outcomes ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Outcomes
        </h2>
        <textarea
          id="outcomes"
          className="form-textarea"
          placeholder="Key outcomes or agreements..."
          rows={3}
          value={form.outcomes}
          onChange={handleChange('outcomes')}
        />
      </section>

      {/* ─── Follow-up ─── */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-dot"></span>
          Follow-up Actions
        </h2>
        <textarea
          id="follow-up"
          className="form-textarea"
          placeholder="Next steps or follow-up actions..."
          rows={3}
          value={form.follow_up}
          onChange={handleChange('follow_up')}
        />
      </section>

      {/* ─── Submit ─── */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => dispatch(resetForm())}>
          Reset
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-interaction">
          {submitting ? (
            <>
              <span className="spinner"></span>
              Saving...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Interaction
            </>
          )}
        </button>
      </div>
    </form>
  )
}
