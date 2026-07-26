import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  CheckCircle,
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
  ChevronDown,
  User,
  Sparkles,
  AlertTriangle,
  Info
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
  const [todayAttendance, setTodayAttendance] = useState([]);
  
  // Schedules State
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [detailsTab, setDetailsTab] = useState('jurnal');

  // Broadcast QR Session State
  const [activeSession, setActiveSession] = useState(null);

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

  // Determine current day & active schedule added by Dosen
  const currentDayIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()];
  const todayActiveSchedule = schedules.find(s => s.day === currentDayIndonesian);
  
  // Verify if active session is valid (matches today's day and time limit)
  const isSessionValid = () => {
    if (!activeSession) return false;
    
    let sDay = activeSession.day;
    let sBatas = activeSession.time_end;
    
    // Extract from serialized title fallback if needed
    if (!sDay || !sBatas) {
      const matchDay = activeSession.title.match(/Hari:\s*([^\s|]+)/);
      const matchBatas = activeSession.title.match(/Batas:\s*([^\s|]+)/);
      sDay = matchDay ? matchDay[1] : null;
      sBatas = matchBatas ? matchBatas[1] : null;
    }
    
    // 1. Day verification
    if (sDay && sDay !== currentDayIndonesian) {
      return false;
    }
    
    // 2. Time limit verification
    if (sBatas) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      if (currentTimeStr > sBatas) {
        return false;
      }
    }
    
    return true;
  };

  // Enforce active session requirements
  const isScheduleInputtedByDosen = isSessionValid();

  // Stats
  const totalHadir = myAttendanceLogs.filter(a => a.status === 'Hadir').length || 0;
  const totalTerlambat = myAttendanceLogs.filter(a => a.status === 'Terlambat').length || 0;
  const totalIzin = myAttendanceLogs.filter(a => a.status === 'Izin').length || 0;
  const totalPertemuan = totalHadir + totalTerlambat + totalIzin;
  const percentKehadiran = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 100;

  const checkActiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sesi_presensi')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setActiveSession(data[0]);
      } else {
        const cached = localStorage.getItem('kkn_active_session');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.status === 'active') {
            setActiveSession(parsed);
          } else {
            setActiveSession(null);
          }
        } else {
          setActiveSession(null);
        }
      }
    } catch (err) {
      const cached = localStorage.getItem('kkn_active_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.status === 'active') {
          setActiveSession(parsed);
        } else {
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    }
  };

  // Fetch Live Data on mount and poll active sessions
  useEffect(() => {
    fetchSchedules();
    fetchMyAttendance();
    fetchTodayAttendance();
    checkActiveSession();

    // Poll active session status and schedules every 3 seconds
    const interval = setInterval(() => {
      checkActiveSession();
      fetchMyAttendance();
      fetchTodayAttendance();
      fetchSchedules();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const todayStr = new Date().toLocaleDateString('id-ID');
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          check_in,
          status,
          date,
          mahasiswa_id,
          mahasiswa (
            name,
            nim,
            department
          )
        `)
        .eq('date', todayStr);

      if (error) throw error;
      if (data) {
        setTodayAttendance(data);
      }
    } catch (err) {
      console.warn('Failed to fetch today all attendance logs:', err.message);
      const cached = localStorage.getItem('kkn_attendance_cached');
      if (cached) {
        const allLogs = JSON.parse(cached);
        const todayStr = new Date().toLocaleDateString('id-ID');
        const filtered = allLogs.filter(log => log.date === todayStr);
        setTodayAttendance(filtered);
      }
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase.from('schedules').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) {
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
      console.warn('Failed to load schedules from Supabase:', err.message);
      const cached = localStorage.getItem('kkn_schedules_cached');
      if (cached) {
        setSchedules(JSON.parse(cached));
      }
    }
  };

  const fetchMyAttendance = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('mahasiswa_id', user.id)
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) {
        setMyAttendanceLogs(data);
        const todayStr = new Date().toLocaleDateString('id-ID');
        const todayRecord = data.find(d => d.date === todayStr);
        if (todayRecord) {
          setIsCheckedIn(true);
          setCheckInTime(todayRecord.check_in || '08:15 AM');
          setCheckOutTime(todayRecord.check_out || '');
        } else {
          setIsCheckedIn(false);
          setCheckInTime('');
          setCheckOutTime('');
        }
      }
    } catch (err) {
      console.warn('DB attendance fetch failed:', err.message);
      const cached = localStorage.getItem('kkn_attendance_cached');
      if (cached) {
        const allLogs = JSON.parse(cached);
        const filtered = allLogs.filter(log => log.mahasiswa_id === user.id || log.nim === user.nim);
        setMyAttendanceLogs(filtered);
        const todayStr = new Date().toLocaleDateString('id-ID');
        const todayRecord = filtered.find(d => d.date === todayStr);
        if (todayRecord) {
          setIsCheckedIn(true);
          setCheckInTime(todayRecord.check_in || todayRecord.checkIn || '08:15 AM');
        } else {
          setIsCheckedIn(false);
        }
      }
    }
  };

  // Perform Single Attendance Record action
  const handlePerformAttendance = async () => {
    if (!activeSession) {
      alert('Sesi presensi belum dibuka oleh Dosen DPL untuk hari ini.');
      return;
    }

    if (isCheckedIn) {
      alert('Anda sudah melakukan presensi kehadiran untuk hari ini.');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID');

    setIsCheckedIn(true);
    setCheckInTime(timeStr);

    const newLog = {
      id: Date.now(),
      mahasiswa_id: user?.id,
      name: user?.name || '-',
      nim: user?.nim || '-',
      group: user?.kelompok || '-',
      checkIn: timeStr,
      status: 'Hadir',
      date: dateStr
    };

    const updated = [newLog, ...myAttendanceLogs];
    setMyAttendanceLogs(updated);

    // Save to local cache of all logs too
    try {
      const cached = localStorage.getItem('kkn_attendance_cached');
      const allLogs = cached ? JSON.parse(cached) : [];
      localStorage.setItem('kkn_attendance_cached', JSON.stringify([newLog, ...allLogs]));
    } catch (err) {
      console.warn(err);
    }

    try {
      // Create session id if available
      const insertData = {
        mahasiswa_id: user?.id || 'mhs-1',
        check_in: timeStr,
        hours: 'Hadir',
        status: 'Hadir',
        date: dateStr
      };
      
      if (activeSession && activeSession.id && !activeSession.id.toString().startsWith('local-')) {
        insertData.sesi_id = activeSession.id;
      }

      const { error } = await supabase.from('attendance').insert(insertData);
      if (error && error.message.includes('column "sesi_id"')) {
        // Fallback if column sesi_id doesn't exist yet
        delete insertData.sesi_id;
        await supabase.from('attendance').insert(insertData);
      }
    } catch (err) {
      console.warn('Database insert failed, saved to local cache:', err.message);
    }

    alert(`Presensi Kehadiran Berhasil pada jam ${timeStr}!`);
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
    if (!activeSession) {
      alert('Sesi presensi belum dibuka oleh Dosen DPL untuk hari ini. QR Code presensi belum dapat dipindai.');
      return;
    }

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
              
              {/* Header Hero Banner (Clean Elegant Style) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: '5px solid #0f172a',
                borderRadius: '12px',
                padding: '1.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#334155', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <Sparkles size={14} style={{ color: '#2563eb' }} />
                      <span>PORTAL AKADEMIK MAHASISWA KKN62</span>
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Selamat Datang, {user?.name || 'Mahasiswa'}!
                    </h2>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0.4rem 0 0 0' }}>
                      NIM: {user?.nim || '-'} • {user?.kelompok || 'Kelompok KKN'}
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dosen Pembimbing Lapangan (DPL):</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {user?.metadata?.dosen_dpl || 'Dosen Pembimbing Lapangan'}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid Matching Admin Dashboard (Clean 3-Color System) */}
              <div className="kpi-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                
                <div className="kpi-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="kpi-icon-wrapper" style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Hadir</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{totalHadir} Hari</h3>
                    <span className="kpi-trend" style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>Logbook terverifikasi</span>
                  </div>
                </div>

                <div className="kpi-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="kpi-icon-wrapper" style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Presensi Tepat Waktu</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{totalHadir} Hari</h3>
                    <span className="kpi-trend" style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>100% disiplin posko</span>
                  </div>
                </div>

                <div className="kpi-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="kpi-icon-wrapper" style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Terlambat</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{totalTerlambat} Hari</h3>
                    <span className="kpi-trend" style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Toleransi max 15 menit</span>
                  </div>
                </div>

                <div className="kpi-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="kpi-icon-wrapper" style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Percent size={20} />
                  </div>
                  <div className="kpi-details" style={{ marginTop: '0.75rem' }}>
                    <span className="kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Persentase Presensi</span>
                    <h3 className="kpi-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{percentKehadiran}%</h3>
                    <span className="kpi-trend" style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>Syarat kelulusan KKN</span>
                  </div>
                </div>

              </div>

              {/* Live Presence Action Card & Schedules Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
                
                {/* Left Card: Live Presence Action */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        background: !isScheduleInputtedByDosen ? '#f1f5f9' : (isCheckedIn ? '#dcfce7' : '#fef3c7'),
                        color: !isScheduleInputtedByDosen ? '#64748b' : (isCheckedIn ? '#166534' : '#92400e'),
                        border: !isScheduleInputtedByDosen ? '1px solid #cbd5e1' : (isCheckedIn ? '1px solid #bbf7d0' : '1px solid #fde68a')
                      }}>
                        {!isScheduleInputtedByDosen ? 'SESI BELUM DIBUKA' : (isCheckedIn ? 'SUDAH ABSEN' : 'BELUM ABSEN')}
                      </span>
                    </div>

                    {/* Dosen Schedule Status Notification */}
                    {!activeSession ? (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <AlertTriangle size={24} style={{ color: '#d97706', margin: '0 auto 0.5rem auto' }} />
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                          Belum Ada Sesi Presensi Aktif dari Dosen DPL
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                          Dosen DPL belum membuka sesi presensi QR harian broadcast saat ini.<br />
                          Tombol presensi dan scan QR akan otomatis aktif setelah Dosen membuka sesi presensi.
                        </p>
                      </div>
                    ) : (
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 800, display: 'block' }}>
                          SESI PRESENSI AKTIF: {activeSession?.title}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#2563eb', display: 'block', marginTop: '0.3rem', fontWeight: 600 }}>
                          Hari: {activeSession?.day || 'Hari Ini'} • Batas Jam Absen: s/d {activeSession?.time_end || 'Selesai'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Presence Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <button
                      onClick={handlePerformAttendance}
                      disabled={!isScheduleInputtedByDosen || isCheckedIn}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: (!isScheduleInputtedByDosen || isCheckedIn) 
                          ? '#e2e8f0'
                          : '#2563eb',
                        color: (!isScheduleInputtedByDosen || isCheckedIn) ? '#64748b' : '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: (!isScheduleInputtedByDosen || isCheckedIn) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem'
                      }}
                    >
                      <CheckCircle2 size={19} />
                      <span>{isCheckedIn ? 'PRESENSI HARI INI TELAH TERCATAT' : 'PRESENSI KEHADIRAN SEKARANG'}</span>
                    </button>

                    <button
                      onClick={handleScanQrAction}
                      disabled={!isScheduleInputtedByDosen || isCheckedIn}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: (!isScheduleInputtedByDosen || isCheckedIn) ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                        background: (!isScheduleInputtedByDosen || isCheckedIn) ? '#f8fafc' : '#ffffff',
                        color: (!isScheduleInputtedByDosen || isCheckedIn) ? '#cbd5e1' : '#0f172a',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: (!isScheduleInputtedByDosen || isCheckedIn) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <QrCode size={18} style={{ color: (isScheduleInputtedByDosen && !isCheckedIn) ? '#0f172a' : '#cbd5e1' }} />
                      <span>Pindai Kode QR Posko KKN</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Weekly Schedules Summary */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Riwayat & Kartu Jadwal Absensi</h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Daftar kartu agenda kegiatan & riwayat presensi KKN</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#334155', background: '#f1f5f9', padding: '0.3rem 0.65rem', borderRadius: '12px', fontWeight: 700, border: '1px solid #e2e8f0' }}>
                      {schedules.length} Agenda
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {schedules.map((sc) => {
                      const isActive = activeSession && (activeSession.schedule_id === sc.id || activeSession.title.includes(sc.title));
                      return (
                        <div 
                          key={sc.id}
                          onClick={() => setSelectedSchedule(sc)}
                          style={{
                            background: isActive ? '#eff6ff' : '#ffffff',
                            border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            position: 'relative',
                            boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)'
                          }}
                        >
                          {isActive && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: '#dbeafe',
                              border: '1px solid #bfdbfe',
                              color: '#1e40af',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px'
                            }}>
                              Absen Aktif
                            </div>
                          )}

                          <div style={{ marginBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>{sc.title}</h4>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{sc.code || 'KKN_ACT'}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: '#475569' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={14} style={{ color: '#2563eb' }} />
                              <span>{sc.day}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={14} style={{ color: '#2563eb' }} />
                              <span>{sc.timeStart} - {sc.timeEnd}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BookOpen size={14} style={{ color: '#2563eb' }} />
                              <span>{sc.group || 'Semua Kelompok'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MapPin size={14} style={{ color: '#2563eb' }} />
                              <span>{sc.location || 'Posko KKN'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {schedules.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Belum ada jadwal yang diinput oleh Dosen DPL.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LOGBOOK HARIAN */}
          {activeTab === 'logbook' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Input Logbook Harian KKN</h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Laporkan rincian kegiatan KKN yang telah dilakukan hari ini untuk diverifikasi DPL.</p>
                </div>

                {logbookSubmitSuccess && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
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
                        style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
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
                        style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
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
                      style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit"
                      style={{ padding: '0.75rem 1.75rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Send size={16} />
                      <span>Kirim Laporan Logbook</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* History of Submitted Logbooks */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Riwayat Logbook Terkirim</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {logbooksList.map((lb) => (
                    <div key={lb.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
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
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Riwayat Kehadiran KKN Saya</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Daftar log presensi masuk dan keluar yang tercatat di database</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#1e293b' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', background: '#f8fafc' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>TANGGAL</th>
                      <th style={{ padding: '0.75rem 1rem' }}>WAKTU PRESENSI</th>
                      <th style={{ padding: '0.75rem 1rem' }}>KELOMPOK / POSKO</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendanceLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{log.date || 'Hari Ini'}</td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#16a34a' }}>{log.checkIn || log.check_in || '08:15 AM'}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{log.group || user?.kelompok || '-'}</td>
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
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
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
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', maxWidth: '600px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Pengaturan Profil Mahasiswa</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Nama Lengkap</label>
                  <input type="text" value={user?.name || '-'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>NIM Mahasiswa</label>
                  <input type="text" value={user?.nim || '-'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Kelompok KKN</label>
                  <input type="text" value={user?.kelompok || '-'} readOnly style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Perbarui Kata Sandi</label>
                  <input type="password" placeholder="Masukkan password baru..." style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                </div>

                <button onClick={() => alert('Profil berhasil diperbarui!')} style={{ padding: '0.75rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* SCHEDULE JOURNAL DETAIL MODAL PORTAL (IMAGE 2 EXACT STYLING) */}
      {selectedSchedule && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedSchedule(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', zIndex: 99999, overflowY: 'auto', padding: '1.5rem 1rem' }}>
          <div className="modal-container" style={{ maxWidth: '980px', width: '100%', padding: 0, overflow: 'hidden', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Top Navy Header Bar */}
            <div style={{ background: '#0f2347', color: '#ffffff', padding: '0.65rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
              Jadwal Kelas Mata Kuliah <strong>{selectedSchedule.title}</strong> pada {selectedSchedule.day}, {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}
            </div>

            {/* Navigation Tabs (Image 2 style with yellow active tab) */}
            <div style={{ background: '#ffffff', display: 'flex', borderBottom: '1px solid #cbd5e1', padding: '0 0.5rem' }}>
              {[
                { id: 'rps', label: 'Bahan Ajar dan Silabus (RPS)' },
                { id: 'jurnal', label: 'Jurnal Kelas' },
                { id: 'bobot', label: 'Bobot Nilai Akademik' },
                { id: 'info', label: 'Informasi Tambahan' }
              ].map(t => {
                const isActiveTab = detailsTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailsTab(t.id)}
                    style={{
                      padding: '0.85rem 1.5rem',
                      background: isActiveTab ? '#f59e0b' : 'transparent',
                      border: 'none',
                      color: isActiveTab ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isActiveTab ? 700 : 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
              
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedSchedule(null)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ padding: '1.25rem 1.5rem 1.75rem' }}>
              {detailsTab === 'jurnal' ? (
                <div>
                  {/* Banner Card (Image 2 Deep Blue styling) */}
                  <div style={{
                    background: '#0f2952',
                    borderRadius: '8px',
                    padding: '1.5rem 1.75rem',
                    color: '#ffffff',
                    position: 'relative',
                    marginBottom: '1.25rem',
                    overflow: 'hidden'
                  }}>
                    {/* Decorative curved background elements on right */}
                    <div style={{
                      position: 'absolute',
                      right: '-30px',
                      top: '-40px',
                      width: '220px',
                      height: '220px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      pointerEvents: 'none'
                    }} />
                    <div style={{
                      position: 'absolute',
                      right: '40px',
                      bottom: '-60px',
                      width: '180px',
                      height: '180px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
                      <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#ffffff' }}>
                          {selectedSchedule.code || 'INF11030'} - {selectedSchedule.title}
                        </h2>
                        
                        {/* Class QR Code & Attendance Trigger */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.4rem', marginBottom: '1rem' }}>
                          <button 
                            type="button"
                            onClick={handleScanQrAction}
                            style={{
                              background: 'rgba(255,255,255,0.12)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              color: '#ffffff',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <span>Class QR Code</span>
                            <QrCode size={14} />
                          </button>

                          {isCheckedIn ? (
                            <div style={{ background: '#15803d', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle size={14} />
                              <span>Sudah Absen ({checkInTime})</span>
                            </div>
                          ) : activeSession ? (
                            <button
                              type="button"
                              onClick={handlePerformAttendance}
                              style={{
                                background: '#2563eb',
                                border: 'none',
                                color: '#ffffff',
                                padding: '0.35rem 0.95rem',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <CheckCircle size={14} />
                              <span>Klik Absen Kehadiran</span>
                            </button>
                          ) : null}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.82rem', color: '#e2e8f0' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> {selectedSchedule.day}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} /> {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} /> {selectedSchedule.location || 'Ruang 8 FT'}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', alignSelf: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.3 }}>
                          Universitas Maritim Raja Ali Haji
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginTop: '2px' }}>
                          Kuliah Kerja Nyata (KKN)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout (Image 2 Exact ratio) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
                    
                    {/* Left Column: Absensi Student Log List */}
                    <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1rem', height: 'fit-content' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.65rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Absensi</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                          {todayAttendance.length}/41
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
                        {todayAttendance.length > 0 ? (
                          todayAttendance.map((s, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                fontSize: '0.78rem',
                                color: '#334155',
                                padding: '0.2rem 0'
                              }}
                            >
                              <span style={{ color: '#475569' }}>{s.mahasiswa?.nim || s.nim || '-'}</span>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.mahasiswa?.name || s.name || '-'}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: '#64748b', fontSize: '0.78rem' }}>
                            Belum ada mahasiswa yang hadir.
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'center', paddingTop: '0.65rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <ChevronDown size={16} style={{ color: '#64748b' }} />
                      </div>
                    </div>

                    {/* Right Column: Dynamic Jurnal Entries */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #2563eb', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                              <User size={22} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                {user?.metadata?.dosen_dpl || 'Dosen Pembimbing Lapangan (DPL)'}
                              </h4>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {selectedSchedule?.day}, {selectedSchedule?.timeStart} - {selectedSchedule?.timeEnd}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            {activeAttendanceSession && activeAttendanceSession.schedule_id === selectedSchedule.id ? 'Aktif' : 'Dijadwalkan'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex' }}>
                            <span style={{ color: '#475569', width: '130px', flexShrink: 0 }}>Jenis Jurnal</span>
                            <span>: Presensi Kegiatan KKN</span>
                          </div>
                          <div style={{ display: 'flex' }}>
                            <span style={{ color: '#475569', width: '130px', flexShrink: 0 }}>Metode Absen</span>
                            <span>: QR Code Broadcast</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ color: '#475569', width: '130px', flexShrink: 0 }}>Topik Pembahasan</span>
                            <span>: {selectedSchedule?.title || 'Agenda Kegiatan KKN'}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', color: '#0f172a' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0' }}>Panduan / RPS Kegiatan:</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                    Informasi mengenai <strong>{selectedSchedule.title}</strong>. Sesi presensi diisi secara langsung dari jurnal kegiatan ini.
                  </p>
                </div>
              )}
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
                <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1.25rem auto', borderColor: '#0f172a', borderTopColor: 'transparent' }} />
                <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>Memindai Kode QR Posko...</p>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Arahkan kamera smartphone ke QR Code Jadwal</span>
              </div>
            ) : qrSuccess ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Presensi QR Berhasil!</h4>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Log kehadiran Anda telah berhasil diverifikasi oleh sistem.</p>
                <button onClick={() => setShowQrModal(false)} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
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
