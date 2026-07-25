import React from 'react';
import { 
  Bell, 
  User, 
  Search
} from 'lucide-react';

export default function MahasiswaTopbar({ user }) {
  return (
    <header className="admin-topbar" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
      
      {/* Title & Greeting */}
      <div className="topbar-title-group">
        <h1 className="topbar-page-title" style={{ color: '#0f172a', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dasbor Mahasiswa KKN
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', fontWeight: 600 }}>
            MAHASISWA
          </span>
        </h1>
        <span className="topbar-page-sub" style={{ color: '#64748b' }}>
          Kelompok 14 - Desa Sukamaju • DPL: Dr. Ir. Hendra Wijaya, M.T.
        </span>
      </div>

      {/* Center Search Input */}
      <div className="topbar-search-wrapper">
        <Search size={17} className="search-icon" />
        <input 
          type="text" 
          className="topbar-search-input" 
          placeholder="Cari jadwal KKN, logbook, pengumuman... (⌘K)" 
        />
        <span className="search-shortcut">⌘K</span>
      </div>

      {/* Right Controls */}
      <div className="topbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Notifications Icon */}
        <button className="topbar-icon-btn" style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#64748b' }} title="Notifikasi">
          <Bell size={18} />
          <span className="notification-badge blue">2</span>
        </button>

        {/* Profile Pill */}
        <div className="admin-profile-wrapper">
          <div className="admin-profile-pill" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
            <div className="profile-avatar" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="profile-info">
              <span className="profile-name" style={{ color: '#0f172a', fontWeight: 700 }}>
                {user?.name || 'Mahasiswa KKN'}
              </span>
              <span className="profile-role" style={{ color: '#2563eb', fontSize: '0.7rem' }}>
                NIM: {user?.nim || '21081010045'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
