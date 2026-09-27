import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Search, Star, Calendar, Clock } from 'lucide-react';

const SPECIALTIES = ['All', 'General', 'Cardiology', 'Dermatology', 'Pediatrics', 'Gynecology'];

export default function DoctorsPage({ onBack, onSelectDoctor, initialSpecialty = 'All' }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      try {
        const res = await api.getDoctors(selectedSpecialty);
        setDoctors(res);
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
    const term = searchTerm.toLowerCase();
    return (
      doc.full_name.toLowerCase().includes(term) ||
      doc.specialty.toLowerCase().includes(term)
    );
  });

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
            <ArrowLeft size={18} /> Back
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Doctors
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Find the right specialist for your needs
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search doctor by name or specialty..."
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
              {spec}
            </button>
          ))}
        </div>

        {/* Doctors Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Finding available specialists...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>No doctors found</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Try adjusting your search or specialty filters</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Doctor Left Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <img
                    src={doctor.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                    alt={doctor.full_name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border-light)'
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                      {doctor.full_name}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {doctor.specialty}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 700 }}>
                        <Star size={14} fill="#D97706" /> {doctor.rating}
                      </span>
                      <span style={{ color: 'var(--border-light)' }}>•</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {doctor.experience_years} years experience
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
                  style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)' }}
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
