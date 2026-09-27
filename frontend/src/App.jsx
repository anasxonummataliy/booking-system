import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import MobileDrawer from './components/MobileDrawer';
import AuthModal from './components/AuthModal';
import BookingConfirmationModal from './components/BookingConfirmationModal';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorBookingPage from './pages/DoctorBookingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Page navigation state: 'home' | 'services' | 'doctors' | 'doctor-booking' | 'dashboard' | 'profile' | 'admin'
  const [activePage, setActivePage] = useState('home');
  
  // Doctor booking state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState(null);
  
  // Modals & Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectDoctor = (doctor, initialDate = null) => {
    setSelectedDoctor(doctor);
    setSelectedBookingDate(initialDate);
    setActivePage('doctor-booking');
  };

  const handleSelectService = () => {
    setActivePage('doctors');
  };

  const handleBookingSuccess = (booking) => {
    setConfirmedBooking(booking);
    setConfirmationModalOpen(true);
  };

  // If authenticated as admin, ONLY show AdminDashboard (no patient navbar/bottom nav/drawer)
  if (isAuthenticated && isAdmin) {
    return <AdminDashboard onNavigate={setActivePage} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Main Pages */}
      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <HomePage
            onSelectDoctor={handleSelectDoctor}
            onSelectService={handleSelectService}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'services' && (
          <ServicesPage
            onBack={() => setActivePage('home')}
            onSelectService={handleSelectService}
          />
        )}

        {activePage === 'doctors' && (
          <DoctorsPage
            onBack={() => setActivePage('home')}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {activePage === 'doctor-booking' && selectedDoctor && (
          <DoctorBookingPage
            doctor={selectedDoctor}
            initialDate={selectedBookingDate}
            onBack={() => setActivePage('doctors')}
            onBookingSuccess={handleBookingSuccess}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activePage === 'dashboard' && (
          <UserDashboard
            onNavigate={setActivePage}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboard
            onNavigate={setActivePage}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <BottomNav
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAuth={handleOpenAuth}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAuth={handleOpenAuth}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <BookingConfirmationModal
        isOpen={confirmationModalOpen}
        booking={confirmedBooking}
        onClose={() => setConfirmationModalOpen(false)}
        onViewAppointments={() => {
          setConfirmationModalOpen(false);
          setActivePage('dashboard');
        }}
        onBookAnother={() => {
          setConfirmationModalOpen(false);
          setActivePage('doctors');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
