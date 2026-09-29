import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Mail, Lock, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { formatErrorMessage } from '../utils/errorHandler';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, register, quickLoginAsAnasxon, quickLoginAsAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, full_name: fullName, phone });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(formatErrorMessage(err, language));
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (type) => {
    setError('');
    setLoading(true);
    try {
      if (type === 'user') {
        await quickLoginAsAnasxon();
      } else if (type === 'admin') {
        await quickLoginAsAdmin();
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(formatErrorMessage(err, language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {mode === 'login' ? t('loginHeader') : t('registerHeader')}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mode === 'login' 
                ? t('loginSubtitle')
                : t('registerSubtitle')}
            </p>
          </div>
          <button
            id="auth-modal-close"
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Demo Fast Logins Box */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          border: '1px dashed var(--border-light)',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            {t('quickDemoButtons')}
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <button
              id="demo-user-btn"
              type="button"
              onClick={() => handleDemo('user')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '9px 10px', justifyContent: 'center', fontWeight: 600 }}
            >
              👤 User (Anasxon)
            </button>
            <button
              id="demo-admin-btn"
              type="button"
              onClick={() => handleDemo('admin')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '9px 10px', justifyContent: 'center', fontWeight: 600 }}
            >
              🛠️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('fullNamePlaceholder')}
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    id="auth-fullname-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  {t('phonePlaceholder')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    id="auth-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              {t('emailPlaceholder')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@healthplus.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              {t('passwordPlaceholder')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '15px' }}
          >
            {loading ? t('loading') : (mode === 'login' ? t('navLogin') : t('navRegister'))}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>
              {t('dontHaveAccount')}{' '}
              <button
                id="auth-switch-mode-btn"
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                style={{ color: 'var(--primary)', fontWeight: 700 }}
              >
                {t('navRegister')}
              </button>
            </>
          ) : (
            <>
              {t('alreadyHaveAccount')}{' '}
              <button
                id="auth-switch-mode-btn"
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                style={{ color: 'var(--primary)', fontWeight: 700 }}
              >
                {t('navLogin')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
