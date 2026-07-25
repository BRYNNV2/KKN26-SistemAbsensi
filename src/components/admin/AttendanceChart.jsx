import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

export default function AttendanceChart({ title = "Growth Trend", type = "growth" }) {
  // Preset datasets for dynamic filtering
  const growthDatasets = {
    "4 Minggu (1 Bulan KKN)": [
      { label: 'Minggu 1', val: 980, detail: '980 Mahasiswa Terdaftar' },
      { label: 'Minggu 2', val: 1120, detail: '1,120 Mahasiswa Terdaftar' },
      { label: 'Minggu 3', val: 1210, detail: '1,210 Mahasiswa Terdaftar' },
      { label: 'Minggu 4', val: 1248, detail: '1,248 Mahasiswa Terdaftar (Full)' }
    ],
    "Minggu 1 (Hari 1-7)": [
      { label: 'Hari 1', val: 320, detail: 'Registrasi Awal KKN' },
      { label: 'Hari 2', val: 450, detail: 'Pembekalan Desa' },
      { label: 'Hari 3', val: 620, detail: 'Penempatan Lokasi' },
      { label: 'Hari 4', val: 780, detail: 'Validasi DPL' },
      { label: 'Hari 5', val: 890, detail: 'Orientasi Posko' },
      { label: 'Hari 6', val: 940, detail: 'Sosialisasi Program' },
      { label: 'Hari 7', val: 980, detail: 'Evaluasi Minggu 1' }
    ],
    "Minggu 2 (Hari 8-14)": [
      { label: 'Hari 8', val: 990, detail: 'Supervisi DPL 1' },
      { label: 'Hari 9', val: 1020, detail: 'Program Utama' },
      { label: 'Hari 10', val: 1050, detail: 'Kegiatan Masyarakat' },
      { label: 'Hari 11', val: 1080, detail: 'Monitoring Wilayah' },
      { label: 'Hari 12', val: 1100, detail: 'Workshop Desa' },
      { label: 'Hari 13', val: 1110, detail: 'Penginputan Laporan' },
      { label: 'Hari 14', val: 1120, detail: 'Evaluasi Minggu 2' }
    ],
    "Minggu 3 (Hari 15-21)": [
      { label: 'Hari 15', val: 1130, detail: 'Pemberdayaan Desa' },
      { label: 'Hari 16', val: 1150, detail: 'Monitoring DPL' },
      { label: 'Hari 17', val: 1170, detail: 'Program Unggulan' },
      { label: 'Hari 18', val: 1185, detail: 'Kunjungan Lapangan' },
      { label: 'Hari 19', val: 1195, detail: 'Audit Presensi' },
      { label: 'Hari 20', val: 1200, detail: 'Rekap LPJ Harian' },
      { label: 'Hari 21', val: 1210, detail: 'Evaluasi Minggu 3' }
    ],
    "Minggu 4 (Hari 22-30)": [
      { label: 'Hari 22', val: 1215, detail: 'Finalisasi Progam' },
      { label: 'Hari 23', val: 1225, detail: 'Penyusunan LPJ' },
      { label: 'Hari 24', val: 1235, detail: 'Pameran Hasil KKN' },
      { label: 'Hari 25', val: 1240, detail: 'Penutupan Posko' },
      { label: 'Hari 26', val: 1244, detail: 'Pelepasan Desa' },
      { label: 'Hari 27', val: 1248, detail: 'Pengembalian Mahasiswa' }
    ]
  };

  const attendanceDatasets = {
    "7 Hari Terakhir": [
      { label: 'Senin', val: 92, detail: '982 / 1,067 Hadir (92%)' },
      { label: 'Selasa', val: 94, detail: '1,003 / 1,067 Hadir (94%)' },
      { label: 'Rabu', val: 91, detail: '971 / 1,067 Hadir (91%)' },
      { label: 'Kamis', val: 96, detail: '1,024 / 1,067 Hadir (96%)' },
      { label: 'Jumat', val: 93, detail: '992 / 1,067 Hadir (93%)' },
      { label: 'Sabtu', val: 89, detail: '950 / 1,067 Hadir (89%)' },
      { label: 'Minggu', val: 97, detail: '1,035 / 1,067 Hadir (97%)' }
    ],
    "Hari Ini (Per Jam)": [
      { label: '07:00', val: 45, detail: '480 Mahasiswa Presensi' },
      { label: '08:00', val: 78, detail: '832 Mahasiswa Presensi' },
      { label: '09:00', val: 95, detail: '1,014 Mahasiswa Presensi' },
      { label: '10:00', val: 97, detail: '1,035 Mahasiswa Presensi' },
      { label: '11:00', val: 98, detail: '1,046 Mahasiswa Presensi' },
      { label: '12:00', val: 98, detail: '1,046 Mahasiswa Presensi' }
    ],
    "Rekap 4 Minggu": [
      { label: 'Minggu 1', val: 91, detail: 'Rata-rata 91% Presensi' },
      { label: 'Minggu 2', val: 94, detail: 'Rata-rata 94% Presensi' },
      { label: 'Minggu 3', val: 95, detail: 'Rata-rata 95% Presensi' },
      { label: 'Minggu 4', val: 97, detail: 'Rata-rata 97% Presensi' }
    ]
  };

  const currentDatasets = type === 'growth' ? growthDatasets : attendanceDatasets;
  const filterKeys = Object.keys(currentDatasets);

  const [selectedFilter, setSelectedFilter] = useState(filterKeys[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeData = currentDatasets[selectedFilter] || currentDatasets[filterKeys[0]];

  const minVal = type === 'growth' ? 0 : 40;
  const maxVal = type === 'growth' ? 1400 : 100;

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = activeData.map((item, idx) => {
    const x = paddingLeft + (idx / (activeData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((item.val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val: item.val, label: item.label, detail: item.detail };
  });

  // Build SVG smooth Bezier path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  return (
    <div className="admin-chart-card">
      <div className="chart-card-header">
        <div className="chart-title-group">
          <h3 className="chart-title">{title}</h3>
          <Info size={14} className="chart-info-icon" title="Data dinamis real-time KKN62" />
        </div>

        {/* Dynamic Filter Dropdown */}
        <div className="dynamic-filter-wrapper" style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="chart-filter-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{selectedFilter}</span>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className="filter-options-menu">
              {filterKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-option-item ${selectedFilter === key ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFilter(key);
                    setDropdownOpen(false);
                    setHoveredPoint(null);
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Body */}
      <div className="chart-body-wrapper" style={{ position: 'relative' }}>
        {/* Floating Tooltip when Point is Hovered */}
        {hoveredPoint !== null && (
          <div 
            className="chart-tooltip-box"
            style={{
              position: 'absolute',
              left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
              top: `${(points[hoveredPoint].y / svgHeight) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <div className="tooltip-title">{points[hoveredPoint].label}</div>
            <div className="tooltip-value">
              {type === 'attendance' ? `${points[hoveredPoint].val}% Presensi` : `${points[hoveredPoint].val} Mahasiswa`}
            </div>
            <div className="tooltip-sub">{points[hoveredPoint].detail}</div>
          </div>
        )}

        <svg key={selectedFilter} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="admin-svg-chart">
          <defs>
            <linearGradient id={`chartGrad-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1={paddingLeft} y1={svgHeight - paddingBottom} x2={svgWidth - paddingRight} y2={svgHeight - paddingBottom} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill Gradient */}
          <path d={areaD} fill={`url(#chartGrad-${type})`} className="animated-chart-area" />

          {/* Line Path Drawing Animation from Start to End Point */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            className="animated-chart-line"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint === idx;
            return (
              <g 
                key={idx} 
                className="chart-point-group"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer Glow Ring on Hover */}
                {isHovered && (
                  <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(37, 99, 235, 0.2)" />
                )}

                {/* Point Circle */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isHovered ? 6.5 : 4.5} 
                  fill="#ffffff" 
                  stroke="#2563eb" 
                  strokeWidth={isHovered ? 3 : 2.5} 
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Value Text Above Point */}
                <text 
                  x={pt.x} 
                  y={pt.y - 10} 
                  textAnchor="middle" 
                  className={`chart-value-text ${isHovered ? 'active' : ''}`}
                >
                  {type === 'attendance' ? `${pt.val}%` : pt.val}
                </text>

                {/* Label Text Below */}
                <text 
                  x={pt.x} 
                  y={svgHeight - 12} 
                  textAnchor="middle" 
                  className="chart-label-text"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
