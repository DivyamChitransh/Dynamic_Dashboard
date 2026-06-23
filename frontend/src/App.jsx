import React, { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import { DashboardAPI } from './lib/api'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import ChartEditModal from './components/ChartEditModal'

const DEFAULT_SECTION = () => ({
  id: `section-${Date.now()}`,
  title: 'New Section',
  x: 60,
  y: 60,
  width: 600,
  height: 300,
  elements: [],
})

const DEFAULT_ELEMENT = (type, formatting) => {
  const base = { id: `el-${Date.now()}`, type, x: 20, y: 40 }
  if (type === 'text') return { ...base, width: 200, height: 40, content: 'New text', fontSize: parseInt(formatting.fontSize), fontWeight: formatting.bold ? 'bold' : 'normal', fontStyle: formatting.italic ? 'italic' : 'normal', color: formatting.color || '#1e293b', fontFamily: formatting.fontFamily || 'Inter' }
  if (type === 'bar-chart') return { ...base, width: 300, height: 240, chartTitle: 'Monthly Revenue', labels: ['Jan','Feb','Mar','Apr','May','Jun'], values: [42,58,45,70,65,85], datasetLabel: 'Revenue ($K)' }
  if (type === 'line-chart') return { ...base, width: 300, height: 240, chartTitle: 'User Growth', labels: ['Jan','Feb','Mar','Apr','May','Jun'], values: [1200,1900,1500,2400,2800,3200], datasetLabel: 'Active Users' }
  if (type === 'image') return { ...base, width: 240, height: 180, src: null }
  return base
}

export default function App() {
  const [layoutId, setLayoutId] = useState(null)
  const [dashboardName, setDashboardName] = useState('My Dashboard')
  const [sections, setSections] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [toast, setToast] = useState(null)
  const [formatting, setFormatting] = useState({ bold: false, italic: false, fontSize: '14', color: '#1e293b', fontFamily: 'Inter' })
  const [scale, setScale] = useState(0.85)
  const [editingChart, setEditingChart] = useState(null)
  const saveTimer = useRef(null)

  useEffect(() => { loadLayout()}, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadLayout = async () => {
  try {
    setSaveStatus('loading');

    const response = await DashboardAPI.loadDashboard(1);

    const dashboard = response.data.dashboard;
    const apiSections = response.data.sections || [];

    const mappedSections = apiSections.map((section) => ({ id: `section-${section.id}`,
      title: section.title,
      x: Number(section.pos_x),
      y: Number(section.pos_y),
      width: Number(section.width),
      height: Number(section.height),
      elements: (section.elements || []).map((el) => ({id: `el-${el.id}`, type: el.element_type === 'bar_chart' ? 'bar-chart' : el.element_type === 'line_chart' ? 'line-chart' : el.element_type,
      x: Number(el.pos_x), y: Number(el.pos_y), width: Number(el.width), height: Number(el.height), ...(el.content || {}),})),}));

    setLayoutId(dashboard.id);
    setDashboardName(dashboard.name);
    setSections(mappedSections);

    setSaveStatus('loaded');
  } catch (err) {
    setSaveStatus('error');
    showToast(err.message, 'error');
  }
};


  const saveLayout = async () => {
  try {
    setSaveStatus('saving');

    const payload = { dashboard_id: layoutId || 1, name: dashboardName, sections: sections.map((section, index) => ({
      title: section.title,
      pos_x: section.x,
      pos_y: section.y,
      width: section.width,
      height: section.height,
      z_index: index,
      sort_order: index + 1,
      elements: section.elements.map((el, elIndex) => ({element_type: el.type === 'bar-chart' ? 'bar_chart' : el.type === 'line-chart' ? 'line_chart' : el.type,
      pos_x: el.x,
      pos_y: el.y,
      width: el.width,
      height: el.height,
      z_index: elIndex,
      content: {
        content: el.content,
        src: el.src,
        chartTitle: el.chartTitle,
        labels: el.labels,
        values: el.values,
        datasetLabel: el.datasetLabel,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        color: el.color,
        fontFamily: el.fontFamily,
      },
    })),
  })),
};

    await DashboardAPI.saveDashboard(payload);

    setSaveStatus('saved');
    showToast('Layout saved!');
  } catch (err) {
    setSaveStatus('error');
    showToast(err.message, 'error');
  }
};

  const scheduleAutoSave = () => {
     if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveLayout()
      }, 2000)
    }

  const addSection = () => {
    const s = DEFAULT_SECTION()
    setSections(prev => [...prev, s])
    setSelectedSectionId(s.id)
    setSelectedElementId(null)
    scheduleAutoSave()
  }

  const addElement = (type) => {
    if (!selectedSectionId) return
    const el = DEFAULT_ELEMENT(type, formatting)
    setSections(prev => prev.map(s =>
      s.id === selectedSectionId ? { ...s, elements: [...s.elements, el] } : s
    ))
    setSelectedElementId(el.id)
    scheduleAutoSave()
  }

  const updateSection = (updated) => {
    setSections(prev => prev.map(s => s.id === updated.id ? updated : s))
    scheduleAutoSave()
  }

  const updateElement = (sectionId, updated) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, elements: s.elements.map(el => el.id === updated.id ? updated : el) }
        : s
    ))
    scheduleAutoSave()
  }

  const deleteSelected = () => {
    if (selectedElementId) {
      setSections(prev => prev.map(s => ({
        ...s,
        elements: s.elements.filter(el => el.id !== selectedElementId)
      })))
      setSelectedElementId(null)
    } else if (selectedSectionId) {
      setSections(prev => prev.filter(s => s.id !== selectedSectionId))
      setSelectedSectionId(null)
    }
    scheduleAutoSave()
  }

  const selectedElement = sections.flatMap(s => s.elements).find(el => el.id === selectedElementId) || null


  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
      setFormatting({
        bold: selectedElement.fontWeight === 'bold',
        italic: selectedElement.fontStyle === 'italic',
        fontSize: String(selectedElement.fontSize || 14),
        color: selectedElement.color || '#1e293b',
        fontFamily: selectedElement.fontFamily || 'Inter',
      })
    }
  }, [selectedElementId])

  const handleFormattingChange = (key, val) => {
    setFormatting(f => ({ ...f, [key]: val }))
    
    if (selectedElementId) {
      const el = sections.flatMap(s => s.elements).find(e => e.id === selectedElementId)
      if (el && el.type === 'text') {
        const updates = { ...el }
        if (key === 'bold') updates.fontWeight = val ? 'bold' : 'normal'
        if (key === 'italic') updates.fontStyle = val ? 'italic' : 'normal'
        if (key === 'fontSize') updates.fontSize = parseInt(val)
        if (key === 'color') updates.color = val
        if (key === 'fontFamily') updates.fontFamily = val
        const section = sections.find(s => s.elements.some(e => e.id === selectedElementId))
        if (section) updateElement(section.id, updates)
      }
    }
  }

  const statusLabel = { idle: '', loading: 'Loading...', loaded: 'Loaded', saving: 'Saving...', saved: 'Saved', error: 'Error' }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="topbar__logo">SHR</div>
          <div>
            <h1 className="topbar__title">Dashboard Builder</h1>
            <p className="topbar__subtitle">Dynamic Dashboard Builder</p>
          </div>
        </div>

        <div className="topbar__center">
          <input
            className="dashboard-name-input"
            value={dashboardName}
            onChange={e => { setDashboardName(e.target.value); scheduleAutoSave() }}
            placeholder="Dashboard name"
          />
        </div>

        <div className="topbar__actions">
          <span className={`save-status save-status--${saveStatus}`}>{statusLabel[saveStatus]}</span>
          <div className="zoom-controls">
            <button className="tool-btn" onClick={() => setScale(s => Math.max(0.4, +(s - 0.1).toFixed(1)))} title="Zoom out">−</button>
            <span className="zoom-label">{Math.round(scale * 100)}%</span>
            <button className="tool-btn" onClick={() => setScale(s => Math.min(1.5, +(s + 0.1).toFixed(1)))} title="Zoom in">+</button>
          </div>
          <button className="btn btn--primary" onClick={saveLayout} disabled={saveStatus === 'saving'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save Layout
          </button>
          <button className="btn btn--ghost" onClick={loadLayout}>Reload</button>
        </div>
      </header>

      <div className="workspace">
        <Sidebar
          onAddSection={addSection}
          onAddElement={addElement}
          selectedSection={sections.find(s => s.id === selectedSectionId)}
          selectedElement={selectedElement}
          onDeleteSelected={deleteSelected}
          formatting={formatting}
          onFormattingChange={handleFormattingChange}
        />

        <main className="canvas-area">
          <div className="canvas-area__toolbar">
            <span className="canvas-hint">Drag sections &amp; elements · Double-click text to edit · Drag handles to resize</span>
          </div>
          <Canvas
            sections={sections}
            selectedSectionId={selectedSectionId}
            selectedElementId={selectedElementId}
            onSelectSection={s => { setSelectedSectionId(s.id); setSelectedElementId(null) }}
            onSelectElement={el => { setSelectedElementId(el.id) }}
            onUpdateSection={updateSection}
            onUpdateElement={updateElement}
            onClearSelection={() => { setSelectedSectionId(null); setSelectedElementId(null) }}
            onEditChart={el => setEditingChart(el)}
            scale={scale}
          />
        </main>
      </div>

      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}

      {editingChart && (
        <ChartEditModal
          element={editingChart}
          onClose={() => setEditingChart(null)}
          onSave={updated => {
            const section = sections.find(s => s.elements.some(e => e.id === updated.id))
            if (section) updateElement(section.id, updated)
            setEditingChart(null)
          }}
        />
      )}
    </div>
  )
}
