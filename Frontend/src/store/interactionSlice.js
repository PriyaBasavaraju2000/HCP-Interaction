import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchHCPs = createAsyncThunk('interaction/fetchHCPs', async (query) => {
  const res = await api.get(`/api/hcps?q=${encodeURIComponent(query || '')}`)
  return res.data
})

export const fetchMaterials = createAsyncThunk('interaction/fetchMaterials', async (query) => {
  const res = await api.get(`/api/materials?q=${encodeURIComponent(query || '')}`)
  return res.data
})

export const fetchSamples = createAsyncThunk('interaction/fetchSamples', async (query) => {
  const res = await api.get(`/api/samples?q=${encodeURIComponent(query || '')}`)
  return res.data
})

export const submitInteraction = createAsyncThunk('interaction/submit', async (data) => {
  const res = await api.post('/api/interactions', data)
  return res.data
})

const initialFormState = {
  hcp_id: null,
  hcp_name: '',
  interaction_type: 'Meeting',
  date: '',
  time: '',
  attendees: '',
  topics: '',
  sentiment: '',
  outcomes: '',
  follow_up: '',
  notes: '',
  material_ids: [],
  sample_entries: [],
}

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    form: { ...initialFormState },
    hcps: [],
    materials: [],
    samples: [],
    hcpsLoading: false,
    materialsLoading: false,
    samplesLoading: false,
    submitting: false,
    submitted: false,
    error: null,
  },
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload
      state.form[field] = value
    },
    updateMultipleFields: (state, action) => {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key in state.form) {
          state.form[key] = value
        }
      })
    },
    addMaterial: (state, action) => {
      if (!state.form.material_ids.includes(action.payload)) {
        state.form.material_ids.push(action.payload)
      }
    },
    removeMaterial: (state, action) => {
      state.form.material_ids = state.form.material_ids.filter(id => id !== action.payload)
    },
    addSampleEntry: (state, action) => {
      state.form.sample_entries.push(action.payload)
    },
    removeSampleEntry: (state, action) => {
      state.form.sample_entries = state.form.sample_entries.filter((_, i) => i !== action.payload)
    },
    resetForm: (state) => {
      state.form = { ...initialFormState }
      state.submitted = false
      state.error = null
    },
    clearSubmitted: (state) => {
      state.submitted = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (s) => { s.hcpsLoading = true })
      .addCase(fetchHCPs.fulfilled, (s, a) => { s.hcpsLoading = false; s.hcps = a.payload })
      .addCase(fetchHCPs.rejected, (s) => { s.hcpsLoading = false })
      .addCase(fetchMaterials.pending, (s) => { s.materialsLoading = true })
      .addCase(fetchMaterials.fulfilled, (s, a) => { s.materialsLoading = false; s.materials = a.payload })
      .addCase(fetchMaterials.rejected, (s) => { s.materialsLoading = false })
      .addCase(fetchSamples.pending, (s) => { s.samplesLoading = true })
      .addCase(fetchSamples.fulfilled, (s, a) => { s.samplesLoading = false; s.samples = a.payload })
      .addCase(fetchSamples.rejected, (s) => { s.samplesLoading = false })
      .addCase(submitInteraction.pending, (s) => { s.submitting = true; s.error = null })
      .addCase(submitInteraction.fulfilled, (s) => { s.submitting = false; s.submitted = true })
      .addCase(submitInteraction.rejected, (s, a) => { s.submitting = false; s.error = a.error.message })
  },
})

export const {
  updateField, updateMultipleFields,
  addMaterial, removeMaterial,
  addSampleEntry, removeSampleEntry,
  resetForm, clearSubmitted,
} = interactionSlice.actions

export default interactionSlice.reducer
