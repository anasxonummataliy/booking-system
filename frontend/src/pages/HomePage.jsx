import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Stethoscope,
  Heart,
  Baby,
  Activity,
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Calendar,
  ClipboardList,
  Users,
  Briefcase
} from 'lucide-react';

export default function HomePage({ onSelectDoctor, onSelectService, onNavigate }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, doctorsRes] = await Promise.all([
          api.getServices(),
          api.getDoctors()
        ]);
        setServices(servicesRes || []);
        setDoctors(doctorsRes || []);
      } catch (err) {
        console.error("Failed to fetch initial home data:", err);
      }
    }
    fetchData();
  }, []);

  const handleSearch = () => {
    if (selectedDoctorId) {
      const doc = doctors.find(d => d.id === parseInt(selectedDoctorId));
      if (doc) onSelectDoctor(doc, selectedDate);
    } else if (selectedServiceId) {
      onSelectService(parseInt(selectedServiceId));
    } else {
      onNavigate('doctors');
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) {
      onNavigate('doctors');
      return;
    }
    const q = mobileSearchQuery.toLowerCase();
    const matchedDoc = doctors.find(d => 
      d.full_name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)
    );
    if (matchedDoc) {
      onSelectDoctor(matchedDoc);
    } else {
      onNavigate('doctors');
    }
  };

  // Service icon helper
  const renderServiceIcon = (iconName) => {
    switch (iconName) {
      case 'heart': return <Heart size={24} color="#EF4444" />;
      case 'baby': return <Baby size={24} color="#10B981" />;
      case 'droplet': return <Activity size={24} color="#F59E0B" />;
      default: return <Stethoscope size={24} color="var(--primary)" />;
    }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* ==============================================
          MOBILE-SPECIFIC HERO & GREETING (Screens <= 768px)
          Matches Screen 3 in uploaded UI mockup
          ============================================== */}
      <div className="mobile-only" style={{ padding: '20px 16px 8px' }}>
        {/* User Greeting */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {t('helloUser')}, {user?.full_name?.split(' ')[0] || (language === 'uz' ? 'Mehmon' : 'Guest')}! 👋
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('greetingSubtitle')}
          </p>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleMobileSearch} style={{ position: 'relative', marginBottom: '18px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('searchPlaceholderMobile')}
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              fontSize: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </form>

        {/* Mobile Promo Banner Card (Matches Screen 3) */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          border: '1px solid #BFDBFE',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '65%' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              backgroundColor: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: '10px',
              display: 'inline-block',
              marginBottom: '6px'
            }}>
              {t('heroBadge')}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: '4px' }}>
              {t('tagline')}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
              {language === 'uz' ? 'Eng ishonchli va malakali shifokorlar xizmati' : 'Quality care from verified medical professionals'}
            </p>
          </div>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #FFFFFF',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}>
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
              alt="Doctor"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* 4 Quick Actions Grid (Matches Screen 3) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            {language === 'uz' ? 'Tezkor amallar' : 'Quick Actions'}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {/* Action 1: Book Appointment */}
            <div
              onClick={() => onNavigate('doctors')}
              className="quick-action-card"
            >
              <div className="quick-action-icon" style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)' }}>
                <Calendar size={22} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {t('quickActionBook')}
              </span>
            </div>

            {/* Action 2: My Appointments */}
            <div
              onClick={() => onNavigate('dashboard')}
              className="quick-action-card"
            >
              <div className="quick-action-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                <ClipboardList size={22} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {t('quickActionAppointments')}
              </span>
            </div>

            {/* Action 3: Doctors */}
            <div
              onClick={() => onNavigate('doctors')}
              className="quick-action-card"
            >
              <div className="quick-action-icon" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                <Users size={22} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {t('quickActionDoctors')}
              </span>
            </div>

            {/* Action 4: Services */}
            <div
              onClick={() => onNavigate('services')}
              className="quick-action-card"
            >
              <div className="quick-action-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                <Briefcase size={22} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {t('quickActionServices')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================
          DESKTOP HERO SECTION (Screens > 768px)
          ============================================== */}
      <section className="desktop-nav" style={{
        background: 'linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 100%)',
        padding: '50px 0 70px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: '#DBEAFE',
                color: '#1E40AF',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '18px'
              }}>
                <ShieldCheck size={16} /> {t('heroBadge')}
              </div>

              <h1 style={{
                fontSize: '46px',
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--text-main)',
                letterSpacing: '-1px',
                marginBottom: '16px'
              }}>
                {t('heroTitle')} <br />
                <span style={{ color: 'var(--primary)' }}>{t('heroTitleHighlight')}</span>
              </h1>

              <p style={{
                fontSize: '16px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '520px',
                marginBottom: '32px'
              }}>
                {t('heroSubtitle')}
              </p>

              {/* Floating Quick Search Bar Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-light)',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.2fr 1fr auto',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Select Service */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {t('searchServicePlaceholder')}
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <option value="">{t('allServicesOption')}</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                    ))}
                  </select>
                </div>

                {/* Choose Doctor */}
                <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {t('searchDoctorPlaceholder')}
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <option value="">{t('allDoctorsOption')}</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                {/* Select Date */}
                <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {t('searchDatePlaceholder')}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      backgroundColor: 'transparent'
                    }}
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="btn-primary"
                  style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)' }}
                >
                  <Search size={16} /> {t('searchButton')}
                </button>
              </div>
            </div>

            {/* Right Doctor Visual Illustration */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '6px solid #FFFFFF'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800"
                  alt="Doctor with Stethoscope"
                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                />
                {/* Floating badge on doctor */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Star size={20} color="#10B981" fill="#10B981" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>4.9 / 5.0 Rating</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From 1,200+ satisfied patients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================
          POPULAR SERVICES SECTION (Both Desktop & Mobile)
          ============================================== */}
      <section style={{ padding: '36px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{t('popularServicesTitle')}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {t('popularServicesSubtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {t('viewAllServices')} <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '16px'
          }}>
            {services.slice(0, 4).map(service => (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 16px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  {renderServiceIcon(service.icon)}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {service.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
                  {service.description?.slice(0, 50)}...
                </p>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  backgroundColor: '#F8FAFC',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-block'
                }}>
                  ${service.price} • {service.duration} {t('mins')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================
          FEATURED DOCTORS SPOTLIGHT (Both Desktop & Mobile)
          ============================================== */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '36px 0 50px', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{t('topDoctorsTitle')}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {t('topDoctorsSubtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {t('viewAllDoctors')} <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {doctors.slice(0, 3).map(doc => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="doctor-card-img-container">
                  <img
                    src={doc.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"}
                    alt={doc.full_name}
                    className="doctor-card-img"
                  />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>{doc.specialty}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706' }}>
                      <Star size={13} fill="#D97706" /> {doc.rating}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {doc.full_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '14px' }}>
                    {doc.bio?.slice(0, 75)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{t('consultationFee')}</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>${doc.consultation_fee}</span>
                    </div>
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="btn-primary"
                      style={{ padding: '7px 14px', fontSize: '12px' }}
                    >
                      {t('bookAppointmentBtn')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
