import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Hash, MapPin, Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddMahasiswaModal({ isOpen, onClose, onAddSuccess }) {
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [kelompok, setKelompok] = useState('Kelompok 14 - Desa Sukamaju');
  const [dosenDpl, setDosenDpl] = useState('Dr. Ir. Hendra Wijaya, M.T.');
  const [password, setPassword] = useState('12345678');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nama.trim() || !nim.trim() || !email.trim() || !password) {
      setErrorMsg('Mohon lengkapi semua kolom pendaftaran mahasiswa.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register student in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: nama.trim(),
            nim: nim.trim(),
            role: 'mahasiswa',
            kelompok: kelompok,
            dosen_dpl: dosenDpl
          }
        }
      });

      if (error && !error.message.includes('already registered')) {
        console.warn('Supabase auth notice:', error.message);
      }

      // 2. Insert profile record into public.mahasiswa table
      const studentId = data?.user?.id || `mhs-${Date.now()}`;
      const avatarUrl = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=100&auto=format&fit=crop&q=80`;
      
      const { error: dbError } = await supabase.from('mahasiswa').insert({
        id: studentId,
        nim: nim.trim(),
        name: nama.trim(),
        email: email.trim(),
        department: kelompok,
        role: 'Mahasiswa KKN',
        status: 'Active',
        work_type: 'Geofence GPS',
        avatar_url: avatarUrl
      });

      if (dbError) {
        console.warn('Supabase DB Insert notice/error (table may not exist yet):', dbError.message);
      }

      // Create new student object for state
      const newMahasiswa = {
        id: studentId,
        name: nama.trim(),
        nim: nim.trim(),
        department: kelompok,
        role: 'Mahasiswa KKN',
        status: 'Active',
        workType: 'Geofence GPS',
        joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        desa: kelompok.split('-')[1]?.trim() || 'Desa Sukamaju',
        avatar: avatarUrl
      };

      setSuccessMsg(`Akun Mahasiswa ${nama} (NIM: ${nim}) Berhasil Didaftarkan!`);
      setLoading(false);

      setTimeout(() => {
        onAddSuccess(newMahasiswa);
        onClose();
        // Reset form
        setNama('');
        setNim('');
        setEmail('');
      }, 1200);

    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Gagal mendaftarkan akun mahasiswa.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 99999 }}>
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <User size={20} />
            </div>
            <div>
              <h3 className="modal-title">Pendaftaran Akun Mahasiswa KKN</h3>
              <p className="modal-subtitle">Daftarkan akun mahasiswa agar dapat login & presensi</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="alert-box alert-error" style={{ margin: '1rem 1.5rem 0 1.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-box alert-success" style={{ margin: '1rem 1.5rem 0 1.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            {/* Nama Lengkap */}
            <div className="input-group">
              <label className="input-label">Nama Lengkap Mahasiswa</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Budi Pratama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  disabled={loading}
                />
                <User className="input-icon" size={16} />
              </div>
            </div>

            {/* NIM */}
            <div className="input-group">
              <label className="input-label">NIM (User ID Login)</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: 21081010045"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  disabled={loading}
                />
                <Hash className="input-icon" size={16} />
              </div>
            </div>

            {/* Email Kampus */}
            <div className="input-group">
              <label className="input-label">Email Resmi Kampus</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  placeholder="budi@univ.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Mail className="input-icon" size={16} />
              </div>
            </div>

            {/* Kelompok KKN */}
            <div className="input-group">
              <label className="input-label">Kelompok & Desa Penempatan</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Kelompok 14 - Desa Sukamaju"
                  value={kelompok}
                  onChange={(e) => setKelompok(e.target.value)}
                  disabled={loading}
                />
                <MapPin className="input-icon" size={16} />
              </div>
            </div>

            {/* Dosen DPL */}
            <div className="input-group">
              <label className="input-label">Dosen DPL Pembimbing</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dr. Ir. Hendra Wijaya, M.T."
                  value={dosenDpl}
                  onChange={(e) => setDosenDpl(e.target.value)}
                  disabled={loading}
                />
                <ShieldCheck className="input-icon" size={16} />
              </div>
            </div>

            {/* Default Password */}
            <div className="input-group">
              <label className="input-label">Kata Sandi Initial Login</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Lock className="input-icon" size={16} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="btn-submit-modal" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>+ Daftarkan Akun Mahasiswa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
