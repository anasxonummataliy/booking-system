import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Globe, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SecurityModal from '../components/SecurityModal';

export default function ProfilePage({ onNavigate }) {
  const { user, logout, isAdmin, isDoctor } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneVal, setPhoneVal] = useState(user?.phone || '+998 90 123 45 67');
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  const handleSavePhone = (e) => {
    e.preventDefault();
    setIsEditingPhone(false);
    setPhoneSuccess(true);
    setTimeout(() => setPhoneSuccess(false), 3000);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <ArrowLeft size={16} />
            <span>{t('back')}</span>
          </button>
          
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
            {t('profileTitle')}
          </h1>
          
          <div style={{ width: '60px' }} /> {/* Spacer for centering */}
        </div>

        {/* User Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 20px',
          border: '1px solid var(--border-light)',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle decorative background banner */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
            opacity: 0.85
          }} />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '16px' }}>
            {/* Avatar */}
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              padding: '4px',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '-1px'
              }}>
                {getInitials(user?.full_name)}
              </div>
            </div>

            {/* Name & Role */}
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {user?.full_name || 'Anasxon Ummataliyev'}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isAdmin ? '#EEF2FF' : (isDoctor ? '#FEF3C7' : '#ECFDF5'),
                color: isAdmin ? '#4338CA' : (isDoctor ? '#B45309' : '#059669'),
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isAdmin ? `🛡️ ${t('adminRoleBadge')}` : (isDoctor ? `🩺 ${t('doctorRoleBadge')}` : `👤 ${t('patientRoleBadge')}`)}
              </span>
            </div>

            {/* Email & Phone info badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Mail size={15} color="var(--primary)" />
                <span>{user?.email || 'anasxon@healthplus.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Phone size={15} color="#10B981" />
                <span>{phoneVal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 14px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                {t('myBookingsAction')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {t('tabUpcoming')} & {t('tabPast')}
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('doctors')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 14px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                {t('navDoctors')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {t('quickActionBook')}
              </span>
            </div>
          </button>
        </div>

        {/* Settings & Details List */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          {/* Item 1: Personal Info / Phone Edit */}
          <div style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {t('personalInfo')}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {user?.full_name} • {phoneVal}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingPhone(!isEditingPhone)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F1F5F9',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={13} />
                <span>O'zgartirish</span>
              </button>
            </div>

            {/* Inline phone editor */}
            {isEditingPhone && (
              <form onSubmit={handleSavePhone} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-light)', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Save size={14} />
                  <span>{t('save')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  style={{ padding: '8px', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </form>
            )}

            {phoneSuccess && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>Telefon raqami muvaffaqiyatli saqlandi!</span>
              </div>
            )}
          </div>

          {/* Item 2: Language Selector */}
          <div style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('appLanguage')}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {language === 'uz' ? "O'zbek tili (Lotin)" : 'English (US)'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setLanguage('uz')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: language === 'uz' ? 700 : 500,
                  backgroundColor: language === 'uz' ? 'var(--primary)' : '#F1F5F9',
                  color: language === 'uz' ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                🇺🇿 UZ
              </button>
              <button
                onClick={() => setLanguage('en')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: language === 'en' ? 700 : 500,
                  backgroundColor: language === 'en' ? 'var(--primary)' : '#F1F5F9',
                  color: language === 'en' ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Item 3: Security & 2FA */}
          <div 
            onClick={() => setSecurityModalOpen(true)}
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('securitySettings')}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('securitySettingsDesc')}
                </p>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* Item 5: Help & Support */}
          <a
            href="tel:+998712000000"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Headphones size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('helpSupport')}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('helpSupportDesc')}
                </p>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </a>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            if (window.confirm(t('logoutConfirm'))) {
              logout();
              onNavigate('home');
            }
          }}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: 'var(--radius-lg)',
            color: '#DC2626',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          <LogOut size={18} />
          <span>{t('navLogout')}</span>
        </button>

        {/* Change Password Modal */}
        <SecurityModal
          isOpen={securityModalOpen}
          onClose={() => setSecurityModalOpen(false)}
        />

      </div>
    </div>
  );
}
