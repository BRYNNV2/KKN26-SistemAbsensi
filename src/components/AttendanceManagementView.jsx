import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Percent, 
  Search, 
  Plus, 
  Download, 
  Clock, 
  MapPin, 
  BookOpen, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  X,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import AttendanceChart from './AttendanceChart';
import { supabase } from '../lib/supabase';

export default function AttendanceManagementView({ user, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'schedule', 'requests', 'reports'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All Groups');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Realtime clock & QR code counter state
  const [time, setTime] = useState(new Date());
  const [qrCounter, setQrCounter] = useState(60);
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);

  // Details Modal state (Image 3 Style)
  const [selectedScheduleDetails, setSelectedScheduleDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState('jurnal'); // 'RPS', 'jurnal', 'nilai', 'info'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Database lists
  const [schedules, setSchedules] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setQrCounter(prev => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    fetchSchedules();
    fetchAttendance();

    return () => clearInterval(timer);
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase.from('schedules').select('*');
      if (error) {
        console.warn('Failed to load schedules from Supabase:', error.message);
        // Fallback to local storage or dummy data
        const cached = localStorage.getItem('kkn_schedules_cached');
        if (cached) {
          setSchedules(JSON.parse(cached));
        } else {
          const fallbacks = [
            { id: 1, title: 'Supervisi Lapangan Wilayah I', code: 'SPV1101', day: 'Selasa', timeStart: '08:00', timeEnd: '10:30', group: 'Kelompok 08 & 14', location: 'Posko Serumpun FT' },
            { id: 2, title: 'Sosialisasi Program Kerja Desa', code: 'KKN1102', day: 'Rabu', timeStart: '10:00', timeEnd: '12:30', group: 'Kelompok 11', location: 'Balai Desa Sukamaju' },
            { id: 3, title: 'Evaluasi & LPJ Mingguan', code: 'KKN1103', day: 'Rabu', timeStart: '14:00', timeEnd: '16:00', group: 'Semua Kelompok', location: 'Ruang Aula FTTK' },
            { id: 4, title: 'Pemberdayaan UMKM & Kebersihan', code: 'KKN1104', day: 'Kamis', timeStart: '09:00', timeEnd: '11:30', group: 'Kelompok 02', location: 'Kantor Kepala Desa' },
            { id: 5, title: 'Kunjungan Dosen Pembimbing', code: 'SPV1102', day: 'Kamis', timeStart: '13:00', timeEnd: '15:30', group: 'Kelompok 14', location: 'Posko 14 Sukadamai' },
            { id: 6, title: 'Senam Pagi & Program Kesehatan', code: 'KKN1105', day: 'Jumat', timeStart: '07:30', timeEnd: '09:30', group: 'Kelompok 05 & 08', location: 'Lapangan Puskesmas' },
            { id: 7, title: 'Kerja Bakti Bersama Warga', code: 'KKN1106', day: 'Sabtu', timeStart: '08:00', timeEnd: '11:30', group: 'Semua Kelompok', location: 'Dusun Serumpun' }
          ];
          setSchedules(fallbacks);
          localStorage.setItem('kkn_schedules_cached', JSON.stringify(fallbacks));
        }
      } else if (data) {
        // Map DB snake_case fields to camelCase properties used in layout
        const mapped = data.map(s => ({
          id: s.id,
          title: s.title,
          code: s.code || 'KKN_ACT',
          day: s.day,
          timeStart: s.time_start || '08:00',
          timeEnd: s.time_end || '10:00',
          group: s.group_kkn || 'Semua Kelompok',
          location: s.location
        }));
        setSchedules(mapped);
        localStorage.setItem('kkn_schedules_cached', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      // Fetch attendance records join mahasiswa profile
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          check_in,
          check_out,
          hours,
          status,
          date,
          mahasiswa_id,
          mahasiswa (
            name,
            nim,
            department,
            avatar_url
          )
        `);

      if (error) {
        console.warn('Failed to load attendance from Supabase:', error.message);
        // Fallback to local storage or dummy data
        const cached = localStorage.getItem('kkn_attendance_cached');
        if (cached) {
          setAttendanceData(JSON.parse(cached));
        } else {
          const fallbacks = [
            { id: 1, name: 'Emma Johnson', nim: '110202201', group: 'Kelompok 14', checkIn: '08:02 AM', checkOut: '04:01 PM', hours: '7h 59m', status: 'Hadir', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
            { id: 2, name: 'Liam Smith', nim: '110202202', group: 'Kelompok 08', checkIn: '08:48 AM', checkOut: '04:07 PM', hours: '7h 19m', status: 'Terlambat', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
            { id: 3, name: 'Olivia Brown', nim: '110202203', group: 'Kelompok 14', checkIn: '-', checkOut: '-', hours: '-', status: 'Absen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
            { id: 4, name: 'Noah Williams', nim: '110202204', group: 'Kelompok 02', checkIn: '07:56 AM', checkOut: '03:32 PM', hours: '7h 36m', status: 'Hadir', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
            { id: 5, name: 'Ava Davis', nim: '110202205', group: 'Kelompok 11', checkIn: '-', checkOut: '-', hours: '-', status: 'Izin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
            { id: 6, name: 'Mason Lee', nim: '110202206', group: 'Kelompok 05', checkIn: '08:25 AM', checkOut: '04:12 PM', hours: '7h 47m', status: 'Terlambat', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100' },
            { id: 7, name: 'Sophia Garcia', nim: '110202207', group: 'Kelompok 08', checkIn: '07:48 AM', checkOut: '03:35 PM', hours: '7h 47m', status: 'Hadir', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' }
          ];
          setAttendanceData(fallbacks);
          localStorage.setItem('kkn_attendance_cached', JSON.stringify(fallbacks));
        }
      } else if (data) {
        const mapped = data.map(a => ({
          id: a.id,
          name: a.mahasiswa?.name || 'Mahasiswa KKN',
          nim: a.mahasiswa?.nim || '-',
          group: a.mahasiswa?.department || 'Kelompok KKN',
          checkIn: a.check_in || '-',
          checkOut: a.check_out || '-',
          hours: a.hours || '-',
          status: a.status || 'Hadir',
          avatar: a.mahasiswa?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
        }));
        setAttendanceData(mapped);
        localStorage.setItem('kkn_attendance_cached', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format time utilities
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // ---------------------------------------------------------
  // AGENDA SCHEDULE CRUD & ACTIVE DETECTION STATES
  // ---------------------------------------------------------
  
  // Modal form states for CRUD
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgendaId, setSelectedAgendaId] = useState(null);

  // Form Fields
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaCode, setAgendaCode] = useState('');
  const [agendaDay, setAgendaDay] = useState('Senin');
  const [agendaTimeStart, setAgendaTimeStart] = useState('08:00');
  const [agendaTimeEnd, setAgendaTimeEnd] = useState('10:30');
  const [agendaGroup, setAgendaGroup] = useState('');
  const [agendaLocation, setAgendaLocation] = useState('');

  // Open modal for Adding a new agenda
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedAgendaId(null);
    setAgendaTitle('');
    setAgendaCode(`KKN${Math.floor(1000 + Math.random() * 9000)}`);
    setAgendaDay('Senin');
    setAgendaTimeStart('08:00');
    setAgendaTimeEnd('10:30');
    setAgendaGroup('');
    setAgendaLocation('');
    setIsAgendaModalOpen(true);
  };

  // Open modal for Editing an agenda
  const handleOpenEditModal = (agenda) => {
    setIsEditing(true);
    setSelectedAgendaId(agenda.id);
    setAgendaTitle(agenda.title);
    setAgendaCode(agenda.code);
    setAgendaDay(agenda.day);
    setAgendaTimeStart(agenda.timeStart);
    setAgendaTimeEnd(agenda.timeEnd);
    setAgendaGroup(agenda.group);
    setAgendaLocation(agenda.location);
    setIsAgendaModalOpen(true);
  };

  // Delete handler
  const handleDeleteAgenda = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal agenda KKN ini dari database?')) {
      try {
        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) throw error;
        await fetchSchedules();
      } catch (err) {
        console.warn('DB delete failed, deleting locally:', err.message);
        const updated = schedules.filter(item => item.id !== id);
        setSchedules(updated);
        localStorage.setItem('kkn_schedules_cached', JSON.stringify(updated));
      }
    }
  };

  // Form Submit handler
  const handleSaveAgenda = async (e) => {
    e.preventDefault();
    if (!agendaTitle.trim() || !agendaGroup.trim() || !agendaLocation.trim()) {
      alert('Mohon lengkapi semua kolom form!');
      return;
    }

    try {
      if (isEditing) {
        // Edit agenda
        const { error } = await supabase
          .from('schedules')
          .update({
            title: agendaTitle,
            code: agendaCode,
            day: agendaDay,
            time_start: agendaTimeStart,
            time_end: agendaTimeEnd,
            group_kkn: agendaGroup,
            location: agendaLocation
          })
          .eq('id', selectedAgendaId);

        if (error) throw error;
      } else {
        // Add new agenda
        const { error } = await supabase
          .from('schedules')
          .insert({
            title: agendaTitle,
            code: agendaCode,
            day: agendaDay,
            time_start: agendaTimeStart,
            time_end: agendaTimeEnd,
            group_kkn: agendaGroup,
            location: agendaLocation
          });

        if (error) throw error;
      }
      await fetchSchedules();
    } catch (err) {
      console.warn('DB Save notice (table may not exist yet), saving locally:', err.message);
      if (isEditing) {
        const updated = schedules.map(item => {
          if (item.id === selectedAgendaId) {
            return {
              ...item,
              title: agendaTitle,
              code: agendaCode,
              day: agendaDay,
              timeStart: agendaTimeStart,
              timeEnd: agendaTimeEnd,
              group: agendaGroup,
              location: agendaLocation
            };
          }
          return item;
        });
        setSchedules(updated);
        localStorage.setItem('kkn_schedules_cached', JSON.stringify(updated));
      } else {
        const newAgenda = {
          id: Date.now(),
          title: agendaTitle,
          code: agendaCode,
          day: agendaDay,
          timeStart: agendaTimeStart,
          timeEnd: agendaTimeEnd,
          group: agendaGroup,
          location: agendaLocation
        };
        const updated = [...schedules, newAgenda];
        setSchedules(updated);
        localStorage.setItem('kkn_schedules_cached', JSON.stringify(updated));
      }
    }
    setIsAgendaModalOpen(false);
  };

  // Active / Ongoing Schedule detector utility
  const checkIsActive = (evt) => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[time.getDay()];
    
    if (evt.day !== currentDayName) return false;

    // Convert current time to 'HH:MM' format
    const currentHours = String(time.getHours()).padStart(2, '0');
    const currentMinutes = String(time.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    return currentTimeStr >= evt.timeStart && currentTimeStr <= evt.timeEnd;
  };

  // Group schedules by day of week
  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Dynamic Filtering and Pagination calculations
  const filteredAttendance = attendanceData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.nim.includes(searchQuery);
    const matchesGroup = filterDept === 'All Groups' || item.group === filterDept;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const totalItems = filteredAttendance.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAttendance = filteredAttendance.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="attendance-view-container animate-fade-up">
      {/* Page Header */}
      <div className="attendance-view-header">
        <div className="header-info">
          <h1 className="topbar-page-title">Kehadiran & Absensi</h1>
          <p className="topbar-page-sub">Pantau catatan kehadiran, logbook, dan jadwal kegiatan mahasiswa</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-cards-grid animate-fade-up stagger-1">
        <div className="kpi-card blue">
          <div className="kpi-icon-wrapper blue">
            <UserCheck size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Present Today</span>
            <h3 className="kpi-value">982</h3>
            <span className="kpi-trend positive">↗ 3.7% dari kemarin</span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-icon-wrapper amber">
            <UserMinus size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Absent</span>
            <h3 className="kpi-value">42</h3>
            <span className="kpi-trend warning">↘ 12.5% dari kemarin</span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon-wrapper purple">
            <Clock size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Late Arrivals</span>
            <h3 className="kpi-value">18</h3>
            <span className="kpi-trend warning">↘ 8.2% dari kemarin</span>
          </div>
        </div>

        <div className="kpi-card blue">
          <div className="kpi-icon-wrapper blue">
            <Percent size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Attendance Rate</span>
            <h3 className="kpi-value">94.6%</h3>
            <span className="kpi-trend positive">↗ 2.3% dari minggu lalu</span>
          </div>
        </div>
      </div>

      {/* Main Page Layout Grid */}
      <div className="attendance-content-layout animate-fade-up stagger-2">
        
        {/* Left Column: Tabs & Main Content */}
        <div className="attendance-main-column">
          
          {/* Tab Navigation */}
          <div className="tab-filters-wrapper">
            <div className="tab-filters">
              <button 
                type="button" 
                className={`tab-filter-btn ${activeTab === 'daily' ? 'active' : ''}`}
                onClick={() => setActiveTab('daily')}
              >
                Kehadiran Harian
              </button>
              <button 
                type="button" 
                className={`tab-filter-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                Jadwal KKN
              </button>
              <button 
                type="button" 
                className={`tab-filter-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Perizinan & dispensasi
              </button>
              <button 
                type="button" 
                className={`tab-filter-btn ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                Laporan & Rekapitulasi
              </button>
            </div>
          </div>

          {/* TAB 1: DAILY ATTENDANCE (IMAGE 2 DESIGN) */}
          {activeTab === 'daily' && (
            <div className="daily-attendance-section animate-fade-up">
              {/* Filter Toolbar */}
              <div className="mgmt-toolbar">
                <div className="toolbar-left">
                  <div className="topbar-search-wrapper" style={{ maxWidth: '240px' }}>
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      className="topbar-search-input" 
                      placeholder="Cari mahasiswa..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select 
                    className="toolbar-select"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                  >
                    <option value="All Groups">Semua Kelompok</option>
                    <option value="Kelompok 14">Kelompok 14</option>
                    <option value="Kelompok 08">Kelompok 08</option>
                    <option value="Kelompok 11">Kelompok 11</option>
                  </select>

                  <select 
                    className="toolbar-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">Semua Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Absen">Absen</option>
                    <option value="Izin">Izin</option>
                  </select>
                </div>

                <div className="toolbar-right">
                  <button className="btn-add-employee">
                    <Plus size={16} />
                    <span>Isi Kehadiran</span>
                  </button>
                  <button className="tab-filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Download size={15} />
                    <span>Ekspor CSV</span>
                  </button>
                </div>
              </div>

              {/* Records Table */}
              <div className="activity-table-card">
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-custom-table">
                    <thead>
                      <tr>
                        <th>Mahasiswa</th>
                        <th>NIM</th>
                        <th>Kelompok</th>
                        <th>Jam Masuk</th>
                        <th>Jam Pulang</th>
                        <th>Total Jam</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAttendance.map((act) => (
                        <tr key={act.id}>
                          <td>
                            <div className="user-profile-cell">
                              <img src={act.avatar} alt={act.name} className="user-avatar-img" />
                              <span className="user-name">{act.name}</span>
                            </div>
                          </td>
                          <td><span className="nim-cell">{act.nim}</span></td>
                          <td><span>{act.group}</span></td>
                          <td><span>{act.checkIn}</span></td>
                          <td><span>{act.checkOut}</span></td>
                          <td><span>{act.hours}</span></td>
                          <td>
                            <span className={`status-badge ${
                              act.status === 'Hadir' ? 'success' :
                              act.status === 'Terlambat' ? 'warning' :
                              act.status === 'Izin' ? 'primary' : 'danger'
                            }`}>
                              {act.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-icon-btn" title="Lihat"><Eye size={15} /></button>
                              <button className="action-icon-btn" title="Edit"><Edit2 size={14} /></button>
                              <button className="action-icon-btn delete" title="Hapus"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedAttendance.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                            Tidak ada data kehadiran ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="table-pagination-footer">
                  <span>
                    {totalItems === 0 
                      ? 'Menampilkan 0 data' 
                      : `Menampilkan ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} dari ${totalItems} data`
                    }
                  </span>
                  <div className="pagination-controls">
                    <button 
                      type="button"
                      className="page-nav-btn" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button 
                        key={idx + 1}
                        type="button"
                        className={`page-num-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button 
                      type="button"
                      className="page-nav-btn" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEEKLY SCHEDULE (IMAGE 1 DESIGN + CRUD & ACTIVE TIME DETECT) */}
          {activeTab === 'schedule' && (
            <div className="weekly-schedule-section animate-fade-up">
              <div className="schedule-section-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="schedule-main-title">Jadwal Agenda KKN 2026</h2>
                  <p className="schedule-main-subtitle">Jadwal pembekalan, monitoring, supervisi, dan program kerja utama per hari</p>
                </div>
                
                {/* Admin Add Agenda Button */}
                <button 
                  type="button" 
                  className="btn-add-employee"
                  onClick={handleOpenAddModal}
                  style={{ gap: '0.45rem' }}
                >
                  <PlusCircle size={16} />
                  <span>Tambah Agenda KKN</span>
                </button>
              </div>

              {/* Horizontal Scroll / Grid Columns for days of the week */}
              <div className="weekly-schedule-columns">
                {daysOfWeek.map((day) => {
                  const dayEvents = schedules.filter(evt => evt.day === day);
                  return (
                    <div key={day} className="schedule-day-column">
                      <div className="schedule-day-header">
                        <span className="day-name">{day}</span>
                      </div>
                      
                      <div className="schedule-events-container">
                        {dayEvents.length > 0 ? (
                          dayEvents.map((evt) => {
                            const isActive = checkIsActive(evt);
                            return (
                              <div 
                                key={evt.id} 
                                className={`schedule-event-card ${isActive ? 'active-schedule' : ''}`}
                                onClick={() => setSelectedScheduleDetails(evt)}
                                style={{ cursor: 'pointer' }}
                              >
                                {isActive && (
                                  <div className="ongoing-schedule-badge">
                                    <Sparkles size={11} className="sparkle-pulsing" />
                                    <span>Sedang Berlangsung</span>
                                  </div>
                                )}

                                <div className="event-card-top">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 className="event-card-title">{evt.title}</h4>
                                    
                                    {/* Action Buttons for Schedule */}
                                    <div className="schedule-card-actions" style={{ display: 'flex', gap: '4px' }}>
                                      <button 
                                        type="button" 
                                        className="action-icon-btn compact" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditModal(evt);
                                        }}
                                        title="Edit Agenda"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button 
                                        type="button" 
                                        className="action-icon-btn compact delete" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAgenda(evt.id);
                                        }}
                                        title="Hapus Agenda"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <span className="event-card-code">{evt.code}</span>
                                </div>

                                <div className="event-card-details">
                                  <div className="event-detail-item">
                                    <Calendar size={14} className="detail-icon" />
                                    <span>{evt.day}</span>
                                  </div>
                                  <div className="event-detail-item">
                                    <Clock size={14} className="detail-icon" />
                                    <span>{evt.timeStart} - {evt.timeEnd}</span>
                                  </div>
                                  <div className="event-detail-item group-info">
                                    <BookOpen size={14} className="detail-icon" />
                                    <span>{evt.group}</span>
                                  </div>
                                  <div className="event-detail-item location-info">
                                    <MapPin size={14} className="detail-icon" />
                                    <span>{evt.location}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="no-schedule-card">
                            <span className="no-schedule-text">Tidak ada jadwal kegiatan!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REQUESTS (DUMMY LIST) */}
          {activeTab === 'requests' && (
            <div className="requests-section animate-fade-up">
              <div className="activity-table-card">
                <div className="table-wrapper">
                  <table className="admin-custom-table">
                    <thead>
                      <tr>
                        <th>Pengaju</th>
                        <th>NIM</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="user-profile-cell">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Ava" className="user-avatar-img" />
                            <span className="user-name">Ava Davis</span>
                          </div>
                        </td>
                        <td><span className="nim-cell">110202205</span></td>
                        <td><span className="type-badge info">Izin Sakit</span></td>
                        <td><span>Mengalami demam tinggi (Surat dokter terlampir)</span></td>
                        <td><span>May 25, 2026</span></td>
                        <td><span className="status-badge warning">Pending</span></td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="action-icon-btn text-success" title="Setujui"><CheckCircle size={15} style={{ color: '#10b981' }} /></button>
                            <button className="action-icon-btn text-danger" title="Tolak"><XCircle size={15} style={{ color: '#ef4444' }} /></button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS (DUMMY METRICS) */}
          {activeTab === 'reports' && (
            <div className="reports-section animate-fade-up">
              <div className="kpi-cards-grid">
                <div className="kpi-card blue">
                  <div className="kpi-icon-wrapper blue">
                    <TrendingUp size={20} />
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-title">Rata-rata Hadir Mingguan</span>
                    <h3 className="kpi-value">95.4%</h3>
                  </div>
                </div>
                <div className="kpi-card emerald">
                  <div className="kpi-icon-wrapper emerald">
                    <UserCheck size={20} />
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-title">Total Hadir Akumulasi</span>
                    <h3 className="kpi-value">4,120</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Time Clock Widget & Summary */}
        <div className="attendance-right-column">
          
          {/* Absensi Scan QR Code Card */}
          <div className="right-widget-card qr-attendance-widget">
            <h4 className="widget-title">Absensi QR Code</h4>
            
            <div className="qr-code-scanner-container" onClick={() => setIsFullscreenQR(true)} style={{ cursor: 'pointer' }} title="Klik untuk memperbesar QR Code">
              <div className="qr-laser-line" />
              <svg className="qr-code-svg" viewBox="0 0 100 100">
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="15" height="15" fill="currentColor" />
                
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="75" y="10" width="15" height="15" fill="currentColor" />
                
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="75" width="15" height="15" fill="currentColor" />

                {/* Simulated randomized QR blocks */}
                <rect x="40" y="10" width="8" height="8" fill="currentColor" />
                <rect x="52" y="15" width="8" height="12" fill="currentColor" />
                <rect x="10" y="40" width="12" height="8" fill="currentColor" />
                <rect x="40" y="40" width="18" height="18" fill="currentColor" />
                <rect x="70" y="40" width="8" height="15" fill="currentColor" />
                <rect x="82" y="48" width="10" height="10" fill="currentColor" />
                <rect x="40" y="70" width="12" height="8" fill="currentColor" />
                <rect x="56" y="78" width="18" height="8" fill="currentColor" />
                <rect x="80" y="70" width="12" height="12" fill="currentColor" />
              </svg>
            </div>
            
            <span className="qr-desc" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem', display: 'block' }}>
              Klik gambar untuk Tampilkan Layar Penuh
            </span>

            <button 
              type="button" 
              className="btn-clock-out" 
              onClick={() => setQrCounter(60)}
              style={{ width: '100%', marginTop: '0.75rem', borderColor: 'var(--color-primary-blue)', color: 'var(--color-primary-blue)' }}
            >
              <span>Perbarui Kode QR ({qrCounter}s)</span>
            </button>
          </div>

          {/* Today's Summary (Compact Donut Chart Layout) */}
          <div className="right-widget-card">
            <h4 className="widget-title">Ringkasan Hari Ini</h4>
            
            <div className="donut-wrapper">
              <div className="donut-chart-container">
                <svg className="donut-svg-compact" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  
                  {/* Hadir (92.5%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2563eb" strokeWidth="3" 
                          strokeDasharray="92.5 7.5" strokeDashoffset="25" />
                  
                  {/* Absen (4.0%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#ef4444" strokeWidth="3" 
                          strokeDasharray="4 96" strokeDashoffset="-67.5" />
                </svg>

                <div className="donut-center-text">
                  <span className="donut-total-num">1,062</span>
                  <span className="donut-sub-label">Total</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-item">
                  <span className="dot blue" />
                  <span>Hadir (982)</span>
                </div>
                <div className="legend-item">
                  <span className="dot amber" />
                  <span>Terlambat (18)</span>
                </div>
                <div className="legend-item">
                  <span className="dot red" style={{ backgroundColor: '#ef4444' }} />
                  <span>Absen (42)</span>
                </div>
                <div className="legend-item">
                  <span className="dot purple" />
                  <span>Izin (20)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance Alerts */}
          <div className="right-widget-card">
            <h4 className="widget-title">Notifikasi Aktivitas</h4>
            
            <div className="updates-list">
              <div className="update-item">
                <div className="update-icon-badge alert-late">
                  <AlertCircle size={15} />
                </div>
                <div className="update-info">
                  <span className="update-name">Late Check-in</span>
                  <span className="update-desc">Liam Smith checked in late</span>
                  <span className="update-time">09:18 AM</span>
                </div>
              </div>

              <div className="update-item">
                <div className="update-icon-badge alert-missed">
                  <XCircle size={15} />
                </div>
                <div className="update-info">
                  <span className="update-name">Missed Punch</span>
                  <span className="update-desc">Olivia Brown missed check-out</span>
                  <span className="update-time">Yesterday</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {isAgendaModalOpen ? (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="modal-title">{isEditing ? 'Edit Agenda KKN' : 'Tambah Agenda KKN'}</h3>
                  <span className="modal-subtitle">Jadwal pembekalan/supervisi posko KKN</span>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsAgendaModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="modal-form">
              {/* Agenda Title */}
              <div className="input-group">
                <label className="input-label">Nama Agenda / Kegiatan</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Supervisi Lapangan Wilayah I" 
                  value={agendaTitle}
                  onChange={(e) => setAgendaTitle(e.target.value)}
                  required
                  style={{ paddingLeft: '0.85rem' }}
                />
              </div>

              <div className="modal-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {/* Day Selector */}
                <div className="input-group">
                  <label className="input-label">Hari</label>
                  <select 
                    className="form-input"
                    value={agendaDay}
                    onChange={(e) => setAgendaDay(e.target.value)}
                    style={{ paddingLeft: '0.85rem', height: '38px', cursor: 'pointer' }}
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Agenda Code */}
                <div className="input-group">
                  <label className="input-label">Kode Kegiatan</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: SPV1101" 
                    value={agendaCode}
                    onChange={(e) => setAgendaCode(e.target.value)}
                    required
                    style={{ paddingLeft: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="modal-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {/* Time Start */}
                <div className="input-group">
                  <label className="input-label">Waktu Mulai</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={agendaTimeStart}
                    onChange={(e) => setAgendaTimeStart(e.target.value)}
                    required
                    style={{ paddingLeft: '0.85rem' }}
                  />
                </div>

                {/* Time End */}
                <div className="input-group">
                  <label className="input-label">Waktu Selesai</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={agendaTimeEnd}
                    onChange={(e) => setAgendaTimeEnd(e.target.value)}
                    required
                    style={{ paddingLeft: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Target KKN Group */}
              <div className="input-group">
                <label className="input-label">Target Kelompok KKN</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Kelompok 08 & 14 / Semua Kelompok" 
                  value={agendaGroup}
                  onChange={(e) => setAgendaGroup(e.target.value)}
                  required
                  style={{ paddingLeft: '0.85rem' }}
                />
              </div>

              {/* Location */}
              <div className="input-group">
                <label className="input-label">Lokasi Kegiatan</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Posko Serumpun / Balai Desa" 
                  value={agendaLocation}
                  onChange={(e) => setAgendaLocation(e.target.value)}
                  required
                  style={{ paddingLeft: '0.85rem' }}
                />
              </div>

              {/* Form Actions */}
              <div className="modal-footer" style={{ padding: '0.5rem 0 0 0' }}>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setIsAgendaModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-submit-modal">
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {isFullscreenQR ? (
        <div className="modal-overlay" onClick={() => setIsFullscreenQR(false)}>
          <div className="modal-container" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} style={{ color: 'var(--color-primary-blue)' }} />
                <h3 className="modal-title">Pindai Presensi Cepat</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsFullscreenQR(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="qr-code-scanner-container fullscreen-qr" style={{ width: '280px', height: '280px', margin: '0 auto 1.5rem auto' }}>
              <div className="qr-laser-line" />
              <svg className="qr-code-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="15" height="15" fill="currentColor" />
                
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="75" y="10" width="15" height="15" fill="currentColor" />
                
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="75" width="15" height="15" fill="currentColor" />

                <rect x="40" y="10" width="8" height="8" fill="currentColor" />
                <rect x="52" y="15" width="8" height="12" fill="currentColor" />
                <rect x="10" y="40" width="12" height="8" fill="currentColor" />
                <rect x="40" y="40" width="18" height="18" fill="currentColor" />
                <rect x="70" y="40" width="8" height="15" fill="currentColor" />
                <rect x="82" y="48" width="10" height="10" fill="currentColor" />
                <rect x="40" y="70" width="12" height="8" fill="currentColor" />
                <rect x="56" y="78" width="18" height="8" fill="currentColor" />
                <rect x="80" y="70" width="12" height="12" fill="currentColor" />
              </svg>
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Silakan pindai kode QR di atas menggunakan aplikasi mahasiswa
            </p>
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.4rem' }}>
              Kode QR diperbarui otomatis dalam {qrCounter} detik
            </span>
          </div>
        </div>
      ) : null}

      {selectedScheduleDetails ? (
        <div className="modal-overlay" onClick={() => setSelectedScheduleDetails(null)} style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
          <div className="modal-container" style={{ maxWidth: '960px', width: '100%', padding: 0, overflow: 'hidden', background: '#121215', border: '1px solid #27272a' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header Title */}
            <div style={{ background: '#1a1a1f', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                Jadwal Kelas Mata Kuliah <strong>{selectedScheduleDetails.title}</strong> pada {selectedScheduleDetails.day}, {selectedScheduleDetails.timeStart} - {selectedScheduleDetails.timeEnd}
              </span>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setSelectedScheduleDetails(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ background: '#121215', display: 'flex', borderBottom: '1px solid #27272a', padding: '0 1rem' }}>
              {[
                { id: 'rps', label: 'Bahan Ajar dan Silabus (RPS)' },
                { id: 'jurnal', label: 'Jurnal Kelas' },
                { id: 'bobot', label: 'Bobot Nilai Akademik' },
                { id: 'info', label: 'Informasi Tambahan' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailsTab(t.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'transparent',
                    border: 'none',
                    color: detailsTab === t.id ? '#eab308' : '#a1a1aa',
                    borderBottom: detailsTab === t.id ? '3px solid #eab308' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: detailsTab === t.id ? 700 : 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Active Content Area */}
            <div style={{ padding: '1.5rem' }}>
              {detailsTab === 'jurnal' ? (
                <div>
                  {/* Banner Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                    borderRadius: '8px',
                    padding: '2rem 1.5rem',
                    color: '#ffffff',
                    position: 'relative',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                          {selectedScheduleDetails.code} - {selectedScheduleDetails.title}
                        </h2>
                        
                        {/* Class QR Code Trigger */}
                        <button 
                          type="button"
                          onClick={() => setIsFullscreenQR(true)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            marginTop: '0.25rem',
                            marginBottom: '1rem'
                          }}
                        >
                          <span>Class QR Code</span>
                          <span style={{ fontSize: '0.85rem' }}>🔳</span>
                        </button>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📅 {selectedScheduleDetails.day}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ⏰ {selectedScheduleDetails.timeStart} - {selectedScheduleDetails.timeEnd}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📍 {selectedScheduleDetails.location}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                          Fakultas Teknik & Ilmu Komputer
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Sistem Informasi KKN</span>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                    
                    {/* Left Column: Absensi Student List */}
                    <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1rem', height: 'fit-content' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e4e4e7' }}>Absensi</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e4e4e7' }}>
                          {attendanceData.length || 5}/{attendanceData.length || 5}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                        {(attendanceData.length > 0 ? attendanceData : [
                          { nim: '2301020118', name: 'Meuthia Kayla Putri' },
                          { nim: '2301020117', name: 'Muhammad Arroyyan Hamel' },
                          { nim: '2301020114', name: 'M. Febrian' },
                          { nim: '2301020112', name: 'M. Hidayatulrizki' },
                          { nim: '2301020111', name: 'Khairul Ilham' }
                        ]).map((s, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              fontSize: '0.8rem', 
                              padding: '0.5rem 0.25rem', 
                              borderBottom: '1px solid #27272a',
                              color: '#d4d4d8'
                            }}
                          >
                            <span style={{ fontFamily: 'monospace', color: '#a1a1aa' }}>{s.nim}</span>
                            <span style={{ fontWeight: 600 }}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{ textAlign: 'center', marginTop: '1rem', color: '#a1a1aa', cursor: 'pointer' }}>
                        <span>▼</span>
                      </div>
                    </div>

                    {/* Right Column: Jurnal Entries list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      
                      {/* Entry 1 */}
                      <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                              👤
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
                                Berta Erwin Slam, S.T., M.Kom
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>19 Mei 2026 - 07:33</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            Terlaksana
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#d4d4d8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            <span style={{ color: '#a1a1aa', width: '120px', display: 'inline-block' }}>Jenis Jurnal</span>
                            <span>: Teori & Pengarahan</span>
                          </div>
                          <div>
                            <span style={{ color: '#a1a1aa', width: '120px', display: 'inline-block' }}>Metode Ajar</span>
                            <span>: Offline</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ color: '#a1a1aa', width: '120px', display: 'inline-block', flexShrink: 0 }}>Topik Pembahasan</span>
                            <span>: Menjelaskan agenda kegiatan KKN, pemetaan kelompok, dan panduan upload logbook harian mahasiswa.</span>
                          </div>
                        </div>
                      </div>

                      {/* Entry 2 */}
                      <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                              👤
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
                                Berta Erwin Slam, S.T., M.Kom
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>12 Mei 2026 - 21:57</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#eab308', background: 'rgba(234,179,8,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            Dijadwalkan
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#d4d4d8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            <span style={{ color: '#a1a1aa', width: '120px', display: 'inline-block' }}>Jenis Jurnal</span>
                            <span>: Teori</span>
                          </div>
                          <div>
                            <span style={{ color: '#a1a1aa', width: '120px', display: 'inline-block' }}>Metode Ajar</span>
                            <span>: Offline</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ color: '#a1a1aa', width: '120px', display: 'inline-block', flexShrink: 0 }}>Topik Pembahasan</span>
                            <span>: Penjelasan detail program kerja unggulan, koordinasi desa, dan persiapan keberangkatan.</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '4rem 1rem' }}>
                  <p>Halaman ini belum diisi oleh koordinator / admin KKN.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}
