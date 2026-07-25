import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { requestPasswordReset } from '../../lib/supabase';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Masukkan email kampus yang valid.');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Tautan pemulihan telah dikirimkan ke email kampus Anda.');
    } else {
      setErrorMsg(result.error || 'Gagal mengirimkan tautan pemulihan.');
    }
  };

  return (
    <div className="auth-card">
      <div className="sso-badge-header">
        <div className="sso-logo-circle">
          <Award size={28} />
        </div>
        <h2 className="sso-title">Lupa Password</h2>
      </div>

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

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="forgot-email-input">Email Kampus Terdaftar</label>
          <div className="input-wrapper">
            <input
              id="forgot-email-input"
              type="email"
              className="form-input"
              placeholder="nama@univ.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!successMsg}
            />
            <Mail className="input-icon" size={17} />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading || !!successMsg}>
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Mengirim Tautan...</span>
            </>
          ) : (
            <span>Kirim Tautan Reset</span>
          )}
        </button>
      </form>

      <div className="card-footer">
        <a
          href="#login"
          className="switch-page-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('login');
          }}
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Halaman Login</span>
        </a>
      </div>
    </div>
  );
}
