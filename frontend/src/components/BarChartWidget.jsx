import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const DEFAULT_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const DEFAULT_VALUES = [42, 58, 45, 70, 65, 85]

export default function BarChartWidget({ title = 'Monthly Revenue', labels, values, datasetLabel = 'Revenue ($K)' }) {
  const chartLabels = labels && labels.length > 0 ? labels : DEFAULT_LABELS
  const chartValues = values && values.length > 0 ? values : DEFAULT_VALUES

  const data = {
    labels: chartLabels,
    datasets: [{
      label: datasetLabel,
      data: chartValues,
      backgroundColor: 'rgba(59,130,246,0.8)',
      borderRadius: 6,
      borderSkipped: false,
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
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
