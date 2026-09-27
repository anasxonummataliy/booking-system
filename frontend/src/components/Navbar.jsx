import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, LogOut, LayoutDashboard, Shield, Calendar } from 'lucide-react';

export default function Navbar({ onOpenAuth, activePage, setActivePage }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActivePage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--primary)'
          }}>
            <Plus size={22} color="var(--primary)" strokeWidth={3} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {t('appName')}<span style={{ color: 'var(--primary)' }}>{t('appNameAccent')}</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { id: 'home', label: t('navHome') },
            { id: 'services', label: t('navServices') },
            { id: 'doctors', label: t('navDoctors') },
            { id: 'dashboard', label: t('navAppointments'), authRequired: true },
          ].map(link => {
            if (link.authRequired && !isAuthenticated) return null;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                style={{
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '6px 0',
                  transition: 'all 0.2s'
                }}
              >
                {link.label}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => setActivePage('admin')}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#4338CA',
                backgroundColor: '#EEF2FF',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Shield size={15} /> {t('navAdmin')}
            </button>
          )}
        </nav>

        {/* Right CTA / Language Switcher / Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Switcher Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            border: '1px solid var(--border-light)'
          }}>
            <button
              onClick={() => setLanguage('uz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: language === 'uz' ? 700 : 500,
                backgroundColor: language === 'uz' ? '#FFFFFF' : 'transparent',
                color: language === 'uz' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: language === 'uz' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              title="O'zbekcha"
            >
              🇺🇿 UZ
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: language === 'en' ? 700 : 500,
                backgroundColor: language === 'en' ? '#FFFFFF' : 'transparent',
                color: language === 'en' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: language === 'en' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              title="English"
            >
              🇬🇧 EN
            </button>
          </div>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                    {user?.full_name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user?.role}
                  </span>
                </div>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '210px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-light)',
                  padding: '8px',
                  zIndex: 200
                }}>
                  <button
                    onClick={() => { setActivePage('dashboard'); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Calendar size={16} color="var(--primary)" /> {t('navAppointments')}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { setActivePage('admin'); setDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        color: 'var(--text-main)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LayoutDashboard size={16} color="#4338CA" /> {t('navAdmin')}
                    </button>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '6px 0' }} />

                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'var(--danger-text)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} /> {t('navLogout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => onOpenAuth('login')}
                style={{
                  padding: '9px 18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}
              >
                {t('navLogin')}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn-primary"
                style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)' }}
              >
                {t('navRegister')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
