import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
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

  return (
    <div className="app-container">
      {/* Main Centered Content Area */}
      <main className="content-wrapper-centered">
        <div ref={cardContainerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
          {currentPage === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
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
