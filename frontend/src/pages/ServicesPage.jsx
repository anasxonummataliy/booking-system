import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, ChevronRight, Stethoscope, Heart, Baby, Activity, Bone, Shield, Clock } from 'lucide-react';

export default function ServicesPage({ onBack, onSelectService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await api.getServices();
        setServices(res);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'heart': return <Heart size={24} color="#EF4444" />;
      case 'baby': return <Baby size={24} color="#10B981" />;
      case 'droplet': return <Activity size={24} color="#F59E0B" />;
      case 'bone': return <Bone size={24} color="#8B5CF6" />;
      case 'female': return <Shield size={24} color="#EC4899" />;
      default: return <Stethoscope size={24} color="var(--primary)" />;
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
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
            Our Services
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Choose a service you want to book
          </p>
        </div>

        {/* Services List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading medical services...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {services.map(svc => (
              <div
                key={svc.id}
                onClick={() => onSelectService(svc.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {renderIcon(svc.icon)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {svc.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {svc.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Clock size={14} /> {svc.duration} min
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        ${svc.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-page)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
