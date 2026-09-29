import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Search, Star } from 'lucide-react';

const SPECIALTIES = ['All', 'General', 'Cardiology', 'Dermatology', 'Pediatrics', 'Gynecology', 'Orthopedics'];

export default function DoctorsPage({ onBack, onSelectDoctor, initialSpecialty = 'All' }) {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      try {
        const res = await api.getDoctors(selectedSpecialty);
        setDoctors(res || []);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, [selectedSpecialty]);

  const filteredDoctors = doctors.filter(doc => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    const name = (doc.full_name || '').toLowerCase();
    const spec = (doc.specialty || '').toLowerCase();
    const serviceName = (doc.service?.name || '').toLowerCase();
    const bio = (doc.bio || '').toLowerCase();

    if (
      name.includes(term) ||
      spec.includes(term) ||
      serviceName.includes(term) ||
      bio.includes(term)
    ) {
      return true;
    }

    // Common multilingual keywords for cardiology, general checkup, etc.
    const isCardio = term.includes('kardio') || term.includes('cardio') || term.includes('yurak');
    if (isCardio && (spec.includes('kardiolog') || serviceName.includes('cardio'))) return true;

    const isGeneral = term.includes('umumiy') || term.includes('terapevt') || term.includes('general');
    if (isGeneral && (spec.includes('umumiy') || serviceName.includes('general'))) return true;

    const isDerma = term.includes('derma') || term.includes('teri');
    if (isDerma && (spec.includes('dermatolog') || serviceName.includes('derma'))) return true;

    const isPediatric = term.includes('bolalar') || term.includes('pediatr');
    if (isPediatric && (spec.includes('bolalar') || serviceName.includes('pediatr'))) return true;

    const isGyneco = term.includes('ginekolog') || term.includes('gyneco') || term.includes('akusher') || term.includes('ayol');
    if (isGyneco && (spec.includes('ginekolog') || serviceName.includes('gyneco'))) return true;

    const isOrtho = term.includes('ortoped') || term.includes('travmatolog') || term.includes('ortho') || term.includes('suyak');
    if (isOrtho && (spec.includes('ortoped') || serviceName.includes('ortho'))) return true;

    return false;
  });

  const getSpecialtyLabel = (spec) => {
    switch (spec) {
      case 'All': return t('specialtyAll');
      case 'General': return t('specialtyGeneral');
      case 'Cardiology': return t('specialtyCardiology');
      case 'Dermatology': return t('specialtyDermatology');
      case 'Pediatrics': return t('specialtyPediatrics');
      case 'Gynecology': return t('specialtyGynecology');
      case 'Orthopedics': return t('specialtyOrthopedics');
      default: return spec;
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '16px'
            }}
          >
            <ArrowLeft size={18} /> {t('back')}
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {t('doctorsHeaderTitle')}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('doctorsHeaderSubtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('searchDoctorInput')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              fontSize: '15px',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        {/* Specialty Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '28px'
        }}>
          {SPECIALTIES.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`pill-filter ${selectedSpecialty === spec ? 'active' : ''}`}
            >
              {getSpecialtyLabel(spec)}
            </button>
          ))}
        </div>

        {/* Doctors Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            {t('loading')}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>{t('noDoctorsFound')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Doctor Left Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
                  <img
                    src={doctor.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                    alt={doctor.full_name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border-light)',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                      {doctor.full_name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                      {doctor.specialty}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontWeight: 700 }}>
                        <Star size={13} fill="#D97706" /> {doctor.rating}
                      </span>
                      <span style={{ color: 'var(--border-light)' }}>•</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {doctor.experience_years} {t('experience')}
                      </span>
                      <span style={{ color: 'var(--border-light)' }}>•</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        ${doctor.consultation_fee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <button
                  onClick={() => onSelectDoctor(doctor)}
                  className="btn-primary"
                  style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {t('bookAppointmentBtn')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
