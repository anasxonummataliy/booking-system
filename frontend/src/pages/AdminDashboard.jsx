import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  ExternalLink,
  Clock,
  XCircle,
  TrendingUp,
  Plus
} from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const { logout } = useAuth();
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAdminData = async () => {
    try {
      const [m, b] = await Promise.all([
        api.getAdminMetrics(),
        api.getAllBookings(filterStatus)
      ]);
      setMetrics(m);
      setBookings(b);
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [filterStatus]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      await loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to update booking status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-confirmed">{t('statusConfirmed')}</span>;
      case 'Completed':
        return <span className="badge badge-completed">{t('statusCompleted')}</span>;
      case 'Cancelled':
        return <span className="badge badge-cancelled">{t('statusCancelled')}</span>;
      default:
        return <span className="badge badge-pending">{t('statusPending')}</span>;
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 76px)', backgroundColor: 'var(--bg-page)' }}>
      {/* Dark Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0B132B',
        color: '#FFFFFF',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', paddingLeft: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={20} color="#FFFFFF" strokeWidth={3} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {t('appName')}<span style={{ color: '#38BDF8' }}>{t('appNameAccent')}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#1E293B', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', color: '#94A3B8' }}>Admin</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'var(--primary)',
                textAlign: 'left'
              }}
            >
              <LayoutDashboard size={18} />
              <span>{t('tabDashboard')}</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 500,
                color: '#94A3B8',
                textAlign: 'left'
              }}
            >
              <Calendar size={18} />
              <span>{t('userDashboardTitle')}</span>
            </button>

            {/* Direct Flask-Admin Integration Button */}
            <a
              href="http://localhost:8000/admin"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#38BDF8',
                backgroundColor: '#1E293B',
                marginTop: '12px'
              }}
            >
              <ExternalLink size={18} />
              <span>{t('openFlaskAdminBtn')}</span>
            </a>
          </nav>
        </div>

        {/* Admin user info & Logout */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderTop: '1px solid #1E293B', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Admin HealthPlus</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>admin@healthplus.com</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <LogOut size={16} /> {t('navLogout')}
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('adminDashboardTitle')}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t('adminDashboardSubtitle')}
            </p>
          </div>

          <a
            href="http://localhost:8000/admin"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
          >
            <ExternalLink size={16} /> {t('openFlaskAdminBtn')}
          </a>
        </div>

        {/* 4 Stat KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Total Bookings */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{t('totalAppointments')}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {metrics?.total_bookings || 124}
            </div>
            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +12%
            </div>
          </div>

          {/* Confirmed */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{t('statusConfirmed')}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', marginBottom: '4px' }}>
              {metrics?.confirmed_bookings || 98}
            </div>
            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +8%
            </div>
          </div>

          {/* Pending */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{t('statusPending')}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B', marginBottom: '4px' }}>
              {metrics?.pending_bookings || 18}
            </div>
            <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> +5%
            </div>
          </div>

          {/* Cancelled */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{t('statusCancelled')}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>
              {metrics?.cancelled_bookings || 8}
            </div>
            <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={14} /> -2%
            </div>
          </div>
        </div>

        {/* Live Recent Bookings Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>{t('bookingListTitle')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{t('adminDashboardSubtitle')}</p>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(st => {
                const label = st === 'All' ? t('filterAll') : (
                  st === 'Confirmed' ? t('statusConfirmed') : (
                    st === 'Pending' ? t('statusPending') : (
                      st === 'Completed' ? t('statusCompleted') : t('statusCancelled')
                    )
                  )
                );
                return (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`pill-filter ${filterStatus === st ? 'active' : ''}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              {t('loading')}
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              {t('noBookingsYet')}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('patientName')}</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('navServices')}</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('doctorName')}</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('dateTime')}</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('status')}</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {b.user?.full_name || 'Patient'}
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>{b.booking_reference}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      {b.service?.name}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {b.doctor?.full_name}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      {formatDate(b.start_time)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {renderBadge(b.status)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                            disabled={actionLoadingId === b.id}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px' }}
                          >
                            {t('confirm')}
                          </button>
                        )}
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Completed')}
                            disabled={actionLoadingId === b.id}
                            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, border: '1px solid #A7F3D0' }}
                          >
                            {t('statusCompleted')}
                          </button>
                        )}
                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                            disabled={actionLoadingId === b.id}
                            className="btn-danger-outline"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            {t('cancel')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
