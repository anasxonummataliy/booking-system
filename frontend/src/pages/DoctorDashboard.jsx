import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateTime } from '../utils/dateFormatter';
import {
  Stethoscope, Calendar, Clock, CheckCircle, XCircle, LogOut,
  Search, Users, Star, Activity, AlertCircle, RefreshCw, Menu, ChevronDown,
} from 'lucide-react';

const STATUS_COLORS = {
  Pending:   { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  Confirmed: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  Cancelled: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  Completed: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
};

const STATUS_LABELS_UZ = {
  Pending: 'Kutilmoqda', Confirmed: 'Tasdiqlangan',
  Cancelled: 'Bekor qilingan', Completed: 'Yakunlangan',
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#374151', dot: '#6b7280' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {STATUS_LABELS_UZ[status] || status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
      borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, fontWeight: 500 }}>{label}</p>
          <p style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>{value}</p>
          {sub && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '2px 0 0' }}>{sub}</p>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, loading, color, icon, label, outline }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
      background: outline ? 'transparent' : color,
      border: outline ? `1.5px solid ${color}` : 'none',
      color: outline ? color : '#fff',
    }}>
      {icon}{loading ? '...' : label}
    </button>
  );
}

function BookingCard({ booking: b, isLoading, onConfirm, onComplete, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        onClick={() => setExpanded(p => !p)}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>
          {(b.user?.full_name || 'B')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{b.user?.full_name || "Noma'lum bemor"}</span>
            <StatusBadge status={b.status} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>📅 {formatDateTime(b.start_time)}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>🔖 {b.booking_reference}</span>
            <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>${b.total_price}</span>
          </div>
        </div>
        <ChevronDown size={16} color="rgba(255,255,255,0.3)"
          style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 2px' }}>Xizmat</p>
              <p style={{ color: '#fff', fontSize: 13, margin: 0 }}>{b.service?.name || '—'}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 2px' }}>Telefon</p>
              <p style={{ color: '#fff', fontSize: 13, margin: 0 }}>{b.user?.phone || '—'}</p>
            </div>
            {b.notes && (
              <div style={{ width: '100%' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 2px' }}>Eslatma</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{b.notes}</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {b.status === 'Pending' && (
              <ActionBtn onClick={onConfirm} loading={isLoading} color="#10b981" icon={<CheckCircle size={14} />} label="Tasdiqlash" />
            )}
            {b.status === 'Confirmed' && (
              <ActionBtn onClick={onComplete} loading={isLoading} color="#3b82f6" icon={<Activity size={14} />} label="Yakunlash" />
            )}
            {b.status !== 'Cancelled' && b.status !== 'Completed' && (
              <ActionBtn onClick={onCancel} loading={isLoading} color="#ef4444" icon={<XCircle size={14} />} label="Bekor qilish" outline />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor: doc, isMe }) {
  return (
    <div style={{
      background: isMe ? 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))' : 'rgba(255,255,255,0.05)',
      border: isMe ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.09)',
      borderRadius: 14, padding: '18px 16px',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: isMe ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 18, overflow: 'hidden',
        }}>
          {doc.avatar_url
            ? <img src={doc.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : doc.full_name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>{doc.full_name}</p>
            {isMe && <span style={{ background: '#10b981', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>SIZ</span>}
          </div>
          <p style={{ color: '#10b981', fontSize: 12, margin: '2px 0 6px', fontWeight: 500 }}>{doc.specialty}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>⭐ {doc.rating}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>🏥 {doc.experience_years} yil</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: doc.is_active ? '#10b981' : '#f87171', fontSize: 11, fontWeight: 600, background: doc.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 20 }}>
          {doc.is_active ? '● Faol' : '● Nofaol'}
        </span>
        <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>${doc.consultation_fee}</span>
      </div>
    </div>
  );
}

export default function DoctorDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [profile, myBookings, allDoctors] = await Promise.all([
        api.getDoctorPortalProfile(),
        api.getDoctorPortalBookings(filterStatus === 'All' ? undefined : filterStatus),
        api.getDoctors(),
      ]);
      setDoctorProfile(profile?.error ? null : profile);
      setBookings(myBookings || []);
      setDoctors(allDoctors || []);
    } catch (err) {
      setError(err.message || "Ma'lumotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusUpdate = async (bookingId, newStatus, reason) => {
    setActionLoadingId(bookingId);
    try {
      await api.updateDoctorPortalBookingStatus(bookingId, newStatus, reason);
      await loadData();
    } catch (err) {
      alert(err.message || 'Xato yuz berdi');
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
  };

  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return !q || b.booking_reference?.toLowerCase().includes(q) || b.user?.full_name?.toLowerCase().includes(q);
  });

  const sidebarNavItem = (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 20px', margin: '2px 10px', borderRadius: 10,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg,#10b981,#059669)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
    fontWeight: active ? 600 : 400, fontSize: 14,
    border: 'none', textAlign: 'left', width: 'calc(100% - 20px)',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', fontFamily: "'Inter',-apple-system,sans-serif", display: 'flex' }}>
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, backdropFilter: 'blur(4px)' }} />}

      {/* Sidebar */}
      <aside style={{
        width: 250, background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={18} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>Doctor Portal</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Health Plus</p>
            </div>
          </div>
          {doctorProfile && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
              <p style={{ color: '#10b981', fontSize: 12, fontWeight: 600, margin: '0 0 2px' }}>{doctorProfile.full_name}</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, margin: 0 }}>{doctorProfile.specialty}</p>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
                <Star size={11} color="#f59e0b" fill="#f59e0b" />
                <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600 }}>{doctorProfile.rating}</span>
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[{ id: 'bookings', label: 'Mening qabullarim', Icon: Calendar }, { id: 'doctors', label: "Shifokorlar ro'yxati", Icon: Users }].map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setDrawerOpen(false); }} style={sidebarNavItem(activeTab === id)}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setLanguage(language === 'uz' ? 'en' : 'uz')} style={{ ...sidebarNavItem(false), width: '100%', marginBottom: 4 }}>
            🌐 {language === 'uz' ? 'English' : "O'zbek"}
          </button>
          <button onClick={logout} style={{ ...sidebarNavItem(false), width: '100%', color: '#f87171' }}>
            <LogOut size={16} />Chiqish
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Xush kelibsiz, Dr. {doctorProfile?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || ''}! 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '3px 0 0' }}>
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={loadData} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Yangilash
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard icon={Calendar} label="Jami qabullar" value={stats.total} color="#3b82f6" />
          <StatCard icon={Clock} label="Kutilmoqda" value={stats.pending} color="#f59e0b" sub="Tasdiqlash kerak" />
          <StatCard icon={CheckCircle} label="Tasdiqlangan" value={stats.confirmed} color="#10b981" />
          <StatCard icon={Activity} label="Yakunlangan" value={stats.completed} color="#8b5cf6" />
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Bemor ismi yoki kod..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', padding: '9px 12px 9px 36px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: filterStatus === s ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.06)',
                  border: filterStatus === s ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: filterStatus === s ? '#fff' : 'rgba(255,255,255,0.6)',
                }}>
                  {s === 'All' ? 'Barchasi' : STATUS_LABELS_UZ[s] || s}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(16,185,129,0.3)', borderTopColor: '#10b981', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                Yuklanmoqda...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                <Calendar size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Hozircha qabullar mavjud emas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredBookings.map(b => (
                  <BookingCard key={b.id} booking={b} isLoading={actionLoadingId === b.id}
                    onConfirm={() => handleStatusUpdate(b.id, 'Confirmed')}
                    onComplete={() => handleStatusUpdate(b.id, 'Completed')}
                    onCancel={() => {
                      const reason = window.prompt('Bekor qilish sababini kiriting:');
                      if (reason !== null) handleStatusUpdate(b.id, 'Cancelled', reason);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Barcha shifokorlar ro'yxati</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>Klinikamizning barcha mutaxassislari</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
              {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} isMe={doctorProfile?.id === doc.id} />)}
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
