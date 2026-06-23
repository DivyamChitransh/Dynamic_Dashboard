import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const DEFAULT_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const DEFAULT_VALUES = [1200, 1900, 1500, 2400, 2800, 3200]

export default function LineChartWidget({ title = 'User Growth', labels, values, datasetLabel = 'Active Users' }) {
  const chartLabels = labels && labels.length > 0 ? labels : DEFAULT_LABELS
  const chartValues = values && values.length > 0 ? values : DEFAULT_VALUES

  const data = {
    labels: chartLabels,
    datasets: [{
      label: datasetLabel,
      data: chartValues,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#10b981',
      pointRadius: 4,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } },
      title: { display: false },
    },
    scales: {
      x: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    },
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <div style={{ flex: 1 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
