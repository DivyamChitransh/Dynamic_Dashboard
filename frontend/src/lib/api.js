const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

export function resolveAssetUrl(path) {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  const normalized = path.replace(/^assets\/uploads\//, 'uploads/').replace(/^\//, '');
  return `${API_BASE}/${normalized}`;
}

export const DashboardAPI = {
  loadDashboard(id = 1) {
    return request(`/api/dashboard.php?id=${id}`);
  },

  saveDashboard(payload) {
    return request('/api/dashboard.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  uploadImage(file, dashboardId = 1) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dashboard_id', String(dashboardId));

    return request('/api/upload.php', {
      method: 'POST',
      body: formData,
    });
  },
};
