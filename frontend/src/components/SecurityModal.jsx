import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { formatErrorMessage } from '../utils/errorHandler';

export default function SecurityModal({ isOpen, onClose }) {
  const { t, language } = useLanguage();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDontMatch'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('newPasswordPlaceholder'));
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(res.message || t('passwordChangedSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(formatErrorMessage(err, language));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {t('securityModalTitle')}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {t('securityModalSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Change Password Form */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Key size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {t('changePasswordTab')}
            </h3>
          </div>

          {passwordError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '14px'
            }}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '14px'
            }}>
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Current Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {t('currentPassword')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('currentPasswordPlaceholder')}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {t('newPassword')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder')}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {t('confirmNewPassword')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmNewPasswordPlaceholder')}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary"
              style={{
                marginTop: '6px',
                padding: '11px',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              {passwordLoading ? t('loading') : t('updatePasswordBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
