import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authenticateUser } from '../lib/supabase';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Masukkan User ID (NIM / NIP / Email)');
      return;
    }

    if (!password) {
      setErrorMsg('Masukkan Password');
      return;
    }

    setLoading(true);
    const result = await authenticateUser({ identifier, password, role: 'auto' });
    setLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setSuccessMsg(`Selamat Datang, ${result.user.name || 'Pengguna'}! Login Berhasil.`);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Redirect to Admin Dashboard after celebration animation
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      }, 1200);
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="auth-card">
      {/* Overlapping Top White Badge Header matching UMRAH SSO */}
      <div className="sso-badge-header">
        <div className="sso-logo-circle">
          <Award size={28} />
        </div>
        <h2 className="sso-title">Single Sign On</h2>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* User ID Field (NIM / NIP / Email) */}
        <div className="input-group">
          <label className="input-label" htmlFor="identifier-input">
            ID Pengguna (NIM / NIP / Email)
          </label>
          <div className="input-wrapper">
            <input
              id="identifier-input"
              type="text"
              className="form-input"
              placeholder="admin.kkn62@gmail.com / User ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading || isSuccess}
            />
            <User className="input-icon" size={17} />
          </div>
        </div>

        {/* Password Field */}
        <div className="input-group">
          <label className="input-label" htmlFor="password-input">
            Kata Sandi
          </label>
          <div className="input-wrapper">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Masukkan Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || isSuccess}
            />
            <Lock className="input-icon" size={17} />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Solid Yellow Submit Button */}
        <button type="submit" className="btn-submit" disabled={loading || isSuccess}>
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>

        {/* Centered Lupa Password Link */}
        <div style={{ textAlign: 'center', marginTop: '0.3rem' }}>
          <a
            href="#forgot"
            className="forgot-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('forgot-password');
            }}
          >
            Lupa Password?
          </a>
        </div>

        {/* SSO Divider Line */}
        <div className="sso-divider">
          <span>Atau</span>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          className="btn-google"
          onClick={() => {
            setIdentifier('admin.kkn62@gmail.com');
            setPassword('Admin#KKN622026');
            setTimeout(() => {
              handleSubmit({ preventDefault: () => {} });
            }, 300);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Masuk sebagai Admin Demo</span>
        </button>
      </form>
    </div>
  );
}
