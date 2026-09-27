import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import BookingConfirmationModal from './components/BookingConfirmationModal';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorBookingPage from './pages/DoctorBookingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  
  // Page navigation state: 'home' | 'services' | 'doctors' | 'doctor-booking' | 'dashboard' | 'admin'
  const [activePage, setActivePage] = useState('home');
  
  // Doctor booking state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState(null);
  
  // Modals state
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activePage={activePage}
        setActivePage={setActivePage}
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

        {activePage === 'admin' && (
          <AdminDashboard
            onNavigate={setActivePage}
          />
        )}
      </main>

      {/* Modals */}
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
