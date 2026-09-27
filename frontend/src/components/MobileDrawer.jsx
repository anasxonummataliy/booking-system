import React from 'react';
import {
  Home,
  Calendar,
  Users,
  Briefcase,
  Shield,
  LogOut,
  LogIn,
  X,
  Plus,
  Globe,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function MobileDrawer({ isOpen, onClose, activePage, setActivePage, onOpenAuth }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const handleNavigate = (page) => {
    setActivePage(page);
    onClose();
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
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
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Health<span style={{ color: '#38BDF8' }}>Plus</span>
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              color: '#94A3B8',
              backgroundColor: '#1E293B',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card if logged in */}
        {isAuthenticated && (
          <div 
            onClick={() => handleNavigate('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#1E293B',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '22px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px'
            }}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: activePage === 'home' ? 700 : 500,
              color: activePage === 'home' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: activePage === 'home' ? 'var(--primary)' : 'transparent',
              textAlign: 'left'
            }}
          >
            <Home size={19} />
            <span>{t('navHome')}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleNavigate('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: activePage === 'profile' ? 700 : 500,
                color: activePage === 'profile' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activePage === 'profile' ? 'var(--primary)' : 'transparent',
                textAlign: 'left'
              }}
            >
              <User size={19} />
              <span>{t('bottomNavProfile')}</span>
            </button>
          )}

          {!isAdmin && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onClose();
                  onOpenAuth('login');
                } else {
                  handleNavigate('dashboard');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: activePage === 'dashboard' ? 700 : 500,
                color: activePage === 'dashboard' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activePage === 'dashboard' ? 'var(--primary)' : 'transparent',
                textAlign: 'left'
              }}
            >
              <Calendar size={19} />
              <span>{t('navAppointments')}</span>
            </button>
          )}

          <button
            onClick={() => handleNavigate('doctors')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: activePage === 'doctors' ? 700 : 500,
              color: activePage === 'doctors' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: activePage === 'doctors' ? 'var(--primary)' : 'transparent',
              textAlign: 'left'
            }}
          >
            <Users size={19} />
            <span>{t('navDoctors')}</span>
          </button>

          <button
            onClick={() => handleNavigate('services')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: activePage === 'services' ? 700 : 500,
              color: activePage === 'services' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: activePage === 'services' ? 'var(--primary)' : 'transparent',
              textAlign: 'left'
            }}
          >
            <Briefcase size={19} />
            <span>{t('navServices')}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNavigate('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: activePage === 'admin' ? 700 : 500,
                color: '#38BDF8',
                backgroundColor: activePage === 'admin' ? '#1E293B' : 'transparent',
                textAlign: 'left'
              }}
            >
              <Shield size={19} />
              <span>{t('navAdmin')}</span>
            </button>
          )}
        </nav>

        {/* Language Switcher inside Drawer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} /> {t('language')}
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
                backgroundColor: language === 'uz' ? 'var(--primary)' : '#1E293B'
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
                backgroundColor: language === 'en' ? 'var(--primary)' : '#1E293B'
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Bottom Auth actions */}
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
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
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <LogOut size={18} />
              <span>{t('navLogout')}</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('login');
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                <LogIn size={18} />
                <span>{t('navLogin')}</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('register');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                {t('navRegister')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
