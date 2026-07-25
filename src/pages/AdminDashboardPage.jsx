import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  MapPin, 
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import AttendanceChart from '../components/AttendanceChart';
import MiniCalendar from '../components/MiniCalendar';
import MahasiswaManagementView from '../components/MahasiswaManagementView';
import AttendanceManagementView from '../components/AttendanceManagementView';

export default function AdminDashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('kkn_theme') || 'light');

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('kkn_theme', nextTheme);
  };

  // Sample Recent Activity Table Data
  const recentActivities = [
    {
      id: 1,
      name: 'Emma Johnson',
      role: 'Mahasiswa Kelompok 14',
      action: 'Pengajuan Izin',
      badgeType: 'warning',
      details: 'Annual Leave - May 24, 2026',
      time: '10:24 AM',
      by: 'Self',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Liam Smith',
      role: 'Mahasiswa Kelompok 08',
      action: 'Update Profil',
      badgeType: 'info',
      details: 'Updated contact information',
      time: '09:48 AM',
      by: 'Self',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Olivia Brown',
      role: 'Mahasiswa Kelompok 14',
      action: 'Presensi Hadir',
      badgeType: 'success',
      details: 'Checked in at 09:17 AM (Geofence Verified)',
      time: '09:17 AM',
      by: 'System',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      name: 'Noah Williams',
      role: 'Dosen DPL Wilayah 02',
      action: 'Upload Laporan',
      badgeType: 'purple',
      details: 'Uploaded "Laporan Supervisi Mingguan.pdf"',
      time: 'Yesterday',
      by: 'Self',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    }
  ];

  // Sample Upcoming Events Data
  const upcomingEvents = [
    {
      id: 1,
      title: 'Supervisi Lapangan Desa Sukamaju',
      date: 'May 25, 2026 • 10:00 AM',
      color: 'purple'
    },
    {
      id: 2,
      title: 'Pembekalan Tambahan KKN62',
      date: 'May 27, 2026 • 09:30 AM',
      color: 'emerald'
    },
    {
      id: 3,
      title: 'Sidang LPJ & Rekapitulasi Presensi',
      date: 'May 30, 2026 • 02:00 PM',
      color: 'amber'
    }
  ];

  return (
    <div className={`admin-dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-theme={theme}>
      {/* Sidebar Navigation */}
      <AdminSidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {activeTab === 'mahasiswa' ? (
          <MahasiswaManagementView 
            user={user} 
            onLogout={onLogout} 
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        ) : activeTab === 'attendance' ? (
          <AttendanceManagementView 
            user={user} 
            onLogout={onLogout} 
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        ) : (
          <>
            {/* Topbar Header */}
            <AdminTopbar 
              user={user} 
              onLogout={onLogout} 
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            {/* Dashboard Body Grid */}
            <div className="admin-dashboard-body">
              {/* KPI Metric Cards Row (4 Columns) with Staggered Fade Up Animations */}
              <div className="kpi-cards-grid">
                <div className="kpi-card blue animate-fade-up stagger-1">
                  <div className="kpi-icon-wrapper blue">
                    <Users size={22} />
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-title">Total Mahasiswa KKN</span>
                    <h3 className="kpi-value">1,248</h3>
                    <span className="kpi-trend positive">↗ 5.2% dari bulan lalu</span>
                  </div>
                </div>

                <div className="kpi-card emerald animate-fade-up stagger-2">
                  <div className="kpi-icon-wrapper emerald">
                    <UserCheck size={22} />
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-title">Hadir Hari Ini</span>
                    <h3 className="kpi-value">982</h3>
                    <span className="kpi-trend positive">↗ 97.4% presensi tepat waktu</span>
                  </div>
                </div>

                <div className="kpi-card amber animate-fade-up stagger-3">
                  <div className="kpi-icon-wrapper amber">
                    <Clock size={22} />
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-title">Pending Izin / Dispensasi</span>
                    <h3 className="kpi-value">28</h3>
                    <span className="kpi-trend warning">↘ 12.0% dari bulan lalu</span>
                  </div>
                </div>

                <div className="kpi-card purple animate-fade-up stagger-4">
                  <div className="kpi-icon-wrapper purple">
                    <MapPin size={22} />
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-title">Desa KKN Terdaftar</span>
                    <h3 className="kpi-value">14 Desa</h3>
                    <span className="kpi-trend positive">↗ 100% binaan DPL terverifikasi</span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Charts & Mini Calendar */}
              <div className="charts-row-grid">
                <div className="animate-fade-up stagger-5">
                  <AttendanceChart title="Pertumbuhan Mahasiswa" type="growth" />
                </div>
                <div className="animate-fade-up stagger-6">
                  <AttendanceChart title="Trend Presensi Harian" type="attendance" />
                </div>
                <div className="animate-fade-up stagger-7">
                  <MiniCalendar />
                </div>
              </div>

              {/* Bottom Row: Recent Activity Table & Upcoming Events */}
              <div className="bottom-row-grid">
                <div className="activity-table-card animate-fade-up stagger-8">
                  <div className="card-table-header">
                    <h3 className="table-card-title">Aktivitas Presensi Terkini</h3>
                  </div>

                  <div className="table-wrapper">
                    <table className="admin-custom-table">
                      <thead>
                        <tr>
                          <th>Mahasiswa / DPL</th>
                          <th>Status / Action</th>
                          <th>Detail Kegiatan</th>
                          <th>Waktu</th>
                          <th>Oleh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivities.map((act) => (
                          <tr key={act.id}>
                            <td>
                              <div className="user-profile-cell">
                                <img src={act.avatar} alt={act.name} className="user-avatar-img" />
                                <div className="user-meta">
                                  <span className="user-name">{act.name}</span>
                                  <span className="user-role-sub">{act.role}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${act.badgeType}`}>
                                {act.action}
                              </span>
                            </td>
                            <td className="details-cell">{act.details}</td>
                            <td className="time-cell">{act.time}</td>
                            <td className="by-cell">{act.by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-card-footer">
                    <button type="button" className="view-all-btn" onClick={() => setActiveTab('mahasiswa')}>
                      <span>Kelola Data Mahasiswa</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="upcoming-events-card animate-fade-up stagger-8">
                  <div className="events-card-header">
                    <h3 className="events-title">Agenda & Supervisi KKN</h3>
                  </div>

                  <div className="events-list">
                    {upcomingEvents.map((evt) => (
                      <div key={evt.id} className="event-item-box">
                        <div className={`event-icon-badge ${evt.color}`}>
                          <CalendarIcon size={18} />
                        </div>
                        <div className="event-info">
                          <h4 className="event-item-title">{evt.title}</h4>
                          <span className="event-item-date">{evt.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="events-card-footer">
                    <button type="button" className="view-all-btn">
                      <span>Lihat Semua Agenda</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
