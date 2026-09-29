import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateTime } from '../utils/dateFormatter';
import { formatErrorMessage } from '../utils/errorHandler';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Clock,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  LogOut,
  X,
  Stethoscope,
  Menu,
  Plus
} from 'lucide-react';

export default function DoctorDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Active tab: 'overview' | 'bookings' | 'doctors'
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorDrawerOpen, setDoctorDrawerOpen] = useState(false);

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAllData = async () => {
    try {
      const [profile, b, d] = await Promise.all([
        api.getDoctorPortalProfile(),
        api.getDoctorPortalBookings(filterStatus === 'All' ? undefined : filterStatus),
        api.getDoctors()
      ]);
      setDoctorProfile(profile?.error ? null : profile);
      setBookings(b || []);
      setDoctors(d || []);
    } catch (err) {
      console.error("Failed to load doctor data:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [filterStatus]);

  // Status update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      await api.updateDoctorPortalBookingStatus(bookingId, newStatus);
      const b = await api.getDoctorPortalBookings(filterStatus === 'All' ? undefined : filterStatus);
      setBookings(b || []);
    } catch (err) {
      alert(formatErrorMessage(err, language));
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderBadge = (status, reason) => {
    const isExpired =
      status === 'Expired' ||
      (status === 'Cancelled' &&
        (reason?.toLowerCase().includes('muddat') || reason?.toLowerCase().includes('expired')));
    if (isExpired) {
      return (
        <span className="badge badge-expired">
          {language === 'uz' ? "Muddati o'tgan" : 'Expired'}
        </span>
      );
    }
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

  const formatDate = (dateStr) => formatDateTime(dateStr, language);

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.user?.full_name?.toLowerCase().includes(q) ||
      b.service?.name?.toLowerCase().includes(q) ||
      b.booking_reference?.toLowerCase().includes(q)
    );
  });

  const pendingCount = bookings.filter(b => b.status === 'Pending').length;

  return (
    <div className="admin-layout-root" style={{ height: '100vh' }}>
      {/* Dedicated Doctor Header - identical structure to AdminDashboard header */}
      <header style={{
        backgroundColor: '#0B132B',
        color: '#FFFFFF',
        padding: '12px 20px',
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
          }}>
            <Plus size={20} color="#FFFFFF" strokeWidth={3} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Health<span style={{ color: '#38BDF8' }}>Plus</span>
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              padding: '2px 8px',
              borderRadius: '12px',
              marginLeft: '8px',
              letterSpacing: '0.6px'
            }}>
              {language === 'uz' ? 'Shifokor portali' : 'Doctor Portal'}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#1E293B',
            borderRadius: 'var(--radius-full)',
            padding: '2px'
          }}>
            <button
              id="doctor-lang-uz"
              onClick={() => setLanguage('uz')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: language === 'uz' ? 700 : 500,
                backgroundColor: language === 'uz' ? 'var(--primary)' : 'transparent',
                color: '#FFFFFF',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              🇺🇿 UZ
            </button>
            <button
              id="doctor-lang-en"
              onClick={() => setLanguage('en')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: language === 'en' ? 700 : 500,
                backgroundColor: language === 'en' ? 'var(--primary)' : 'transparent',
                color: '#FFFFFF',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              🇬🇧 EN
            </button>
          </div>

          {/* Doctor User Chip (Desktop) */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', backgroundColor: '#1E293B', borderRadius: 'var(--radius-full)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
              {(user?.full_name || 'Doctor')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9' }}>
              {user?.full_name || 'Doctor'}
            </span>
          </div>

          {/* Logout (Desktop) */}
          <button
            id="doctor-logout-btn"
            onClick={() => logout()}
            className="desktop-only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
            }}
          >
            <LogOut size={14} />
            <span>{t('navLogout')}</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            id="doctor-mobile-menu-btn"
            onClick={() => setDoctorDrawerOpen(true)}
            className="mobile-only"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: '#FFFFFF',
              backgroundColor: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Open doctor menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Animated Doctor Drawer */}
      {doctorDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setDoctorDrawerOpen(false)}>
          <div className="mobile-drawer-content" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #1E293B'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                    Health<span style={{ color: '#38BDF8' }}>Plus</span>
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '6px'
                  }}>
                    {language === 'uz' ? 'Shifokor' : 'Doctor'}
                  </span>
                </div>
              </div>

              <button
                id="doctor-drawer-close"
                onClick={() => setDoctorDrawerOpen(false)}
                style={{
                  color: '#94A3B8',
                  backgroundColor: '#1E293B',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Doctor Profile Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#1E293B',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px'
              }}>
                {(user?.full_name || 'Doctor')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name || 'Doctor'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doctorProfile?.specialty || user?.email || ''}
                </div>
              </div>
            </div>

            {/* Doctor Navigation Tabs */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'overview', label: language === 'uz' ? "Umumiy ko'rinish" : 'Overview', icon: LayoutDashboard },
                { id: 'bookings', label: language === 'uz' ? 'Mening qabullarim' : 'My Appointments', icon: Calendar, count: bookings.length },
                { id: 'doctors', label: language === 'uz' ? "Shifokorlar ro'yxati" : 'Doctors', icon: Users, count: doctors.length }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`drawer-doctor-tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setDoctorDrawerOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '15px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={19} />
                    <span style={{ flex: 1 }}>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#1E293B',
                        color: isActive ? '#FFFFFF' : '#94A3B8',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Language Switcher in Drawer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.8px' }}>
                {t('language')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  id="drawer-doctor-lang-uz"
                  onClick={() => setLanguage('uz')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: language === 'uz' ? 700 : 500,
                    color: language === 'uz' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: language === 'uz' ? 'var(--primary)' : '#1E293B',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🇺🇿 O'zbekcha
                </button>
                <button
                  id="drawer-doctor-lang-en"
                  onClick={() => setLanguage('en')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: language === 'en' ? 700 : 500,
                    color: language === 'en' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: language === 'en' ? 'var(--primary)' : '#1E293B',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Logout at bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button
                id="drawer-doctor-logout-btn"
                onClick={() => {
                  logout();
                  setDoctorDrawerOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={18} />
                <span>{t('navLogout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Horizontal Tabs Selector */}
      <div className="mobile-only admin-mobile-tabs">
        {[
          { id: 'overview', label: language === 'uz' ? "Umumiy" : 'Overview', icon: LayoutDashboard },
          { id: 'bookings', label: language === 'uz' ? 'Qabullar' : 'Bookings', icon: Calendar, count: bookings.length },
          { id: 'doctors', label: language === 'uz' ? 'Shifokorlar' : 'Doctors', icon: Users, count: doctors.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-doctor-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-mobile-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '2px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Doctor Content Area (Sidebar + Workspace) */}
      <div className="admin-body-container">
        {/* Desktop Sidebar - identical structure to Admin */}
        <aside className="desktop-only admin-desktop-sidebar">
        <div>
          {/* Sidebar Section Heading */}
          <div style={{ padding: '4px 12px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
            {language === 'uz' ? 'Shifokor portali' : 'Doctor Portal'}
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              id="doctor-tab-overview"
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: activeTab === 'overview' ? 700 : 500,
                color: activeTab === 'overview' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={18} />
              <span>{language === 'uz' ? "Umumiy ko'rinish" : 'Overview'}</span>
            </button>

            <button
              id="doctor-tab-bookings"
              onClick={() => setActiveTab('bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: activeTab === 'bookings' ? 700 : 500,
                color: activeTab === 'bookings' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activeTab === 'bookings' ? 'var(--primary)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Calendar size={18} />
              <span>{language === 'uz' ? 'Barcha qabullar' : 'All Bookings'}</span>
              {pendingCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              id="doctor-tab-doctors"
              onClick={() => setActiveTab('doctors')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: activeTab === 'doctors' ? 700 : 500,
                color: activeTab === 'doctors' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activeTab === 'doctors' ? 'var(--primary)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <UserCheck size={18} />
              <span>{language === 'uz' ? "Shifokorlar ro'yxati" : 'Doctors List'}</span>
              <span style={{ marginLeft: 'auto', color: '#64748B', fontSize: '12px' }}>{doctors.length}</span>
            </button>
          </nav>
        </div>

        {/* Doctor user info & Logout */}
        <div style={{ flexShrink: 0, paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)',
              flexShrink: 0
            }}>
              {(user?.full_name || 'Doctor')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.full_name || 'Doctor'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'doctor@healthplus.uz'}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              color: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={15} /> {t('navLogout')}
          </button>
        </div>
      </aside>

      {/* Main Doctor Workspace */}
      <main className="admin-workspace">

        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {activeTab === 'overview' && (language === 'uz' ? "Umumiy ko'rinish" : 'Overview')}
              {activeTab === 'bookings' && (language === 'uz' ? 'Barcha qabullar' : 'All Bookings')}
              {activeTab === 'doctors' && (language === 'uz' ? "Shifokorlar ro'yxati" : 'Doctors List')}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {language === 'uz'
                ? "Sizga kelgan qabullarni boshqarish va shifokorlar ro'yxatini ko'rish"
                : 'Manage your appointments and view colleagues'}
            </p>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Summary Cards */}
            <div className="kpi-grid-4">
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{language === 'uz' ? 'Umumiy tushum' : 'Revenue'}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  ${(bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').reduce((acc, curr) => acc + (curr.total_price || curr.service?.price || 30), 0)).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> {language === 'uz' ? 'Tasdiqlangan va yakunlangan' : 'Confirmed & completed'}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{language === 'uz' ? 'Jami qabullar' : 'Total Appointments'}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {bookings.length}
                </div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> {language === 'uz' ? 'Barcha bronlar' : 'All bookings'}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('statusPending')}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#D97706', marginBottom: '4px' }}>
                  {pendingCount}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {language === 'uz' ? 'Tasdiq kutilmoqda' : 'Awaiting confirmation'}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{language === 'uz' ? "Shifokorlar ro'yxati" : 'Doctors'}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {doctors.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                  {doctors.filter(d => d.is_active).length} {language === 'uz' ? 'faol shifokor' : 'active doctors'}
                </div>
              </div>
            </div>

            {/* Recent Bookings Quick Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>{language === 'uz' ? 'Barcha bronlar ro\'yxati' : 'Booking List'}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{language === 'uz' ? 'So\'nggi bron qilingan qabullar' : 'Recent patient appointments'}</p>
                </div>
                <button
                  id="doctor-overview-view-all-btn"
                  onClick={() => setActiveTab('bookings')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {language === 'uz' ? "Barchasini ko'rish" : 'View All'} &rarr;
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('patientName')}</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{language === 'uz' ? 'Xizmat' : 'Service'}</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('dateTime')}</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('status')}</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {b.user?.full_name || 'Patient'}
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>{b.booking_reference}</div>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                          {b.service?.name}
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                          {formatDate(b.start_time)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {renderBadge(b.status, b.cancellation_reason)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {b.status === 'Pending' && (
                              <button
                                id={`doctor-overview-confirm-${b.id}`}
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
                                id={`doctor-overview-complete-${b.id}`}
                                onClick={() => handleUpdateStatus(b.id, 'Completed')}
                                disabled={actionLoadingId === b.id}
                                style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, border: '1px solid #A7F3D0' }}
                              >
                                {t('statusCompleted')}
                              </button>
                            )}
                            {(b.status === 'Completed' || b.status === 'Cancelled') && (
                              <span style={{ fontSize: '13px', color: '#94A3B8' }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div className="admin-card-header">
              {/* Search bar */}
              <div style={{ position: 'relative', width: '280px', maxWidth: '100%', flex: '1 1 220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  id="doctor-bookings-search-input"
                  type="text"
                  placeholder={language === 'uz' ? 'Qidirish (bemor, xizmat)...' : 'Search patient, service...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Status filter pills */}
              <div
                className="filter-pills-scroll"
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  maxWidth: '100%',
                  minWidth: 0,
                  paddingBottom: '2px'
                }}
              >
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
                      id={`doctor-filter-${st.toLowerCase()}`}
                      onClick={() => setFilterStatus(st)}
                      className={`pill-filter ${filterStatus === st ? 'active' : ''}`}
                      style={{
                        fontSize: '10.5px',
                        padding: '5px 8px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('patientName')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{language === 'uz' ? 'Xizmat' : 'Service'}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('dateTime')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('price')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('status')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        {t('noBookingsYet')}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {b.user?.full_name || 'Patient'}
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>{b.booking_reference}</div>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {b.service?.name}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {formatDate(b.start_time)}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                          ${b.total_price || b.service?.price || 30}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {renderBadge(b.status, b.cancellation_reason)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {b.status === 'Pending' && (
                              <button
                                id={`doctor-confirm-booking-${b.id}`}
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
                                id={`doctor-complete-booking-${b.id}`}
                                onClick={() => handleUpdateStatus(b.id, 'Completed')}
                                disabled={actionLoadingId === b.id}
                                style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, border: '1px solid #A7F3D0' }}
                              >
                                {t('statusCompleted')}
                              </button>
                            )}
                            {(b.status === 'Pending' || b.status === 'Confirmed') && (
                              <button
                                id={`doctor-cancel-booking-${b.id}`}
                                onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                                disabled={actionLoadingId === b.id}
                                className="btn-danger-outline"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                              >
                                {t('cancel')}
                              </button>
                            )}
                            {(b.status === 'Completed' || b.status === 'Cancelled') && (
                              <span style={{ fontSize: '13px', color: '#94A3B8' }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DOCTORS LIST (read-only) */}
        {activeTab === 'doctors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {doctors.map(doc => (
              <div key={doc.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: doctorProfile?.id === doc.id ? '2px solid #059669' : '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                {/* "SIZ" badge */}
                {doctorProfile?.id === doc.id && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {language === 'uz' ? 'SIZ' : 'YOU'}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: doctorProfile?.id === doc.id ? '#059669' : '#EFF6FF',
                      color: doctorProfile?.id === doc.id ? '#FFFFFF' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {doc.avatar_url
                        ? <img src={doc.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : doc.full_name[0]
                      }
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                        {doc.full_name}
                      </h3>
                      <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {doc.bio?.substring(0, 120)}{doc.bio?.length > 120 ? '...' : ''}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-light)', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{language === 'uz' ? 'Tajriba' : 'Experience'}</span>
                      <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{doc.experience_years} {language === 'uz' ? 'yil' : 'years'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{language === 'uz' ? 'Reyting' : 'Rating'}</span>
                      <strong style={{ fontSize: '15px', color: '#F59E0B' }}>⭐ {doc.rating}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{t('price')}</span>
                      <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>${doc.consultation_fee}</strong>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: doc.is_active ? '#ECFDF5' : '#F3F4F6',
                    color: doc.is_active ? '#059669' : '#6B7280'
                  }}>
                    {doc.is_active ? (language === 'uz' ? 'Faol' : 'Active') : (language === 'uz' ? 'Nofaol' : 'Inactive')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
      </div>
    </div>
  );
}
