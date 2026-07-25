import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function MahasiswaSidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  onLogout,
  user
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Beranda Presensi', icon: LayoutDashboard },
    { id: 'schedules', label: 'Jadwal KKN', icon: Calendar },
    { id: 'logbook', label: 'Logbook Harian', icon: FileText },
    { id: 'history', label: 'Riwayat Kehadiran', icon: History },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
      
      {/* Brand Header */}
      <div className="sidebar-brand" style={{ borderBottomColor: '#e2e8f0' }}>
        <div className="brand-logo-group">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
            <UserCheck size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="brand-name" style={{ color: '#0f172a' }}>Portal Mahasiswa</span>
              <span className="brand-sub" style={{ color: '#64748b' }}>Absensi KKN62</span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          style={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#64748b' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Student Badge Card */}
      {!collapsed && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
            Kelompok KKN 14
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
            Desa Sukamaju
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: 600 }}>
            ● Status Aktif KKN
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                color: isActive ? '#2563eb' : '#64748b',
                background: isActive ? '#eff6ff' : 'transparent',
                fontWeight: isActive ? 700 : 500
              }}
            >
              <IconComponent size={19} className="nav-icon" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom-section" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        
        {/* Security Badge */}
        {!collapsed && (
          <div className="sidebar-footer-card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
            <div className="security-icon-wrapper" style={{ color: '#2563eb' }}>
              <ShieldCheck size={18} />
            </div>
            <div className="security-text">
              <span className="security-title" style={{ color: '#0f172a' }}>Presensi Valid</span>
              <span className="security-desc" style={{ color: '#64748b' }}>Terverifikasi Geolocation</span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button 
          className="sidebar-logout-btn" 
          onClick={onLogout}
          title={collapsed ? "Keluar Sistem" : undefined}
          style={{ background: '#ffffff', borderColor: '#fca5a5', color: '#dc2626' }}
        >
          <LogOut size={18} className="nav-icon" />
          {!collapsed && <span>Keluar Sistem</span>}
        </button>
      </div>

    </aside>
  );
}
