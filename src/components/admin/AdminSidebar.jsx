import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  MapPin, 
  FileText, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function AdminSidebar({ 
  activeTab, 
  onSelectTab, 
  onLogout,
  isCollapsed = false,
  onToggleCollapse
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mahasiswa', label: 'Mahasiswa KKN', icon: GraduationCap },
    { id: 'attendance', label: 'Presensi & Absensi', icon: CalendarCheck },
    { id: 'location', label: 'Desa Penempatan', icon: MapPin },
    { id: 'reports', label: 'Laporan Kegiatan', icon: FileText },
    { id: 'analytics', label: 'Statistik & Rekap', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header with Toggle Collapse Button */}
      <div className="sidebar-brand">
        <div className="brand-logo-group">
          <div className="sidebar-logo-icon">
            <Award size={22} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <h2 className="brand-name">KKN62 HRIMS</h2>
              <span className="brand-sub">Sistem Absensi Terpadu</span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Action */}
        <button 
          type="button" 
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Buka Sidebar (Expand)" : "Tutup Sidebar (Collapse)"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={19} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Security Card */}
      <div className="sidebar-footer-card">
        <div className="security-icon-wrapper" title="Terenkripsi SSL & Supabase">
          <ShieldCheck size={20} />
        </div>
        {!isCollapsed && (
          <div className="security-text">
            <span className="security-title">Data Anda Aman</span>
            <span className="security-desc">Terenkripsi SSL & Supabase</span>
          </div>
        )}
      </div>

      {/* Logout Action */}
      <button 
        type="button" 
        className="sidebar-logout-btn" 
        onClick={onLogout}
        title={isCollapsed ? "Keluar Sistem" : ""}
      >
        <LogOut size={18} />
        {!isCollapsed && <span>Keluar Sistem</span>}
      </button>
    </aside>
  );
}
