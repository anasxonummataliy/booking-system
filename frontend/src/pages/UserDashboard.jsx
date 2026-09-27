import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  User,
  LogOut,
  Plus
} from 'lucide-react';

export default function UserDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'appointments'

  const fetchBookings = async () => {
    try {
      const res = await api.getMyBookings();
      setBookings(res);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm(t('cancelConfirmPrompt'))) return;
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId, "Cancelled by patient via dashboard");
      await fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  // Metrics calculation
  const upcomingBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending');
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');
  const nextAppointment = upcomingBookings[0] || null;

  const renderStatusBadge = (status) => {
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
    return `${d.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${d.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 76px)', backgroundColor: 'var(--bg-page)' }}>
      {/* Dark Left Sidebar - Hidden on mobile in favor of bottom nav & drawer */}
      <aside className="desktop-nav" style={{
        width: '260px',
        backgroundColor: '#0F172A',
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
            </span>
          </div>

          {/* Menu Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'dashboard', label: t('tabDashboard'), icon: Calendar },
              { id: 'appointments', label: t('tabAppointments'), icon: FileText },
              { id: 'browse', label: t('navDoctors'), icon: User, action: () => onNavigate('doctors') },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.action || (() => setActiveTab(item.id))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            color: '#EF4444',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)'
          }}
        >
          <LogOut size={18} />
          <span>{t('navLogout')}</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main-content" style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            {t('helloUser')}, {user?.full_name?.split(' ')[0] || 'Patient'}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('userDashboardSubtitle')}
          </p>
        </div>

        {/* 4 KPI Stats Cards */}
        <div className="kpi-grid-4" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Upcoming */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('upcomingAppointments')}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="var(--primary)" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
              {upcomingBookings.length}
            </div>
          </div>

          {/* Completed */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('completedAppointments')}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={18} color="#10B981" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>
              {completedBookings.length}
            </div>
          </div>

          {/* Cancelled */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('statusCancelled')}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={18} color="#EF4444" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444' }}>
              {cancelledBookings.length}
            </div>
          </div>

          {/* Total Bookings */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalAppointments')}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--text-muted)" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
              {bookings.length}
            </div>
          </div>
        </div>

        {/* Highlighted Upcoming Appointment Card */}
        {nextAppointment && (
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{t('upcomingAppointments')}</h3>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setActiveTab('appointments')}>
                {t('viewAllServices')} →
              </span>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 28px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img
                  src={nextAppointment.doctor?.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                  alt={nextAppointment.doctor?.full_name}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '3px' }}>
                    {nextAppointment.doctor?.full_name}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {nextAppointment.doctor?.specialty}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {formatDate(nextAppointment.start_time)}
                    </span>
                    {renderStatusBadge(nextAppointment.status)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => handleCancel(nextAppointment.id)}
                  disabled={cancellingId === nextAppointment.id}
                  className="btn-danger-outline"
                >
                  {cancellingId === nextAppointment.id ? '...' : t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Appointments List */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
            {t('tabAppointments')}
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              {t('loading')}
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{t('noBookingsYet')}</p>
              <button
                onClick={() => onNavigate('doctors')}
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                {t('bookFirstAppointment')}
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden'
            }}>
              {bookings.map((booking, idx) => (
                <div
                  key={booking.id}
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: idx === bookings.length - 1 ? 'none' : '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={booking.doctor?.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                      alt={booking.doctor?.full_name}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h5 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {booking.doctor?.full_name}
                        </h5>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>•</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{booking.doctor?.specialty}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatDate(booking.start_time)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {renderStatusBadge(booking.status)}
                    {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="btn-danger-outline"
                      >
                        {cancellingId === booking.id ? '...' : t('cancel')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
