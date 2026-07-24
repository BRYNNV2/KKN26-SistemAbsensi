import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Hash, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { registerUser } from '../lib/supabase';

export default function RegisterPage({ onNavigate }) {
  const [nama, setNama] = useState('');
  const [identifier, setIdentifier] = useState(''); // NIM or NIP
  const [email, setEmail] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nama.trim() || !identifier.trim() || !email.trim() || !password) {
      setErrorMsg('Lengkapi semua kolom pendaftaran.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    const result = await registerUser({ role: 'auto', nama, identifier, email, kelompok, password });
    setLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setSuccessMsg('Pendaftaran Akun KKN Berhasil!');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => onNavigate('login'), 1800);
    } else {
      setErrorMsg(result.error || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="auth-card">
      <div className="sso-badge-header">
        <div className="sso-logo-circle">
          <Award size={28} />
        </div>
        <h2 className="sso-title">Registrasi Akun KKN</h2>
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
          <label className="input-label">Nama Lengkap & Gelar</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Budi Pratama, S.Kom"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={loading || isSuccess}
            />
            <User className="input-icon" size={17} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">ID Pengguna (NIM / NIP)</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan NIM (Mahasiswa) atau NIP (Dosen)"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading || isSuccess}
            />
            <Hash className="input-icon" size={17} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Email Kampus</label>
          <div className="input-wrapper">
            <input
              type="email"
              className="form-input"
              placeholder="nama@univ.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || isSuccess}
            />
            <Mail className="input-icon" size={17} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Kelompok KKN / Wilayah Binaan</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kelompok 14 - Desa Sukamaju"
              value={kelompok}
              onChange={(e) => setKelompok(e.target.value)}
              disabled={loading || isSuccess}
            />
            <User className="input-icon" size={17} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Kata Sandi</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Minimal 6 karakter"
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

        <div className="input-group">
          <label className="input-label">Konfirmasi Kata Sandi</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || isSuccess}
            />
            <Lock className="input-icon" size={17} />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading || isSuccess}>
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Mendaftarkan...</span>
            </>
          ) : (
            <span>Daftar Akun KKN</span>
          )}
        </button>
      </form>

      <div className="card-footer">
        Sudah memiliki akun?{' '}
        <a
          href="#login"
          className="switch-page-link"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('login');
          }}
        >
          Masuk Sekarang
        </a>
      </div>
    </div>
  );
}
