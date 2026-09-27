import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function DoctorBookingPage({
  doctor,
  initialDate,
  onBack,
  onBookingSuccess,
  onOpenAuth
}) {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('about');
  
  // Calendar state
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    async function loadSlots() {
      if (!doctor) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      setBookingError('');
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const res = await api.getDoctorSlots(doctor.id, dateStr);
        setSlots(res);
      } catch (err) {
        console.error("Failed to load doctor slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [doctor, selectedDate]);

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateDisabled = (dayNum) => {
    const candidate = new Date(year, month, dayNum);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return candidate < startOfToday;
  };

  const handleSelectDay = (dayNum) => {
    if (isDateDisabled(dayNum)) return;
    const newSelected = new Date(year, month, dayNum);
    setSelectedDate(newSelected);
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (!selectedSlot) return;

    setBookingLoading(true);
    setBookingError('');
    try {
      const payload = {
        doctor_id: doctor.id,
        service_id: doctor.service_id || 1,
        start_time: selectedSlot.start_time,
        notes: `Patient booking with ${doctor.full_name}`
      };
      const createdBooking = await api.createBooking(payload);
      onBookingSuccess(createdBooking);
    } catch (err) {
      setBookingError(err.message || "Failed to complete appointment reservation.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ padding: '36px 0 80px', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Top Back & Stepper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}
          >
            <ArrowLeft size={18} /> {t('back')}
          </button>

          {/* Stepper Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>✓</div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{t('navDoctors')}</span>
            </div>

            <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--border-light)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>2</div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{t('selectedTimeLabel')}</span>
            </div>

            <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--border-light)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#E2E8F0',
                color: 'var(--text-muted)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>3</div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{t('confirm')}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Booking Layout */}
        <div className="grid-responsive-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.25fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Left Column: Doctor Profile Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
              <img
                src={doctor.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                alt={doctor.full_name}
                style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EFF6FF' }}
              />
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {doctor.full_name}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {doctor.specialty}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 700 }}>
                    <Star size={14} fill="#D97706" /> {doctor.rating}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>({doctor.reviews_count} {t('reviews')})</span>
                  <span style={{ color: 'var(--border-light)' }}>•</span>
                  <span style={{ color: 'var(--text-muted)' }}>{doctor.experience_years} {t('experience')}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              "{doctor.bio}"
            </p>

            {/* Quick Meta Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>{t('languages')}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{doctor.languages}</span>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>{t('consultationFee')}</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>${doctor.consultation_fee}</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
              {['about', 'services', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'about' ? t('aboutDoctorTab') : (tab === 'services' ? t('navServices') : t('reviews'))}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>{t('education')}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{doctor.education}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>{t('specialtyAll')}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{doctor.specialty}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>{t('clinicLocation')}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{doctor.location}</span>
                </div>
              </div>
            )}
            {activeTab === 'services' && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <p>• In-person comprehensive clinical exam</p>
                <p>• Prescription renewal & dosage adjustment</p>
                <p>• Diagnostic report and laboratory analysis</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Alex Turner ⭐⭐⭐⭐⭐</div>
                  <p>"Extremely thorough and attentive doctor. Explained all treatments clearly!"</p>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Sevinch T. ⭐⭐⭐⭐⭐</div>
                  <p>"Very gentle and knowledgeable. Highly recommended!"</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Calendar & Slot Picker */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              {t('bookingPageTitle')}
            </h3>

            {/* Error banner */}
            {bookingError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '18px'
              }}>
                <AlertCircle size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Calendar Widget */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              border: '1px solid var(--border-light)',
              marginBottom: '24px'
            }}>
              {/* Calendar Month Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {monthName} {year}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handlePrevMonth}
                    style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '8px'
              }}>
                {(language === 'uz'
                  ? ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
                  : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
                ).map(d => (
                  <div key={d} style={{ padding: '4px' }}>{d}</div>
                ))}
              </div>

              {/* Calendar days grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                textAlign: 'center'
              }}>
                {/* Blank days before day 1 */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`blank-${idx}`} style={{ height: '36px' }}></div>
                ))}

                {/* Month days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const currentDay = new Date(year, month, dayNum);
                  const isSelected = isSameDay(currentDay, selectedDate);
                  const disabled = isDateDisabled(dayNum);

                  return (
                    <button
                      key={dayNum}
                      disabled={disabled}
                      onClick={() => handleSelectDay(dayNum)}
                      style={{
                        height: '36px',
                        width: '36px',
                        margin: '0 auto',
                        borderRadius: '50%',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? '#FFFFFF' : (disabled ? '#CBD5E1' : 'var(--text-main)'),
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected && !disabled) e.currentTarget.style.backgroundColor = '#E2E8F0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && !disabled) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Time Slots Section */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('selectTimeStep')}
                </label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {selectedDate.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {loadingSlots ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {t('loading')}
                </div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                  {t('noSlotsAvailable')}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '10px'
                }}>
                  {slots.map((slot, idx) => {
                    const isSelected = selectedSlot?.start_time === slot.start_time;
                    const available = slot.is_available;

                    return (
                      <button
                        key={idx}
                        disabled={!available}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 600,
                          textAlign: 'center',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                          backgroundColor: isSelected ? '#EFF6FF' : (available ? '#FFFFFF' : '#F1F5F9'),
                          color: isSelected ? 'var(--primary)' : (available ? 'var(--text-main)' : '#94A3B8'),
                          cursor: available ? 'pointer' : 'not-allowed',
                          textDecoration: available ? 'none' : 'line-through',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {slot.display_time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookAppointment}
              disabled={!selectedSlot || bookingLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {bookingLoading ? t('loading') : (!isAuthenticated ? t('loginToBookAction') : `${t('confirmBookingAction')} ($${doctor.consultation_fee})`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
