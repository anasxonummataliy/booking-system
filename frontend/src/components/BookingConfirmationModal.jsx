import React from 'react';
import { Check, Calendar, Clock, MapPin, DollarSign, X } from 'lucide-react';

export default function BookingConfirmationModal({ isOpen, booking, onClose, onViewAppointments, onBookAnother }) {
  if (!isOpen || !booking) return null;

  const doctor = booking.doctor || {};
  const dateFormatted = new Date(booking.start_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = new Date(booking.start_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '480px', textAlign: 'center', padding: '36px 32px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        {/* Green Checkmark Circle */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
        }}>
          <Check size={36} color="#FFFFFF" strokeWidth={3} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
          Appointment Confirmed!
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Your appointment has been successfully booked.
        </p>

        {/* Details Card */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '28px'
        }}>
          {/* Doctor Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            <img
              src={doctor.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
              alt={doctor.full_name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Doctor</span>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '2px 0 0' }}>{doctor.full_name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{doctor.specialty}</p>
            </div>
          </div>

          {/* Appointment Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={18} color="var(--primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '90px' }}>Date & Time</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                {dateFormatted} • {timeFormatted}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={18} color="var(--primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '90px' }}>Duration</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                {booking.service?.duration || 30} minutes
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={18} color="var(--primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '90px' }}>Location</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                {doctor.location || 'City Medical Center, Tashkent'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DollarSign size={18} color="var(--primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '90px' }}>Price</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>
                ${booking.total_price || 30}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onViewAppointments}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            View My Appointments
          </button>
          <button
            onClick={onBookAnother}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
