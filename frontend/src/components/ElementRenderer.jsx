import React, { useState, useRef, useEffect } from 'react'
import BarChartWidget from './BarChartWidget'
import LineChartWidget from './LineChartWidget'

const MIN_W = 80
const MIN_H = 32

export default function ElementRenderer({ element, isSelected, onSelect, onUpdate, onDragStart, onDoubleClick, scale = 1 }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(element.content || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const handleDblClick = (e) => {
    e.stopPropagation()
    if (element.type === 'text') {
      setDraft(element.content || '')
      setEditing(true)
      return
    }
    onDoubleClick && onDoubleClick(element)
  }

  const commitEdit = () => {
    setEditing(false)
    onUpdate({ ...element, content: draft })
  }

  // Resize from bottom-right corner
  const startResize = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origW = element.width || MIN_W
    const origH = element.height || MIN_H

    const onMove = (me) => {
      const dx = (me.clientX - startX) / scale
      const dy = (me.clientY - startY) / scale
      onUpdate({ ...element, width: Math.max(MIN_W, origW + dx), height: Math.max(MIN_H, origH + dy) })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const elWidth = element.width || (element.type === 'text' ? 160 : 280)
  const elHeight = element.height || (element.type === 'text' ? 'auto' : 220)

  const renderContent = () => {
    if (element.type === 'text') {
      if (editing) {
        return (
          <textarea
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() }
              if (e.key === 'Escape') commitEdit()
            }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              minWidth: 80,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: element.fontFamily || 'Inter',
              fontSize: element.fontSize || 14,
              fontWeight: element.fontWeight === 'bold' ? 700 : 400,
              fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal',
              color: element.color || '#1e293b',
              lineHeight: 1.4,
              padding: 4,
            }}
          />
        )
      }
      return (
        <div style={{
          width: '100%',
          height: '100%',
          fontFamily: element.fontFamily || 'Inter',
          fontSize: element.fontSize || 14,
          fontWeight: element.fontWeight === 'bold' ? 700 : 400,
          fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal',
          color: element.color || '#1e293b',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          padding: 4,
          overflow: 'hidden',
        }}>
          {element.content || 'Double-click to edit'}
        </div>
      )
    }

    if (element.type === 'bar-chart') {
      return (
        <div style={{ width: '100%', height: '100%', padding: '8px 4px 4px' }}>
          <BarChartWidget
            title={element.chartTitle}
            labels={element.labels}
            values={element.values}
            datasetLabel={element.datasetLabel}
          />
        </div>
      )
    }

    if (element.type === 'line-chart') {
      return (
        <div style={{ width: '100%', height: '100%', padding: '8px 4px 4px' }}>
          <LineChartWidget
            title={element.chartTitle}
            labels={element.labels}
            values={element.values}
            datasetLabel={element.datasetLabel}
          />
        </div>
      )
    }

    if (element.type === 'image') {
      return element.src
        ? <img
            src={element.src}
            alt="uploaded"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, display: 'block' }}
          />
        : (
          <div style={{
            width: '100%', height: '100%',
            background: 'rgba(148,163,184,0.1)',
            border: '2px dashed #475569',
            borderRadius: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, color: '#64748b', fontSize: 12,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Double-click to upload
          </div>
        )
    }

    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: elWidth,
        height: elHeight,
        cursor: 'move',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
      className={`canvas-element ${isSelected ? 'canvas-element--selected' : ''}`}
      onMouseDown={e => { e.stopPropagation(); onDragStart && onDragStart(e, element) }}
      onClick={e => { e.stopPropagation(); onSelect(element) }}
      onDoubleClick={handleDblClick}
    >
      {renderContent()}

      {isSelected && (
        <>
          {/* Resize handles */}
          <div className="el-resize el-resize--br" onMouseDown={startResize} title="Resize" />
          <div className="el-resize el-resize--r" onMouseDown={(e) => {
            e.stopPropagation(); e.preventDefault()
            const startX = e.clientX
            const origW = element.width || elWidth
            const onMove = (me) => onUpdate({ ...element, width: Math.max(MIN_W, origW + (me.clientX - startX) / scale) })
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
            window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
          }} title="Resize width" />
          <div className="el-resize el-resize--b" onMouseDown={(e) => {
            e.stopPropagation(); e.preventDefault()
            const startY = e.clientY
            const origH = element.height || (typeof elHeight === 'number' ? elHeight : 40)
            const onMove = (me) => onUpdate({ ...element, height: Math.max(MIN_H, origH + (me.clientY - startY) / scale) })
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
            window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
          }} title="Resize height" />
        </>
      )}
    </div>
  )
}
