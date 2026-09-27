import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateTime } from '../utils/dateFormatter';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  UserCheck,
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  LogOut,
  X,
  Stethoscope,
  Menu
} from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Active tab: 'overview' | 'bookings' | 'services' | 'doctors' | 'schedules'
  const [activeTab, setActiveTab] = useState('overview');
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  // Metrics and Data states
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 30,
    icon: 'stethoscope',
    is_active: true
  });

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    full_name: '',
    specialty: 'General Practice',
    bio: '',
    consultation_fee: 35,
    experience_years: 5,
    education: 'Tashkent Medical Academy, 2018',
    languages: 'Uzbek, English, Russian',
    location: 'City Medical Center, Tashkent',
    rating: 4.9,
    reviews_count: 50,
    is_active: true
  });

  // Schedule management state
  const [selectedScheduleDoctorId, setSelectedScheduleDoctorId] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    break_start: '13:00',
    break_end: '14:00',
    slot_duration_minutes: 30,
    is_active: true
  });

  const loadDoctorSchedules = async (docId) => {
    try {
      const schedules = await api.getDoctorSchedules(docId);
      setDoctorSchedules(schedules || []);
    } catch (err) {
      console.error("Failed to load schedules:", err);
    }
  };

  const loadAllData = async () => {
    try {
      const [b, s, d] = await Promise.all([
        api.getAllBookings(filterStatus),
        api.getServices(),
        api.getDoctors()
      ]);
      setBookings(b || []);
      setServices(s || []);
      setDoctors(d || []);
      if (d && d.length > 0 && !selectedScheduleDoctorId) {
        setSelectedScheduleDoctorId(d[0].id);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [filterStatus]);

  // Load schedules when doctor selected
  useEffect(() => {
    if (selectedScheduleDoctorId) {
      loadDoctorSchedules(selectedScheduleDoctorId);
    }
  }, [selectedScheduleDoctorId]);

  // Status update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      const [m, b] = await Promise.all([
        api.getAdminMetrics(),
        api.getAllBookings(filterStatus)
      ]);
      setMetrics(m);
      setBookings(b || []);
    } catch (err) {
      alert(err.message || "Failed to update booking status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Service CRUD
  const handleOpenServiceModal = (svc = null) => {
    if (svc) {
      setEditingService(svc);
      setServiceForm({
        name: svc.name,
        description: svc.description,
        duration: svc.duration,
        price: svc.price,
        icon: svc.icon || 'stethoscope',
        is_active: svc.is_active ?? true
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '',
        description: '',
        duration: 30,
        price: 35,
        icon: 'stethoscope',
        is_active: true
      });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.updateService(editingService.id, serviceForm);
      } else {
        await api.createService(serviceForm);
      }
      setServiceModalOpen(false);
      const s = await api.getServices();
      setServices(s || []);
    } catch (err) {
      alert(err.message || "Failed to save service");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete service");
    }
  };

  // Doctor CRUD
  const handleOpenDoctorModal = (doc = null) => {
    if (doc) {
      setEditingDoctor(doc);
      setDoctorForm({
        full_name: doc.full_name,
        specialty: doc.specialty,
        bio: doc.bio,
        consultation_fee: doc.consultation_fee,
        experience_years: doc.experience_years,
        education: doc.education || 'Tashkent Medical Academy, 2018',
        languages: doc.languages || 'Uzbek, English, Russian',
        location: doc.location || 'City Medical Center, Tashkent',
        rating: doc.rating || 4.9,
        reviews_count: doc.reviews_count || 50,
        is_active: doc.is_active ?? true
      });
    } else {
      setEditingDoctor(null);
      setDoctorForm({
        full_name: '',
        specialty: 'Cardiology',
        bio: '',
        consultation_fee: 40,
        experience_years: 7,
        education: 'Tashkent Medical Academy, 2017',
        languages: 'Uzbek, English, Russian',
        location: 'City Medical Center, Tashkent',
        rating: 4.9,
        reviews_count: 35,
        is_active: true
      });
    }
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, doctorForm);
      } else {
        await api.createDoctor(doctorForm);
      }
      setDoctorModalOpen(false);
      const d = await api.getDoctors();
      setDoctors(d || []);
    } catch (err) {
      alert(err.message || "Failed to save doctor");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await api.deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete doctor");
    }
  };

  // Schedule Save
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!selectedScheduleDoctorId) return;
    try {
      await api.setDoctorSchedule(selectedScheduleDoctorId, {
        ...scheduleForm,
        doctor_id: selectedScheduleDoctorId,
        day_of_week: Number(scheduleForm.day_of_week),
        slot_duration_minutes: Number(scheduleForm.slot_duration_minutes)
      });
      setScheduleModalOpen(false);
      await loadDoctorSchedules(selectedScheduleDoctorId);
    } catch (err) {
      alert(err.message || "Failed to save schedule");
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

  const formatDate = (dateStr) => formatDateTime(dateStr, language);

  const dayNames = language === 'uz'
    ? ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.user?.full_name?.toLowerCase().includes(q) ||
      b.doctor?.full_name?.toLowerCase().includes(q) ||
      b.service?.name?.toLowerCase().includes(q) ||
      b.booking_reference?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-layout-root" style={{ height: '100vh' }}>
      {/* Dedicated Admin Header */}
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
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              padding: '2px 8px',
              borderRadius: '12px',
              marginLeft: '8px',
              letterSpacing: '0.6px'
            }}>
              Admin Portal
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

          {/* Admin User Chip (Desktop) */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', backgroundColor: '#1E293B', borderRadius: 'var(--radius-full)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#4338CA', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
              {(user?.full_name || 'Admin')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9' }}>
              {user?.full_name || 'Admin'}
            </span>
          </div>

          {/* Logout (Desktop) */}
          <button
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

          {/* Mobile Animated Hamburger Button */}
          <button
            onClick={() => setAdminDrawerOpen(true)}
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
            aria-label="Open admin menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Animated Admin Drawer */}
      {adminDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setAdminDrawerOpen(false)}>
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
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '6px'
                  }}>
                    Admin
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAdminDrawerOpen(false)}
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

            {/* Admin Profile Card */}
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
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px'
              }}>
                {(user?.full_name || 'Admin')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name || 'Admin HealthPlus'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'admin@healthplus.uz'}
                </div>
              </div>
            </div>

            {/* Admin Navigation Tabs */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'overview', label: t('adminTabOverview'), icon: LayoutDashboard },
                { id: 'bookings', label: t('adminTabBookings'), icon: Calendar, count: bookings.length },
                { id: 'services', label: t('adminTabServices'), icon: Briefcase, count: services.length },
                { id: 'doctors', label: t('adminTabDoctors'), icon: UserCheck, count: doctors.length },
                { id: 'schedules', label: t('adminTabSchedules'), icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setAdminDrawerOpen(false);
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
                onClick={() => {
                  logout();
                  setAdminDrawerOpen(false);
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
          { id: 'overview', label: t('adminTabOverview'), icon: LayoutDashboard },
          { id: 'bookings', label: t('adminTabBookings'), icon: Calendar, count: bookings.length },
          { id: 'services', label: t('adminTabServices'), icon: Briefcase, count: services.length },
          { id: 'doctors', label: t('adminTabDoctors'), icon: UserCheck, count: doctors.length },
          { id: 'schedules', label: t('adminTabSchedules'), icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
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

      {/* Admin Content Area (Sidebar + Workspace) */}
      <div className="admin-body-container">
        {/* Sleek Custom Admin Sidebar (Desktop) */}
        <aside className="desktop-only admin-desktop-sidebar">
        <div>
          {/* Sidebar Section Heading */}
          <div style={{ padding: '4px 12px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
            {t('navAdmin')}
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
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
              <span>{t('adminTabOverview')}</span>
            </button>

            <button
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
              <span>{t('adminTabBookings')}</span>
              {bookings.filter(b => b.status === 'Pending').length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {bookings.filter(b => b.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: activeTab === 'services' ? 700 : 500,
                color: activeTab === 'services' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activeTab === 'services' ? 'var(--primary)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Briefcase size={18} />
              <span>{t('adminTabServices')}</span>
              <span style={{ marginLeft: 'auto', color: '#64748B', fontSize: '12px' }}>{services.length}</span>
            </button>

            <button
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
              <span>{t('adminTabDoctors')}</span>
              <span style={{ marginLeft: 'auto', color: '#64748B', fontSize: '12px' }}>{doctors.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: activeTab === 'schedules' ? 700 : 500,
                color: activeTab === 'schedules' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activeTab === 'schedules' ? 'var(--primary)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Clock size={18} />
              <span>{t('adminTabSchedules')}</span>
            </button>
          </nav>
        </div>

        {/* Admin user info & Logout */}
        <div style={{ flexShrink: 0, paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
              flexShrink: 0
            }}>
              {(user?.full_name || 'Admin')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.full_name || 'Admin HealthPlus'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'admin@healthplus.uz'}
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

      {/* Main Admin Workspace */}
      <main className="admin-workspace">

        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {activeTab === 'overview' && t('adminTabOverview')}
              {activeTab === 'bookings' && t('adminTabBookings')}
              {activeTab === 'services' && t('adminTabServices')}
              {activeTab === 'doctors' && t('adminTabDoctors')}
              {activeTab === 'schedules' && t('adminTabSchedules')}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t('adminDashboardSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'services' && (
              <button
                onClick={() => handleOpenServiceModal()}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
              >
                <Plus size={16} /> {t('addNewService')}
              </button>
            )}
            {activeTab === 'doctors' && (
              <button
                onClick={() => handleOpenDoctorModal()}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
              >
                <Plus size={16} /> {t('addNewDoctor')}
              </button>
            )}
            {activeTab === 'schedules' && (
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
              >
                <Plus size={16} /> {t('setSchedule')}
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Summary Cards */}
            <div className="kpi-grid-4">
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalRevenue')}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  ${(bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').reduce((acc, curr) => acc + (curr.service?.price || 30), 0)).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> +18.4% {language === 'uz' ? 'o‘tgan oydan' : 'vs last month'}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalAppointments')}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {bookings.length}
                </div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> +12% {language === 'uz' ? 'o‘sish' : 'growth'}
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
                  {bookings.filter(b => b.status === 'Pending').length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {language === 'uz' ? 'Tasdiq kutilmoqda' : 'Awaiting confirmation'}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t('adminTabDoctors')}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {doctors.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                  {services.length} {language === 'uz' ? 'faol xizmatlar' : 'active services'}
                </div>
              </div>
            </div>

            {/* Recent Bookings Quick Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>{t('bookingListTitle')}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{language === 'uz' ? 'So‘nggi bron qilingan qabullar' : 'Recent patient appointments'}</p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {language === 'uz' ? 'Barchasini ko‘rish' : 'View All'} &rarr;
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('patientName')}</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('doctorName')}</th>
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
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {b.doctor?.full_name}
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.service?.name}</div>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                          {formatDate(b.start_time)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {renderBadge(b.status)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
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
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '14px' }}>
              {/* Search bar */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={language === 'uz' ? 'Qidirish (bemor, shifokor)...' : 'Search patient, doctor...'}
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
                      style={{ fontSize: '12px', padding: '6px 14px' }}
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
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('navServices')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('doctorName')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('dateTime')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('price')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('status')}</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {b.doctor?.full_name}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {formatDate(b.start_time)}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                          ${b.service?.price || 30}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {services.map(svc => (
              <div key={svc.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Briefcase size={22} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: svc.is_active ? '#ECFDF5' : '#F3F4F6',
                      color: svc.is_active ? '#059669' : '#6B7280'
                    }}>
                      {svc.is_active ? (language === 'uz' ? 'Faol' : 'Active') : (language === 'uz' ? 'Nofaol' : 'Inactive')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {svc.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {svc.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{t('duration')}</span>
                      <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{svc.duration} {t('mins')}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{t('price')}</span>
                      <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>${svc.price}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleOpenServiceModal(svc)}
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '12px', padding: '8px', justifyContent: 'center' }}
                    >
                      <Edit2 size={14} /> {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="btn-danger-outline"
                      style={{ padding: '8px 12px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: DOCTORS & STAFF MANAGEMENT */}
        {activeTab === 'doctors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {doctors.map(doc => (
              <div key={doc.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      border: '2px solid #DBEAFE'
                    }}>
                      {doc.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>{doc.full_name}</h3>
                      <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>{doc.specialty}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {doc.bio}
                  </p>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('doctorExp')}:</span>
                      <strong>{doc.experience_years} {t('experience')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('doctorFee')}:</span>
                      <strong style={{ color: 'var(--primary)' }}>${doc.consultation_fee}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('doctorLanguages')}:</span>
                      <span>{doc.languages}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setSelectedScheduleDoctorId(doc.id);
                      setActiveTab('schedules');
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '12px', padding: '8px', justifyContent: 'center' }}
                  >
                    <Clock size={14} /> {t('adminTabSchedules')}
                  </button>
                  <button
                    onClick={() => handleOpenDoctorModal(doc)}
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doc.id)}
                    className="btn-danger-outline"
                    style={{ padding: '8px 12px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: WORK SCHEDULES MANAGEMENT */}
        {activeTab === 'schedules' && (
          <div>
            {/* Doctor picker bar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {language === 'uz' ? 'Shifokorni tanlang:' : 'Select Doctor:'}
                </span>
                <select
                  value={selectedScheduleDoctorId || ''}
                  onChange={(e) => setSelectedScheduleDoctorId(Number(e.target.value))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    minWidth: '220px'
                  }}
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setScheduleModalOpen(true)}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Plus size={16} /> {t('setSchedule')}
              </button>
            </div>

            {/* Weekly Timetable Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {dayNames.map((dName, idx) => {
                const sched = doctorSchedules.find(s => s.day_of_week === idx);
                return (
                  <div key={idx} style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    border: sched ? '1px solid #BFDBFE' : '1px dashed var(--border-light)',
                    boxShadow: sched ? 'var(--shadow-sm)' : 'none',
                    opacity: sched ? 1 : 0.65
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>{dName}</strong>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: sched ? '#ECFDF5' : '#F3F4F6',
                        color: sched ? '#059669' : '#6B7280'
                      }}>
                        {sched ? (language === 'uz' ? 'Ish kuni' : 'Working') : (language === 'uz' ? 'Dam olish' : 'Day Off')}
                      </span>
                    </div>

                    {sched ? (
                      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                          <Clock size={16} color="var(--primary)" />
                          <span>{sched.start_time?.slice(0, 5)} - {sched.end_time?.slice(0, 5)}</span>
                        </div>
                        {sched.break_start && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                            <span>☕ {t('scheduleBreakStart')}: {sched.break_start?.slice(0, 5)} - {sched.break_end?.slice(0, 5)}</span>
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          ⏱ {sched.slot_duration_minutes || 30} {t('mins')} {language === 'uz' ? 'oraliq' : 'slots'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '14px 0' }}>
                        {language === 'uz' ? 'Grafik kiritilmagan' : 'No schedule set'}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setScheduleForm({
                          day_of_week: idx,
                          start_time: sched ? sched.start_time?.slice(0, 5) : '09:00',
                          end_time: sched ? sched.end_time?.slice(0, 5) : '17:00',
                          break_start: sched?.break_start ? sched.break_start?.slice(0, 5) : '13:00',
                          break_end: sched?.break_end ? sched.break_end?.slice(0, 5) : '14:00',
                          slot_duration_minutes: sched ? sched.slot_duration_minutes : 30,
                          is_active: true
                        });
                        setScheduleModalOpen(true);
                      }}
                      style={{
                        marginTop: '14px',
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        backgroundColor: '#EFF6FF',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center'
                      }}
                    >
                      {sched ? t('edit') : `+ ${t('setSchedule')}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile-only Admin Info & Logout Footer Card */}
        <div className="mobile-only" style={{
          marginTop: '36px',
          padding: '16px',
          backgroundColor: '#0B132B',
          borderRadius: 'var(--radius-lg)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#FFFFFF'
            }}>
              {(user?.full_name || 'Admin')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                {user?.full_name || 'Admin HealthPlus'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                {user?.email || 'admin@healthplus.uz'}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>{t('navLogout')}</span>
          </button>
        </div>
      </main>
      </div>

      {/* MODAL 1: SERVICE ADD / EDIT */}
      {serviceModalOpen && (
        <div className="modal-overlay" onClick={() => setServiceModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingService ? t('edit') : t('addNewService')}
              </h2>
              <button onClick={() => setServiceModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('serviceName')}
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('serviceDesc')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('serviceDuration')}
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    required
                    value={serviceForm.duration}
                    onChange={e => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('servicePrice')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={serviceForm.price}
                    onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '14px' }}
              >
                {t('saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCTOR ADD / EDIT */}
      {doctorModalOpen && (
        <div className="modal-overlay" onClick={() => setDoctorModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingDoctor ? t('edit') : t('addNewDoctor')}
              </h2>
              <button onClick={() => setDoctorModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('doctorFullName')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Alisher Usmonov"
                  value={doctorForm.full_name}
                  onChange={e => setDoctorForm({ ...doctorForm, full_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('doctorSpecialty')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cardiology"
                    value={doctorForm.specialty}
                    onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('doctorFee')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={doctorForm.consultation_fee}
                    onChange={e => setDoctorForm({ ...doctorForm, consultation_fee: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('doctorBio')}
                </label>
                <textarea
                  rows={2}
                  required
                  value={doctorForm.bio}
                  onChange={e => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('doctorExp')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={doctorForm.experience_years}
                    onChange={e => setDoctorForm({ ...doctorForm, experience_years: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('doctorLanguages')}
                  </label>
                  <input
                    type="text"
                    value={doctorForm.languages}
                    onChange={e => setDoctorForm({ ...doctorForm, languages: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '14px' }}
              >
                {t('saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE ADD / EDIT */}
      {scheduleModalOpen && (
        <div className="modal-overlay" onClick={() => setScheduleModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                {t('setSchedule')}
              </h2>
              <button onClick={() => setScheduleModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('scheduleDay')}
                </label>
                <select
                  value={scheduleForm.day_of_week}
                  onChange={e => setScheduleForm({ ...scheduleForm, day_of_week: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                >
                  {dayNames.map((name, i) => (
                    <option key={i} value={i}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('scheduleStartTime')}
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.start_time}
                    onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('scheduleEndTime')}
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.end_time}
                    onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('scheduleBreakStart')}
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.break_start || ''}
                    onChange={e => setScheduleForm({ ...scheduleForm, break_start: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('scheduleBreakEnd')}
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.break_end || ''}
                    onChange={e => setScheduleForm({ ...scheduleForm, break_end: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('slotDurationMinutes')}
                </label>
                <input
                  type="number"
                  min={10}
                  step={5}
                  value={scheduleForm.slot_duration_minutes}
                  onChange={e => setScheduleForm({ ...scheduleForm, slot_duration_minutes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '14px' }}
              >
                {t('saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
