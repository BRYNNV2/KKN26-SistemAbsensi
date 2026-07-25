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
import MahasiswaSidebar from '../components/MahasiswaSidebar';
import MahasiswaTopbar from '../components/MahasiswaTopbar';
import { supabase } from '../lib/supabase';

export default function MahasiswaDashboardPage({ user, onLogout, onSwitchRole }) {
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
    <div className="admin-dashboard-layout" data-theme="dark" style={{ background: '#09090b', minHeight: '100vh', color: '#f4f4f5' }}>
      
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
        <MahasiswaTopbar user={user} onSwitchRole={onSwitchRole} />

        {/* Content Views */}
        <main style={{ padding: '1.75rem' }}>
          
          {/* TAB 1: BERANDA PRESENSI & JADWAL */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Header Hero Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #065f46 0%, #064e3b 50%, #09090b 100%)',
                border: '1px solid #10b981',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      <Sparkles size={14} />
                      <span>PORTAL UTAMA MAHASISWA KKN62</span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Selamat Datang, {user?.name || 'Budi Pratama'}! 👋
                    </h2>
                    <p style={{ color: '#a7f3d0', fontSize: '0.9rem', margin: '0.4rem 0 0 0' }}>
                      NIM: {user?.nim || '21081010045'} • Kelompok 14 (Desa Sukamaju, Kecamatan Serumpun)
                    </p>
                  </div>

                  <div style={{ background: 'rgba(9, 9, 11, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid #27272a', borderRadius: '12px', padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Pembimbing Lapangan (DPL):</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f4f4f5', marginTop: '2px' }}>
                      Dr. Ir. Hendra Wijaya, M.T.
                    </div>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Grid: Quick Presence Card & Schedule Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
                
                {/* Left Card: Live Presence Action */}
                <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>Presensi Kehadiran Hari Ini</h3>
                          <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 700, 
                        padding: '0.3rem 0.75rem', 
                        borderRadius: '20px',
                        background: isCheckedIn ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)',
                        color: isCheckedIn ? '#10b981' : '#eab308',
                        border: isCheckedIn ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(234,179,8,0.3)'
                      }}>
                        {isCheckedIn ? '● SUDAH ABSEN' : '○ BELUM ABSEN'}
                      </span>
                    </div>

                    {/* Check In / Out Time Status Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block' }}>Jam Masuk (Check In)</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isCheckedIn ? '#10b981' : '#71717a', marginTop: '0.2rem', display: 'block' }}>
                          {isCheckedIn ? checkInTime : '--:--'}
                        </span>
                      </div>

                      <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block' }}>Jam Pulang (Check Out)</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: checkOutTime ? '#3b82f6' : '#71717a', marginTop: '0.2rem', display: 'block' }}>
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
                        padding: '0.9rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: isCheckedIn 
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        boxShadow: isCheckedIn 
                          ? '0 4px 20px rgba(37, 99, 235, 0.35)'
                          : '0 4px 20px rgba(16, 185, 129, 0.35)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <CheckCircle2 size={20} />
                      <span>{isCheckedIn ? 'PULANG / CHECK OUT SEKARANG' : '📌 PRESENSI MASUK SEKARANG'}</span>
                    </button>

                    <button
                      onClick={handleScanQrAction}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #27272a',
                        background: '#18181b',
                        color: '#38bdf8',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <QrCode size={18} />
                      <span>Pindai Kode QR Posko KKN</span>
                    </button>
                  </div>
                </div>

                {/* Right Card: Quick Attendance Stats Overview */}
                <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem' }}>
                  <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>Statistik Kehadiran Saya</h3>
                    <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Rekapitulasi aktivitas KKN semester 7</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Hadir Tepat Waktu</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                        {totalHadir} Hari
                      </div>
                    </div>

                    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Terlambat</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                        {totalTerlambat} Hari
                      </div>
                    </div>

                    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Izin / Sakit</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
                        {totalIzin} Hari
                      </div>
                    </div>

                    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Persentase Presensi</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: '0.25rem' }}>
                        {percentKehadiran}%
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Weekly Schedules Section */}
              <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>Jadwal & Agenda Kegiatan KKN Hari Ini</h3>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Klik pada kartu jadwal untuk melihat detail Jurnal & Pengarahan DPL</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontWeight: 600 }}>
                    {schedules.length} Agenda Terjadwal
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {schedules.map((sc) => (
                    <div 
                      key={sc.id}
                      onClick={() => setSelectedSchedule(sc)}
                      style={{
                        background: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      }}
                      className="schedule-card-hover"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                          {sc.day}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>⏰ {sc.timeStart} - {sc.timeEnd}</span>
                      </div>

                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f4f4f5', margin: '0 0 0.5rem 0' }}>
                        {sc.title}
                      </h4>
                      
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>📍 {sc.location}</div>
                        <div>👥 {sc.group}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #27272a', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Lihat Detail Jurnal <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LOGBOOK HARIAN */}
          {activeTab === 'logbook' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>Input Logbook Harian KKN</h2>
                  <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: '0.2rem 0 0 0' }}>Laporkan rincian kegiatan KKN yang telah dilakukan hari ini untuk diverifikasi DPL.</p>
                </div>

                {logbookSubmitSuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Logbook harian Anda berhasil dikirim ke sistem DPL!</span>
                  </div>
                )}

                <form onSubmit={handleLogbookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7', display: 'block', marginBottom: '0.4rem' }}>Tanggal Kegiatan</label>
                      <input 
                        type="date"
                        value={logbookDate}
                        onChange={(e) => setLogbookDate(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '0.85rem', outline: 'none' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7', display: 'block', marginBottom: '0.4rem' }}>Judul Kegiatan Logbook</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Pemetaan UMKM dan Penyuluhan Kebersihan Desa"
                        value={logbookTitle}
                        onChange={(e) => setLogbookTitle(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '0.85rem', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7', display: 'block', marginBottom: '0.4rem' }}>Rincian Uraian Kegiatan & Hasil Worklog</label>
                    <textarea 
                      rows={4}
                      placeholder="Jelaskan secara singkat proses kegiatan, pihak yang terlibat, dan hasil akhir kerja lapangan..."
                      value={logbookDesc}
                      onChange={(e) => setLogbookDesc(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit"
                      style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                    >
                      <Send size={16} />
                      <span>Kirim Laporan Logbook</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* History of Submitted Logbooks */}
              <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', marginBottom: '1.25rem' }}>Riwayat Logbook Terkirim</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {logbooksList.map((lb) => (
                    <div key={lb.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>📅 {lb.date}</span>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                          {lb.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f4f4f5', margin: '0 0 0.35rem 0' }}>{lb.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: '#d4d4d8', margin: 0 }}>{lb.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: RIWAYAT KEHADIRAN */}
          {(activeTab === 'history' || activeTab === 'schedules') && (
            <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>Riwayat Kehadiran KKN Saya</h2>
                <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Daftar log presensi masuk dan keluar yang tercatat di database</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#d4d4d8' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #27272a', color: '#a1a1aa', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>TANGGAL</th>
                      <th style={{ padding: '0.75rem 1rem' }}>JAM MASUK</th>
                      <th style={{ padding: '0.75rem 1rem' }}>JAM PULANG</th>
                      <th style={{ padding: '0.75rem 1rem' }}>DURASI</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendanceLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1a1a1e' }}>
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
                            background: log.status === 'Hadir' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: log.status === 'Hadir' ? '#10b981' : '#f59e0b',
                            border: log.status === 'Hadir' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)'
                          }}>
                            {log.status || 'Hadir'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myAttendanceLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>
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
            <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem', maxWidth: '600px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f4f4f5', marginBottom: '1.25rem' }}>Pengaturan Profil Mahasiswa</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.3rem' }}>Nama Lengkap</label>
                  <input type="text" value={user?.name || 'Budi Pratama'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.3rem' }}>NIM Mahasiswa</label>
                  <input type="text" value={user?.nim || '21081010045'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.3rem' }}>Kelompok KKN</label>
                  <input type="text" value="Kelompok 14 - Desa Sukamaju" readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.3rem' }}>Perbarui Kata Sandi</label>
                  <input type="password" placeholder="Masukkan password baru..." style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }} />
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
        <div className="modal-overlay" onClick={() => setSelectedSchedule(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', zIndex: 99999, overflowY: 'auto', padding: '2rem 1rem' }}>
          <div className="modal-container" style={{ maxWidth: '960px', width: '100%', padding: 0, overflow: 'hidden', background: '#121215', border: '1px solid #27272a' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ background: '#1a1a1f', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                Jadwal & Agenda Kegiatan <strong>{selectedSchedule.title}</strong> pada {selectedSchedule.day}, {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}
              </span>
              <button 
                type="button" 
                onClick={() => setSelectedSchedule(null)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ background: '#121215', display: 'flex', borderBottom: '1px solid #27272a', padding: '0 1rem' }}>
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
                    color: detailsTab === t.id ? '#10b981' : '#a1a1aa',
                    borderBottom: detailsTab === t.id ? '3px solid #10b981' : '3px solid transparent',
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
                background: 'linear-gradient(135deg, #065f46 0%, #0f172a 100%)',
                borderRadius: '8px',
                padding: '2rem 1.5rem',
                color: '#ffffff',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                  {selectedSchedule.code || 'KKN62'} - {selectedSchedule.title}
                </h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#a7f3d0', marginTop: '1rem' }}>
                  <span>📅 {selectedSchedule.day}</span>
                  <span>⏰ {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}</span>
                  <span>📍 {selectedSchedule.location}</span>
                </div>
              </div>

              <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f4f4f5', margin: '0 0 0.75rem 0' }}>Catatan Pengarahan DPL Pembimbing:</h4>
                <p style={{ fontSize: '0.85rem', color: '#d4d4d8', margin: 0 }}>
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
        <div className="modal-overlay" onClick={() => setShowQrModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '420px', width: '90%', background: '#121215', border: '1px solid #27272a', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>Scanner QR Code Presensi</h3>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {qrScanning ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1.25rem auto', borderColor: '#10b981', borderTopColor: 'transparent' }} />
                <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>Memindai Kode QR Posko...</p>
                <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Arahkan kamera smartphone ke QR Code Jadwal</span>
              </div>
            ) : qrSuccess ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>Presensi QR Berhasil!</h4>
                <p style={{ color: '#a1a1aa', fontSize: '0.82rem' }}>Log kehadiran Anda telah berhasil diverifikasi oleh sistem.</p>
                <button onClick={() => setShowQrModal(false)} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
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
