import React from 'react'

const ELEMENT_TYPES = [
  { type: 'text', icon: '𝐓', label: 'Text' },
  { type: 'image', icon: '🖼', label: 'Image' },
  { type: 'bar-chart', icon: '📊', label: 'Bar Chart' },
  { type: 'line-chart', icon: '📈', label: 'Line Chart' },
]

export default function Sidebar({ onAddSection, onAddElement, selectedSection, selectedElement, onDeleteSelected, formatting, onFormattingChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-group">
        <div className="sidebar-group__header">
          <span className="sidebar-group__label">Sections</span>
        </div>
        <p className="sidebar-hint">Containers that hold your elements</p>
        <button className="btn btn--primary btn--block" onClick={onAddSection}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Section
        </button>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-group__header">
          <span className="sidebar-group__label">Elements</span>
        </div>
        {!selectedSection
          ? <p className="sidebar-hint">Select a section first, then add elements</p>
          : <p className="sidebar-hint">Click to add to selected section</p>
        }
        <div className="element-grid">
          {ELEMENT_TYPES.map(({ type, icon, label }) => (
            <button
              key={type}
              className={`element-btn ${!selectedSection ? 'element-btn--disabled' : ''}`}
              onClick={() => selectedSection && onAddElement(type)}
              title={!selectedSection ? 'Select a section first' : `Add ${label}`}
            >
              <span className="element-btn__icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-group__header">
          <span className="sidebar-group__label">Text Formatting</span>
        </div>
        <div className="toolbar-row">
          <button
            className={`tool-btn ${formatting.bold ? 'tool-btn--active' : ''}`}
            onClick={() => onFormattingChange('bold', !formatting.bold)}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className={`tool-btn ${formatting.italic ? 'tool-btn--active' : ''}`}
            onClick={() => onFormattingChange('italic', !formatting.italic)}
            title="Italic"
          >
            <em>I</em>
          </button>
          <select
            className="tool-select"
            value={formatting.fontSize}
            onChange={e => onFormattingChange('fontSize', e.target.value)}
            disabled={!selectedElement || selectedElement.type !== 'text'}
          >
            {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(s => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
        </div>
        <div className="toolbar-row" style={{ marginTop: 8 }}>
          <input
            type="color"
            className="tool-color"
            value={formatting.color || '#1e293b'}
            onChange={e => onFormattingChange('color', e.target.value)}
            disabled={!selectedElement || selectedElement.type !== 'text'}
            title="Text color"
          />
          <span className="sidebar-hint" style={{ margin: 0 }}>Text color</span>
        </div>
        <div className="toolbar-row" style={{ marginTop: 8 }}>
          <select
            className="tool-select"
            value={formatting.fontFamily || 'Inter'}
            onChange={e => onFormattingChange('fontFamily', e.target.value)}
            disabled={!selectedElement || selectedElement.type !== 'text'}
          >
            {['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'monospace', 'serif', 'sans-serif'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <p className="sidebar-hint" style={{ marginTop: 8 }}>Double-click text on canvas to edit.</p>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-group__header">
          <span className="sidebar-group__label">Selection</span>
        </div>
        {selectedElement
          ? <p className="sidebar-hint">Type: {selectedElement.type}</p>
          : selectedSection
          ? <p className="sidebar-hint">Section selected</p>
          : <p className="sidebar-hint">Nothing selected</p>
        }
        {(selectedElement || selectedSection) && (
          <button className="btn btn--danger btn--block" onClick={onDeleteSelected}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            Delete Selected
          </button>
        )}
      </div>
    </aside>
  )
}
