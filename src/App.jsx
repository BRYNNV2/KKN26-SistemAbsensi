import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import MahasiswaDashboardPage from './pages/mahasiswa/MahasiswaDashboardPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'forgot-password', 'dashboard'
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('admin'); // 'admin' or 'mahasiswa'
  const cardContainerRef = useRef(null);

  const handleNavigate = (newPage) => {
    if (newPage === currentPage) return;

    if (cardContainerRef.current) {
      gsap.to(cardContainerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentPage(newPage);
          gsap.fromTo(
            cardContainerRef.current,
            { opacity: 0, scale: 0.95, y: -10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }
          );
        }
      });
    } else {
      setCurrentPage(newPage);
    }
  };

  // Called when user completes authentication
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    handleNavigate('dashboard');
  };

  // Called when user logs out
  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate('login');
  };

  // Render Dashboard Page when authenticated
  if (currentPage === 'dashboard') {
    const isMahasiswa = currentUser?.role === 'mahasiswa' || 
                        currentUser?.role === 'student' || 
                        currentUser?.role === 'user' ||
                        (currentUser?.email && !currentUser.email.includes('admin') && !currentUser.email.includes('dosen'));

    if (isMahasiswa) {
      return (
        <MahasiswaDashboardPage 
          user={currentUser} 
          onLogout={handleLogout} 
        />
      );
    }

    return (
      <AdminDashboardPage 
        user={currentUser} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Main Centered Content Area for Auth */}
      <main className="content-wrapper-centered">
        <div ref={cardContainerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {currentPage === 'login' && (
            <LoginPage 
              onNavigate={handleNavigate} 
              onLoginSuccess={handleLoginSuccess}
            />
          )}
          {currentPage === 'forgot-password' && (
            <ForgotPasswordPage onNavigate={handleNavigate} />
          )}
        </div>
      </main>

      {/* Sleek Compact Bottom Footer Bar */}
      <footer className="bottom-footer">
        <div className="footer-left">
          <span>Copyright © KKN62 Sistem BrynnCodes 2026 • Portal KKN Terpadu</span>
        </div>
        <div className="footer-links">
          <a href="#panduan" onClick={(e) => { e.preventDefault(); alert('Panduan Presensi KKN62 v2.4'); }}>Panduan KKN</a>
          <a href="#bantuan" onClick={(e) => { e.preventDefault(); alert('Pusat Bantuan BrynnCodes: support@brynncodes.ac.id'); }}>Pusat Bantuan</a>
          <a href="#kontak" onClick={(e) => { e.preventDefault(); alert('Layanan Whatsapp KKN62: +62 812-3456-7890'); }}>Kontak Layanan</a>
        </div>
      </footer>
    </div>
  );
}
