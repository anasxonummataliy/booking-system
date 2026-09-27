const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('healthplus_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || 'An unexpected error occurred';
    const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getCurrentUser: () => request('/auth/me'),

  // Services
  getServices: () => request('/services'),
  getServiceById: (id) => request(`/services/${id}`),

  // Doctors
  getDoctors: (specialty) => {
    const query = specialty && specialty !== 'All' ? `?specialty=${encodeURIComponent(specialty)}` : '';
    return request(`/doctors${query}`);
  },
  getDoctorById: (id) => request(`/doctors/${id}`),
  getDoctorSlots: (id, dateStr) => request(`/doctors/${id}/slots?date=${dateStr}`),

  // Bookings
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getMyBookings: () => request('/bookings/my'),
  getBookingById: (id) => request(`/bookings/${id}`),
  cancelBooking: (id, reason) => request(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Admin
  getAdminMetrics: () => request('/admin/metrics'),
  getAllBookings: (status, doctorId) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (doctorId) params.append('doctor_id', doctorId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/admin/bookings${qs}`);
  },
  updateBookingStatus: (id, newStatus, reason) =>
    request(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, cancellation_reason: reason }),
    }),
};
