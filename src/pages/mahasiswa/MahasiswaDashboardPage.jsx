import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  FileText, 
  MapPin, 
  Send, 
  Award, 
  X, 
  BookOpen, 
  Percent, 
  Check, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import MahasiswaSidebar from '../../components/mahasiswa/MahasiswaSidebar';
import MahasiswaTopbar from '../../components/mahasiswa/MahasiswaTopbar';
import { supabase } from '../../lib/supabase';

export default function MahasiswaDashboardPage({ user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'schedules', 'logbook', 'history', 'settings'

  // Student Attendance States
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('Hadir');
  const [myAttendanceLogs, setMyAttendanceLogs] = useState([]);
  
  // Schedules State
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [detailsTab, setDetailsTab] = useState('jurnal');

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);

  // Logbook Form State
  const [logbookDate, setLogbookDate] = useState(new Date().toISOString().split('T')[0]);
  const [logbookTitle, setLogbookTitle] = useState('');
  const [logbookDesc, setLogbookDesc] = useState('');
  const [logbooksList, setLogbooksList] = useState([
    {
      id: 1,
      date: '2026-07-24',
      title: 'Koordinasi Pemetaan Posko Desa Sukamaju',
      desc: 'Melakukan survei awal lokasi balai desa dan wawancara bersama perangkat desa Sukamaju.',
      status: 'Disetujui DPL'
    },
    {
      id: 2,
      date: '2026-07-23',
      title: 'Pembekalan & Pelepasan Peserta KKN62',
      desc: 'Mengikuti acara seremonial pelepasan mahasiswa KKN oleh Rektorat dan Panitia Lapangan.',
      status: 'Disetujui DPL'
    }
  ]);
  const [logbookSubmitSuccess, setLogbookSubmitSuccess] = useState(false);

  // Stats
  const totalHadir = myAttendanceLogs.filter(a => a.status === 'Hadir').length || 14;
  const totalTerlambat = myAttendanceLogs.filter(a => a.status === 'Terlambat').length || 1;
  const totalIzin = myAttendanceLogs.filter(a => a.status === 'Izin').length || 0;
  const totalPertemuan = totalHadir + totalTerlambat + totalIzin;
  const percentKehadiran = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 96;

  // Fetch Live Data on mount
  useEffect(() => {
    fetchSchedules();
    fetchMyAttendance();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase.from('schedules').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setSchedules(data);
      } else {
        useDefaultSchedules();
      }
    } catch (err) {
      console.warn('Failed to load schedules, using cache/defaults:', err.message);
      useDefaultSchedules();
    }
  };

  const useDefaultSchedules = () => {
    const defaultData = [
      { id: 1, day: 'Senin', title: 'Supervisi Lapangan Wilayah Posko 14', code: 'SPV1101', timeStart: '08:00', timeEnd: '10:30', group: 'Kelompok 14', location: 'Balai Desa Sukamaju' },
      { id: 2, day: 'Rabu', title: 'Penyusunan Program Kerja Unggulan KKN', code: 'PRG1102', timeStart: '13:00', timeEnd: '15:30', group: 'Kelompok 14', location: 'Posko Serumpun' },
      { id: 3, day: 'Jumat', title: 'Sosialisasi Digitalisasi UMKM Desa', code: 'UMK1103', timeStart: '09:00', timeEnd: '11:30', group: 'Semua Kelompok', location: 'Aula Kecamatan' }
    ];
    setSchedules(defaultData);
  };

  const fetchMyAttendance = async () => {
    try {
      const { data, error } = await supabase.from('attendance').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) {
        setMyAttendanceLogs(data);
        const todayStr = new Date().toLocaleDateString('id-ID');
        const todayRecord = data.find(d => d.date === todayStr);
        if (todayRecord) {
          setIsCheckedIn(true);
          setCheckInTime(todayRecord.check_in || '08:15 AM');
          setCheckOutTime(todayRecord.check_out || '');
        }
      }
    } catch (err) {
      console.warn('DB attendance fetch failed:', err.message);
      const cached = localStorage.getItem('kkn_attendance_cached');
      if (cached) {
        setMyAttendanceLogs(JSON.parse(cached));
      }
    }
  };

  // Perform Check In / Check Out action
  const handlePerformAttendance = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID');

    if (!isCheckedIn) {
      // Check In
      setIsCheckedIn(true);
      setCheckInTime(timeStr);

      const newLog = {
        id: Date.now(),
        name: user?.name || 'Budi Pratama',
        nim: user?.nim || '21081010045',
        group: 'Kelompok 14 - Sukamaju',
        checkIn: timeStr,
        checkOut: '--:--',
        hours: 'Sedang Berlangsung',
        status: 'Hadir',
        date: dateStr
      };

      const updated = [newLog, ...myAttendanceLogs];
      setMyAttendanceLogs(updated);

      try {
        await supabase.from('attendance').insert({
          mahasiswa_id: user?.id || 'mhs-1',
          check_in: timeStr,
          check_out: '',
          hours: '8h 0m',
          status: 'Hadir',
          date: dateStr
        });
      } catch (err) {
        console.warn('Database insert failed, saved to local cache:', err.message);
        localStorage.setItem('kkn_attendance_cached', JSON.stringify(updated));
      }

      alert(`Presensi Masuk Berhasil pada jam ${timeStr}!`);
    } else {
      // Check Out
      setCheckOutTime(timeStr);
      const updated = myAttendanceLogs.map((log, idx) => {
        if (idx === 0) {
          return { ...log, checkOut: timeStr, hours: '8j 15m' };
        }
        return log;
      });
      setMyAttendanceLogs(updated);
      alert(`Presensi Pulang Berhasil pada jam ${timeStr}!`);
    }
  };

  // Handle Logbook Form Submission
  const handleLogbookSubmit = (e) => {
    e.preventDefault();
    if (!logbookTitle.trim() || !logbookDesc.trim()) {
      alert('Silakan isi judul dan deskripsi kegiatan!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: logbookDate,
      title: logbookTitle,
      desc: logbookDesc,
      status: 'Menunggu Verifikasi DPL'
    };

    setLogbooksList([newEntry, ...logbooksList]);
    setLogbookTitle('');
    setLogbookDesc('');
    setLogbookSubmitSuccess(true);
    setTimeout(() => setLogbookSubmitSuccess(false), 3000);
  };

  // Handle Simulated QR Scan
  const handleScanQrAction = () => {
    setShowQrModal(true);
    setQrScanning(true);
    setQrSuccess(false);

    setTimeout(() => {
      setQrScanning(false);
      setQrSuccess(true);
      handlePerformAttendance();
    }, 2000);
  };

  return (
    <div className="admin-dashboard-layout" data-theme="light" style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Mahasiswa Sidebar */}
      <MahasiswaSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={onLogout}
        user={user}
      />

      {/* Main Content Area */}
      <div className="admin-main-wrapper" style={{ marginLeft: sidebarCollapsed ? '78px' : '250px' }}>
        
        {/* Topbar */}
        <MahasiswaTopbar user={user} />

        {/* Content Views */}
        <main style={{ padding: '1.75rem' }}>
          
          {/* TAB 1: BERANDA PRESENSI & JADWAL */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Header Hero Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
                color: '#ffffff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      <Sparkles size={14} />
                      <span>PORTAL AKADEMIK MAHASISWA KKN62</span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                      Selamat Datang, {user?.name || 'Budi Pratama'}! 👋
                    </h2>
                    <p style={{ color: '#dbeafe', fontSize: '0.9rem', margin: '0.4rem 0 0 0' }}>
                      NIM: {user?.nim || '21081010045'} • Kelompok 14 (Desa Sukamaju, Kecamatan Serumpun)
                    </p>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#dbeafe' }}>Dosen Pembimbing Lapangan (DPL):</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                      Dr. Ir. Hendra Wijaya, M.T.
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid Matching Admin Dashboard */}
              <div className="kpi-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                
                <div className="kpi-card blue" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div className="kpi-icon-wrapper blue" style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Hadir</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{totalHadir} Hari</h3>
                    <span className="kpi-trend positive" style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>↗ Logbook terverifikasi</span>
                  </div>
                </div>

                <div className="kpi-card emerald" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div className="kpi-icon-wrapper emerald" style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Presensi Tepat Waktu</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{totalHadir} Hari</h3>
                    <span className="kpi-trend positive" style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>↗ 100% disiplin posko</span>
                  </div>
                </div>

                <div className="kpi-card yellow" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div className="kpi-icon-wrapper yellow" style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Terlambat</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{totalTerlambat} Hari</h3>
                    <span className="kpi-trend warning" style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>Toleransi max 15 menit</span>
                  </div>
                </div>

                <div className="kpi-card purple" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div className="kpi-icon-wrapper purple" style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Percent size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Persentase Presensi</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{percentKehadiran}%</h3>
                    <span className="kpi-trend positive" style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>↗ Syarat kelulusan KKN</span>
                  </div>
                </div>

              </div>

              {/* Live Presence Action Card & Schedules Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
                
                {/* Left Card: Live Presence Action */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Presensi Kehadiran Hari Ini</h3>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 700, 
                        padding: '0.3rem 0.75rem', 
                        borderRadius: '20px',
                        background: isCheckedIn ? '#dcfce7' : '#fef3c7',
                        color: isCheckedIn ? '#166534' : '#92400e',
                        border: isCheckedIn ? '1px solid #bbf7d0' : '1px solid #fde68a'
                      }}>
                        {isCheckedIn ? '● SUDAH ABSEN' : '○ BELUM ABSEN'}
                      </span>
                    </div>

                    {/* Check In / Out Time Status Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Jam Masuk (Check In)</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isCheckedIn ? '#16a34a' : '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                          {isCheckedIn ? checkInTime : '--:--'}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Jam Pulang (Check Out)</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: checkOutTime ? '#2563eb' : '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                          {checkOutTime || '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Presence Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <button
                      onClick={handlePerformAttendance}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: isCheckedIn 
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CheckCircle2 size={19} />
                      <span>{isCheckedIn ? 'PULANG / CHECK OUT SEKARANG' : '📌 PRESENSI MASUK SEKARANG'}</span>
                    </button>

                    <button
                      onClick={handleScanQrAction}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1e293b',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <QrCode size={18} style={{ color: '#2563eb' }} />
                      <span>Pindai Kode QR Posko KKN</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Weekly Schedules Summary */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Jadwal KKN Pekan Ini</h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Agenda kegiatan & supervisi posko</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', padding: '0.3rem 0.65rem', borderRadius: '12px', fontWeight: 700 }}>
                      {schedules.length} Agenda
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {schedules.map((sc) => (
                      <div 
                        key={sc.id}
                        onClick={() => setSelectedSchedule(sc)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{sc.day} ({sc.timeStart} - {sc.timeEnd})</span>
                          <ChevronRight size={15} style={{ color: '#94a3b8' }} />
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{sc.title}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📍 {sc.location}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LOGBOOK HARIAN */}
          {activeTab === 'logbook' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Input Logbook Harian KKN</h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Laporkan rincian kegiatan KKN yang telah dilakukan hari ini untuk diverifikasi DPL.</p>
                </div>

                {logbookSubmitSuccess && (
                  <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Logbook harian Anda berhasil dikirim ke sistem DPL!</span>
                  </div>
                )}

                <form onSubmit={handleLogbookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>Tanggal Kegiatan</label>
                      <input 
                        type="date"
                        value={logbookDate}
                        onChange={(e) => setLogbookDate(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>Judul Kegiatan Logbook</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Pemetaan UMKM dan Penyuluhan Kebersihan Desa"
                        value={logbookTitle}
                        onChange={(e) => setLogbookTitle(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>Rincian Uraian Kegiatan & Hasil Worklog</label>
                    <textarea 
                      rows={4}
                      placeholder="Jelaskan secara singkat proses kegiatan, pihak yang terlibat, dan hasil akhir kerja lapangan..."
                      value={logbookDesc}
                      onChange={(e) => setLogbookDesc(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit"
                      style={{ padding: '0.75rem 1.75rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}
                    >
                      <Send size={16} />
                      <span>Kirim Laporan Logbook</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* History of Submitted Logbooks */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Riwayat Logbook Terkirim</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {logbooksList.map((lb) => (
                    <div key={lb.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📅 {lb.date}</span>
                        <span style={{ fontSize: '0.75rem', color: '#166534', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                          {lb.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>{lb.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>{lb.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: RIWAYAT KEHADIRAN */}
          {(activeTab === 'history' || activeTab === 'schedules') && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Riwayat Kehadiran KKN Saya</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Daftar log presensi masuk dan keluar yang tercatat di database</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#1e293b' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', background: '#f8fafc' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>TANGGAL</th>
                      <th style={{ padding: '0.75rem 1rem' }}>JAM MASUK</th>
                      <th style={{ padding: '0.75rem 1rem' }}>JAM PULANG</th>
                      <th style={{ padding: '0.75rem 1rem' }}>DURASI</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendanceLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{log.date || 'Hari Ini'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{log.checkIn || log.check_in || '08:15 AM'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{log.checkOut || log.check_out || '04:00 PM'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{log.hours || '8j 0m'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: log.status === 'Hadir' ? '#dcfce7' : '#fef3c7',
                            color: log.status === 'Hadir' ? '#166534' : '#92400e'
                          }}>
                            {log.status || 'Hadir'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myAttendanceLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          Belum ada riwayat kehadiran tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PENGATURAN AKUN */}
          {activeTab === 'settings' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', maxWidth: '600px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Pengaturan Profil Mahasiswa</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Nama Lengkap</label>
                  <input type="text" value={user?.name || 'Budi Pratama'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>NIM Mahasiswa</label>
                  <input type="text" value={user?.nim || '21081010045'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Kelompok KKN</label>
                  <input type="text" value="Kelompok 14 - Desa Sukamaju" readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Perbarui Kata Sandi</label>
                  <input type="password" placeholder="Masukkan password baru..." style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>

                <button onClick={() => alert('Profil berhasil diperbarui!')} style={{ padding: '0.75rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* SCHEDULE JOURNAL DETAIL MODAL PORTAL */}
      {selectedSchedule && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedSchedule(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)', zIndex: 99999, overflowY: 'auto', padding: '2rem 1rem' }}>
          <div className="modal-container" style={{ maxWidth: '960px', width: '100%', padding: 0, overflow: 'hidden', background: '#ffffff', border: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ background: '#f8fafc', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                Jadwal & Agenda Kegiatan <strong>{selectedSchedule.title}</strong> pada {selectedSchedule.day}, {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}
              </span>
              <button 
                type="button" 
                onClick={() => setSelectedSchedule(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ background: '#ffffff', display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1rem' }}>
              {[
                { id: 'rps', label: 'Bahan Ajar & Panduan (RPS)' },
                { id: 'jurnal', label: 'Jurnal Kegiatan' },
                { id: 'bobot', label: 'Bobot Penilaian KKN' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailsTab(t.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'transparent',
                    border: 'none',
                    color: detailsTab === t.id ? '#2563eb' : '#64748b',
                    borderBottom: detailsTab === t.id ? '3px solid #2563eb' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: detailsTab === t.id ? 700 : 500
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                borderRadius: '8px',
                padding: '2rem 1.5rem',
                color: '#ffffff',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.2)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                  {selectedSchedule.code || 'KKN62'} - {selectedSchedule.title}
                </h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#dbeafe', marginTop: '1rem' }}>
                  <span>📅 {selectedSchedule.day}</span>
                  <span>⏰ {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}</span>
                  <span>📍 {selectedSchedule.location}</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem 0' }}>Catatan Pengarahan DPL Pembimbing:</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                  Mahasiswa diharapkan hadir 15 menit sebelum kegiatan dimulai, membawa lembar verifikasi logbook harian, dan berkoordinasi langsung dengan ketua kelompok posko Desa Sukamaju.
                </p>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* SIMULATED QR CODE SCANNER MODAL PORTAL */}
      {showQrModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowQrModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '420px', width: '90%', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Scanner QR Code Presensi</h3>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {qrScanning ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1.25rem auto', borderColor: '#2563eb', borderTopColor: 'transparent' }} />
                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>Memindai Kode QR Posko...</p>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Arahkan kamera smartphone ke QR Code Jadwal</span>
              </div>
            ) : qrSuccess ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Presensi QR Berhasil!</h4>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Log kehadiran Anda telah berhasil diverifikasi oleh sistem.</p>
                <button onClick={() => setShowQrModal(false)} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Selesai
                </button>
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
