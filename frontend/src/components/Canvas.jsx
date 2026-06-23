import React, { useRef } from 'react'
import Section from './Section'

export default function Canvas({ sections, selectedSectionId, selectedElementId, onSelectSection, onSelectElement, onUpdateSection, onUpdateElement, onClearSelection, onEditChart, scale = 1 }) {
  const canvasRef = useRef(null)
  // const CANVAS_W = 3000
  // const CANVAS_H = 3000

  const viewportWidth =
  window.innerWidth - 260 // sidebar approx

const viewportHeight =
  window.innerHeight - 80 // topbar approx

const contentWidth = sections.length
  ? Math.max(...sections.map(s => s.x + s.width))
  : 1200

const contentHeight = sections.length
  ? Math.max(...sections.map(s => s.y + s.height))
  : 800

const canvasWidth = Math.max(
  viewportWidth,
  contentWidth + 100
)

const canvasHeight = Math.max(
  viewportHeight,
  contentHeight + 100
)
  

  // const canvasHeight = Math.max( 800, ...sections.map(section => section.y + section.height + 100))

  return (
    <div
      className="canvas-scroll-area"
      onClick={onClearSelection}
    >
      <div
        ref={canvasRef}
        className="canvas-board"
        style={{
          // width: CANVAS_W,
          // height: CANVAS_H,
          height: canvasHeight,
          width: canvasWidth,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
        }}
      >
        {sections.map(section => (
          <Section
            key={section.id}
            section={section}
            isSelected={selectedSectionId === section.id}
            selectedElementId={selectedElementId}
            onSelectSection={onSelectSection}
            onSelectElement={onSelectElement}
            onUpdateSection={onUpdateSection}
            onUpdateElement={onUpdateElement}
            onEditChart={onEditChart}
            scale={scale}
          />
        ))}
        {sections.length === 0 && (
          <div className="canvas-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <p>Click <strong>+ Add Section</strong> to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
