import React from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Shield, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export default function MahasiswaTopbar({ user }) {
  return (
    <header className="admin-topbar" style={{ background: '#09090b', borderColor: '#27272a' }}>
      
      {/* Title & Greeting */}
      <div className="topbar-title-group">
        <h1 className="topbar-page-title" style={{ color: '#f4f4f5', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dasbor Mahasiswa KKN
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}>
            MAHASISWA
          </span>
        </h1>
        <span className="topbar-page-sub" style={{ color: '#a1a1aa' }}>
          Kelompok 14 - Desa Sukamaju • DPL: Dr. Ir. Hendra Wijaya, M.T.
        </span>
      </div>

      {/* Right Controls */}
      <div className="topbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* Notifications Icon */}
        <button className="topbar-icon-btn" style={{ background: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }} title="Notifikasi">
          <Bell size={17} />
          <span className="notification-badge blue">2</span>
        </button>

        {/* Profile Pill */}
        <div className="admin-profile-wrapper">
          <div className="admin-profile-pill" style={{ background: '#18181b', borderColor: '#27272a' }}>
            <div className="profile-avatar" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="profile-info">
              <span className="profile-name" style={{ color: '#f4f4f5', fontWeight: 700 }}>
                {user?.name || 'Mahasiswa KKN'}
              </span>
              <span className="profile-role" style={{ color: '#10b981', fontSize: '0.7rem' }}>
                NIM: {user?.nim || '21081010045'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
