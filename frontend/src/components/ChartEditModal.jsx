import React, { useState } from 'react'

export default function ChartEditModal({ element, onClose, onSave }) {
  const [labels, setLabels] = useState((element.labels || ['Jan','Feb','Mar','Apr','May','Jun']).join(','))
  const [values, setValues] = useState((element.values || [42,58,45,70,65,85]).join(','))
  const [datasetLabel, setDatasetLabel] = useState(element.datasetLabel || 'Revenue ($K)')
  const [chartTitle, setChartTitle] = useState(element.chartTitle || 'Monthly Revenue')

  const handleSave = () => {
    const labelArr = labels.split(',').map(s => s.trim()).filter(Boolean)
    const valueArr = values.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    onSave({
      ...element,
      labels: labelArr,
      values: valueArr,
      datasetLabel,
      chartTitle,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Chart Data</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Chart Title</label>
            <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Dataset Label</label>
            <input value={datasetLabel} onChange={e => setDatasetLabel(e.target.value)} />
          </div>
          <div className="form-group">
            <label>X-Axis Labels (comma separated)</label>
            <textarea value={labels} onChange={e => setLabels(e.target.value)} rows={2} placeholder="Jan, Feb, Mar, Apr, May, Jun" />
          </div>
          <div className="form-group">
            <label>Data Values (comma separated)</label>
            <textarea value={values} onChange={e => setValues(e.target.value)} rows={2} placeholder="42, 58, 45, 70, 65, 85" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
