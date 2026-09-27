import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Stethoscope,
  Heart,
  Baby,
  Activity,
  Search,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export default function HomePage({ onSelectDoctor, onSelectService, onNavigate }) {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, doctorsRes] = await Promise.all([
          api.getServices(),
          api.getDoctors()
        ]);
        setServices(servicesRes);
        setDoctors(doctorsRes);
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

  // Service icon helper
  const renderServiceIcon = (iconName) => {
    switch (iconName) {
      case 'heart': return <Heart size={26} color="#EF4444" />;
      case 'baby': return <Baby size={26} color="#10B981" />;
      case 'droplet': return <Activity size={26} color="#F59E0B" />;
      default: return <Stethoscope size={26} color="var(--primary)" />;
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
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
                fontSize: '48px',
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
                fontSize: '17px',
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
                maxWidth: '440px',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '6px solid #FFFFFF'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800"
                  alt="Doctor with Stethoscope"
                  style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
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

      {/* POPULAR SERVICES SECTION */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{t('popularServicesTitle')}</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('popularServicesSubtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {t('viewAllServices')} <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {services.map(service => (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  {renderServiceIcon(service.icon)}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {service.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                  {service.description}
                </p>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  backgroundColor: '#F8FAFC',
                  padding: '6px 12px',
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

      {/* FEATURED DOCTORS SPOTLIGHT */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '60px 0 80px', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{t('topDoctorsTitle')}</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('topDoctorsSubtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {t('viewAllDoctors')} <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
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
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img
                    src={doc.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"}
                    alt={doc.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{doc.specialty}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                      <Star size={14} fill="#D97706" /> {doc.rating}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {doc.full_name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                    {doc.bio?.slice(0, 85)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{t('consultationFee')}</span>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>${doc.consultation_fee}</span>
                    </div>
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
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
