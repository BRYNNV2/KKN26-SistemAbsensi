import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserPlus, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import AdminTopbar from './AdminTopbar';
import AddMahasiswaModal from './AddMahasiswaModal';

export default function MahasiswaManagementView({ user, onLogout, theme, onToggleTheme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all');

  // Initial Dataset
  const [mahasiswaList, setMahasiswaList] = useState([
    {
      id: 'EMP-1001',
      name: 'Emma Johnson',
      nim: '21081010045',
      department: 'Kelompok 14 - Sukamaju',
      role: 'Ketua Kelompok KKN',
      status: 'Active',
      workType: 'Geofence GPS',
      joiningDate: 'May 24, 2026',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'EMP-1002',
      name: 'Liam Smith',
      nim: '21081010088',
      department: 'Kelompok 08 - Sukaraja',
      role: 'Sekretaris KKN',
      status: 'Active',
      workType: 'Manual DPL',
      joiningDate: 'Jun 12, 2026',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'EMP-1003',
      name: 'Olivia Brown',
      nim: '21081010102',
      department: 'Kelompok 14 - Sukamaju',
      role: 'Anggota KKN',
      status: 'On Leave',
      workType: 'Geofence GPS',
      joiningDate: 'Aug 01, 2026',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'EMP-1004',
      name: 'Noah Williams',
      nim: '21081010156',
      department: 'Kelompok 03 - Sukamulia',
      role: 'Bendahara KKN',
      status: 'Active',
      workType: 'On-site',
      joiningDate: 'Jan 18, 2026',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'EMP-1005',
      name: 'Ava Davis',
      nim: '21081010210',
      department: 'Kelompok 21 - Sukarame',
      role: 'Anggota KKN',
      status: 'Active',
      workType: 'Geofence GPS',
      joiningDate: 'Mar 03, 2026',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'EMP-1006',
      name: 'Mason Lee',
      nim: '21081010255',
      department: 'Kelompok 14 - Sukamaju',
      role: 'Koordinator Publikasi',
      status: 'Probation',
      workType: 'Geofence GPS',
      joiningDate: 'Apr 15, 2026',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'EMP-1007',
      name: 'Sophia Garcia',
      nim: '21081010312',
      department: 'Kelompok 05 - Sukajaya',
      role: 'Anggota KKN',
      status: 'Active',
      workType: 'On-site',
      joiningDate: 'Feb 20, 2026',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
    }
  ]);

  const handleAddSuccess = (newMahasiswa) => {
    setMahasiswaList([newMahasiswa, ...mahasiswaList]);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun mahasiswa ini?')) {
      setMahasiswaList(mahasiswaList.filter(m => m.id !== id));
    }
  };

  const filteredList = mahasiswaList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.nim.includes(searchQuery) || 
                          m.department.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTabFilter === 'active') return matchesSearch && m.status === 'Active';
    if (activeTabFilter === 'leave') return matchesSearch && m.status === 'On Leave';
    return matchesSearch;
  });

  return (
    <div className="mahasiswa-page-wrapper">
      {/* Top Header Bar */}
      <AdminTopbar user={user} onLogout={onLogout} />

      {/* Main Body */}
      <div className="admin-dashboard-body">
        {/* KPI Metrics (4 Columns) */}
        <div className="kpi-cards-grid">
          <div className="kpi-card blue">
            <div className="kpi-icon-wrapper blue">
              <Users size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Total Mahasiswa KKN</span>
              <h3 className="kpi-value">1,248</h3>
              <span className="kpi-trend positive">↗ 5.2% dari bulan lalu</span>
            </div>
          </div>

          <div className="kpi-card emerald">
            <div className="kpi-icon-wrapper emerald">
              <UserCheck size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Aktif Presensi KKN</span>
              <h3 className="kpi-value">1,182</h3>
              <span className="kpi-trend positive">↗ 94.7% di desa penempatan</span>
            </div>
          </div>

          <div className="kpi-card amber">
            <div className="kpi-icon-wrapper amber">
              <Clock size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Dalam Masa Izin</span>
              <h3 className="kpi-value">38</h3>
              <span className="kpi-trend warning">↘ 12.0% dari bulan lalu</span>
            </div>
          </div>

          <div className="kpi-card purple">
            <div className="kpi-icon-wrapper purple">
              <UserPlus size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Mahasiswa Terdaftar Baru</span>
              <h3 className="kpi-value">28</h3>
              <span className="kpi-trend positive">↗ 27.3% terdaftar bulan ini</span>
            </div>
          </div>
        </div>

        {/* Content Layout (Table Left + Sidebar Right) */}
        <div className="mgmt-content-grid">
          {/* Left Table Section */}
          <div className="activity-table-card">
            {/* Toolbar Filters & Action */}
            <div className="mgmt-toolbar">
              <div className="tab-filters">
                <button 
                  type="button" 
                  className={`tab-filter-btn ${activeTabFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('all')}
                >
                  Semua Mahasiswa
                </button>
                <button 
                  type="button" 
                  className={`tab-filter-btn ${activeTabFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('active')}
                >
                  Aktif
                </button>
                <button 
                  type="button" 
                  className={`tab-filter-btn ${activeTabFilter === 'leave' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('leave')}
                >
                  Izin / Dispensasi
                </button>
              </div>

              <button type="button" className="btn-add-employee" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                <span>+ Tambah Mahasiswa KKN</span>
              </button>
            </div>

            {/* Table View */}
            <div className="table-wrapper">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Mahasiswa</th>
                    <th>NIM (User ID)</th>
                    <th>Kelompok KKN</th>
                    <th>Peran / Tugas</th>
                    <th>Status</th>
                    <th>Modus Absensi</th>
                    <th>Tanggal Didaftarkan</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((mhs) => (
                    <tr key={mhs.id}>
                      <td>
                        <div className="user-profile-cell">
                          <img src={mhs.avatar} alt={mhs.name} className="user-avatar-img" />
                          <div className="user-meta">
                            <span className="user-name">{mhs.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="nim-cell">{mhs.nim}</td>
                      <td>{mhs.department}</td>
                      <td>{mhs.role}</td>
                      <td>
                        <span className={`status-badge ${mhs.status === 'Active' ? 'success' : mhs.status === 'On Leave' ? 'warning' : 'primary'}`}>
                          {mhs.status}
                        </span>
                      </td>
                      <td>
                        <span className={`type-badge ${mhs.workType === 'Geofence GPS' ? 'purple' : 'info'}`}>
                          {mhs.workType}
                        </span>
                      </td>
                      <td>{mhs.joiningDate}</td>
                      <td>
                        <div className="action-buttons-cell">
                          <button type="button" className="action-icon-btn view" title="Lihat Detail">
                            <Eye size={15} />
                          </button>
                          <button type="button" className="action-icon-btn edit" title="Edit Akun">
                            <Edit2 size={15} />
                          </button>
                          <button type="button" className="action-icon-btn delete" title="Hapus Akun" onClick={() => handleDelete(mhs.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="table-pagination-footer">
              <span className="pagination-info">
                Showing 1 to {filteredList.length} of 1,248 mahasiswa
              </span>
              <div className="pagination-controls">
                <button type="button" className="page-nav-btn"><ChevronLeft size={16} /></button>
                <button type="button" className="page-num-btn active">1</button>
                <button type="button" className="page-num-btn">2</button>
                <button type="button" className="page-num-btn">3</button>
                <span className="page-ellipsis">...</span>
                <button type="button" className="page-num-btn">125</button>
                <button type="button" className="page-nav-btn"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

          {/* Right Side Widgets (Distribution Donut + Pendaftaran Terbaru) */}
          <div className="mgmt-right-panel">
            {/* Donut Chart Widget */}
            <div className="right-widget-card">
              <h3 className="widget-title">Distribusi Kelompok KKN</h3>
              <div className="donut-wrapper">
                <div className="donut-chart-container">
                  <svg viewBox="0 0 100 100" className="donut-svg-compact">
                    <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#2563eb" strokeWidth="12" strokeDasharray="69 170" strokeDashoffset="0" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" strokeDasharray="42 197" strokeDashoffset="-69" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="12" strokeDasharray="47 192" strokeDashoffset="-111" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="35 204" strokeDashoffset="-158" fill="none" />
                  </svg>
                  <div className="donut-center-text">
                    <span className="donut-total-num">1,248</span>
                    <span className="donut-sub-label">Total</span>
                  </div>
                </div>

                <div className="donut-legend">
                  <div className="legend-item"><span className="dot blue"></span><span>Kelompok 14 (29%)</span></div>
                  <div className="legend-item"><span className="dot emerald"></span><span>Kelompok 08 (18%)</span></div>
                  <div className="legend-item"><span className="dot amber"></span><span>Kelompok 03 (20%)</span></div>
                  <div className="legend-item"><span className="dot purple"></span><span>Kelompok 21 (15%)</span></div>
                </div>
              </div>
            </div>

            {/* Pendaftaran Terbaru Widget */}
            <div className="right-widget-card">
              <h3 className="widget-title">Pendaftaran Terbaru</h3>
              <div className="updates-list">
                {mahasiswaList.slice(0, 4).map((mhs) => (
                  <div key={mhs.id} className="update-item">
                    <img src={mhs.avatar} alt={mhs.name} className="update-avatar" />
                    <div className="update-info">
                      <span className="update-name">{mhs.name}</span>
                      <span className="update-desc">Akun Mahasiswa Terdaftar</span>
                      <span className="update-time">{mhs.joiningDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      <AddMahasiswaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
}
