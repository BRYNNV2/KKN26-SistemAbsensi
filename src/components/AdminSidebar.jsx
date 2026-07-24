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
  Award
} from 'lucide-react';

export default function AdminSidebar({ activeTab, onSelectTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mahasiswa', label: 'Mahasiswa KKN', icon: GraduationCap },
    { id: 'dosen', label: 'Dosen DPL', icon: Users },
    { id: 'attendance', label: 'Presensi & Absensi', icon: CalendarCheck },
    { id: 'location', label: 'Desa Penempatan', icon: MapPin },
    { id: 'reports', label: 'Laporan Kegiatan', icon: FileText },
    { id: 'analytics', label: 'Statistik & Rekap', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <Award size={22} />
        </div>
        <div className="sidebar-brand-text">
          <h2 className="brand-name">KKN62 HRIMS</h2>
          <span className="brand-sub">Sistem Absensi Terpadu</span>
        </div>
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
            >
              <Icon size={19} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Security Card */}
      <div className="sidebar-footer-card">
        <div className="security-icon-wrapper">
          <ShieldCheck size={20} />
        </div>
        <div className="security-text">
          <span className="security-title">Data Anda Aman</span>
          <span className="security-desc">Terenkripsi SSL & Supabase DB</span>
        </div>
      </div>

      {/* Logout Action */}
      <button type="button" className="sidebar-logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        <span>Keluar Sistem</span>
      </button>
    </aside>
  );
}
