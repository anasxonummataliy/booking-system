import React from 'react';
import { Home, Calendar, Users, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({ activePage, setActivePage, onOpenAuth, onOpenDrawer }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
    } else {
      if (onOpenDrawer) {
        onOpenDrawer();
      } else {
        setActivePage('dashboard');
      }
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      {/* Home Tab */}
      <button
        onClick={() => setActivePage('home')}
        className={`bottom-nav-item ${activePage === 'home' ? 'active' : ''}`}
        aria-label={t('bottomNavHome')}
      >
        <Home size={20} strokeWidth={activePage === 'home' ? 2.5 : 2} />
        <span>{t('bottomNavHome')}</span>
      </button>

      {/* Appointments Tab */}
      <button
        onClick={() => {
          if (!isAuthenticated) {
            onOpenAuth('login');
          } else {
            setActivePage('dashboard');
          }
        }}
        className={`bottom-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
        aria-label={t('bottomNavAppointments')}
      >
        <Calendar size={20} strokeWidth={activePage === 'dashboard' ? 2.5 : 2} />
        <span>{t('bottomNavAppointments')}</span>
      </button>

      {/* Doctors Tab */}
      <button
        onClick={() => setActivePage('doctors')}
        className={`bottom-nav-item ${activePage === 'doctors' || activePage === 'doctor-booking' ? 'active' : ''}`}
        aria-label={t('bottomNavDoctors')}
      >
        <Users size={20} strokeWidth={activePage === 'doctors' || activePage === 'doctor-booking' ? 2.5 : 2} />
        <span>{t('bottomNavDoctors')}</span>
      </button>

      {/* Admin Tab (If Admin) or Profile Tab */}
      {isAdmin ? (
        <button
          onClick={() => setActivePage('admin')}
          className={`bottom-nav-item ${activePage === 'admin' ? 'active' : ''}`}
          aria-label={t('navAdmin')}
        >
          <Shield size={20} strokeWidth={activePage === 'admin' ? 2.5 : 2} />
          <span>Admin</span>
        </button>
      ) : (
        <button
          onClick={handleProfileClick}
          className={`bottom-nav-item ${activePage === 'profile' ? 'active' : ''}`}
          aria-label={t('bottomNavProfile')}
        >
          <User size={20} strokeWidth={activePage === 'profile' ? 2.5 : 2} />
          <span>{t('bottomNavProfile')}</span>
        </button>
      )}
    </nav>
  );
}
