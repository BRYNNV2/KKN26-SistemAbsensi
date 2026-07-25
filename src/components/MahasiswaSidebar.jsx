import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Award,
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
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ background: '#09090b', borderColor: '#27272a' }}>
      
      {/* Brand Header */}
      <div className="sidebar-brand" style={{ borderBottomColor: '#27272a' }}>
        <div className="brand-logo-group">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
            <UserCheck size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="brand-name" style={{ color: '#f4f4f5' }}>Portal Mahasiswa</span>
              <span className="brand-sub" style={{ color: '#a1a1aa' }}>Absensi KKN62</span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          style={{ background: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Student Badge Card */}
      {!collapsed && (
        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Kelompok KKN 14
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f4f4f5', marginTop: '0.2rem' }}>
            Desa Sukamaju
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>
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
                color: isActive ? '#10b981' : '#a1a1aa',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent'
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
          <div className="sidebar-footer-card" style={{ background: '#121215', borderColor: '#27272a' }}>
            <div className="security-icon-wrapper" style={{ color: '#10b981' }}>
              <ShieldCheck size={18} />
            </div>
            <div className="security-text">
              <span className="security-title" style={{ color: '#e4e4e7' }}>Presensi Valid</span>
              <span className="security-desc" style={{ color: '#a1a1aa' }}>Terverifikasi Geolocation & Supabase</span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button 
          className="sidebar-logout-btn" 
          onClick={onLogout}
          title={collapsed ? "Keluar Sistem" : undefined}
          style={{ background: '#18181b', borderColor: '#27272a', color: '#f87171' }}
        >
          <LogOut size={18} className="nav-icon" />
          {!collapsed && <span>Keluar Sistem</span>}
        </button>
      </div>

    </aside>
  );
}
