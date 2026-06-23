import React, { useRef, useState, useEffect } from 'react'
import ElementRenderer from './ElementRenderer'
import { DashboardAPI } from '../lib/api'

export default function Section({ section, isSelected, selectedElementId, onSelectSection, onSelectElement, onUpdateSection, onUpdateElement, onEditChart, scale = 1 }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title)
  const sectionRef = useRef(null)

  useEffect(() => {
    if (isSelected && section.title === 'New Section') {
      setTitleDraft(section.title)
      setEditingTitle(true)
    }
  }, [isSelected])

  const startSectionDrag = (e) => {
    if (e.target.closest('.canvas-element') || e.target.closest('.resize-br') || e.target.closest('.el-resize') || e.target.closest('.canvas-section__label-input')) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origX = section.x
    const origY = section.y

    const onMove = (me) => {
      const dx = (me.clientX - startX) / scale
      const dy = (me.clientY - startY) / scale
      onUpdateSection({ ...section, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const startSectionResize = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origW = section.width
    const origH = section.height

    const onMove = (me) => {
      const dx = (me.clientX - startX) / scale
      const dy = (me.clientY - startY) / scale
      onUpdateSection({ ...section, width: Math.max(200, origW + dx), height: Math.max(120, origH + dy) })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const startElementDrag = (e, element) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origX = element.x
    const origY = element.y

    const onMove = (me) => {
      const dx = (me.clientX - startX) / scale
      const dy = (me.clientY - startY) / scale
      onUpdateElement(section.id, { ...element, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

 const handleImageUpload = async (e, element) => {
  const file = e.target.files[0]

  if (!file) return

  try {
    const result = await DashboardAPI.uploadImage(file)

    onUpdateElement(
      section.id,
      {
        ...element,
        src: result.data.path || result.data.url,
      }
    )
  } catch (err) {
    console.error('Image upload failed', err)
    alert('Image upload failed')
  }
}

  return (
    <div
      ref={sectionRef}
      className={`canvas-section ${isSelected ? 'canvas-section--selected' : ''}`}
      style={{
        position: 'absolute',
        left: section.x,
        top: section.y,
        width: section.width,
        height: section.height,
      }}
      onClick={e => { e.stopPropagation(); onSelectSection(section) }}
      onMouseDown={startSectionDrag}
    >
      {editingTitle ? (
        <input
          className="canvas-section__label-input"
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          onBlur={() => {
            setEditingTitle(false)
            onUpdateSection({ ...section, title: titleDraft || 'Section' })
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') { setEditingTitle(false); onUpdateSection({ ...section, title: titleDraft || 'Section' }) }
            if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(section.title) }
          }}
          onMouseDown={e => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <div
          className="canvas-section__label"
          title="Double-click to rename"
          onDoubleClick={e => { e.stopPropagation(); setTitleDraft(section.title); setEditingTitle(true) }}
        >
          {section.title}
        </div>
      )}
      {section.elements.map(element => (
        <ElementRenderer
          key={element.id}
          element={element}
          isSelected={selectedElementId === element.id}
          scale={scale}
          onSelect={el => onSelectElement(el)}
          onUpdate={updated => onUpdateElement(section.id, updated)}
          onDragStart={(e, el) => startElementDrag(e, el)}
          onDoubleClick={el => {
            if (el.type === 'image') {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => handleImageUpload(e, el)
              input.click()
            } else if (el.type === 'bar-chart' || el.type === 'line-chart') {
              onEditChart && onEditChart(el)
            }
          }}
        />
      ))}
      <div className="resize-br" onMouseDown={startSectionResize} title="Resize section" />
    </div>
  )
}
