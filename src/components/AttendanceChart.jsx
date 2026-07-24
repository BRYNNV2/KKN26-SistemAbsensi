import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

export default function AttendanceChart({ title = "Growth Trend", type = "growth" }) {
  const [filter, setFilter] = useState(type === "growth" ? "12 Bulan Terakhir" : "7 Hari Terakhir");

  // Sample data points matching reference charts
  const growthData = [
    { label: 'Jun 25', val: 820 },
    { label: 'Jul 25', val: 850 },
    { label: 'Agu 25', val: 880 },
    { label: 'Sep 25', val: 910 },
    { label: 'Okt 25', val: 950 },
    { label: 'Nov 25', val: 985 },
    { label: 'Des 25', val: 1020 },
    { label: 'Jan 26', val: 1060 },
    { label: 'Feb 26', val: 1100 },
    { label: 'Mar 26', val: 1150 },
    { label: 'Apr 26', val: 1200 },
    { label: 'Mei 26', val: 1248 }
  ];

  const attendanceData = [
    { label: 'Mei 14', val: 90 },
    { label: 'Mei 15', val: 94 },
    { label: 'Mei 16', val: 91 },
    { label: 'Mei 17', val: 93 },
    { label: 'Mei 18', val: 90 },
    { label: 'Mei 19', val: 88 },
    { label: 'Mei 20', val: 95 }
  ];

  const data = type === 'growth' ? growthData : attendanceData;
  const minVal = type === 'growth' ? 600 : 60;
  const maxVal = type === 'growth' ? 1400 : 100;

  // Compute SVG dimensions and path coordinates
  const svgWidth = 460;
  const svgHeight = 160;

  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 25 - ((item.val - minVal) / (maxVal - minVal)) * (svgHeight - 45);
    return { x, y, val: item.val, label: item.label };
  });

  // Build SVG path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - 15} L ${points[0].x} ${svgHeight - 15} Z`;

  return (
    <div className="admin-chart-card">
      <div className="chart-card-header">
        <div className="chart-title-group">
          <h3 className="chart-title">{title}</h3>
          <Info size={14} className="chart-info-icon" title="Metrik data real-time" />
        </div>
        <div className="chart-filter-dropdown">
          <span>{filter}</span>
          <ChevronDown size={14} />
        </div>
      </div>

      <div className="chart-body-wrapper">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="admin-svg-chart">
          <defs>
            <linearGradient id={`chartGrad-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1="0" y1="30" x2={svgWidth} y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="75" x2={svgWidth} y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="120" x2={svgWidth} y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#chartGrad-${type})`} />

          {/* Smooth Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Circles & Values */}
          {points.map((pt, idx) => (
            <g key={idx} className="chart-point-group">
              <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              <text x={pt.x} y={pt.y - 8} textAnchor="middle" className="chart-value-text">
                {type === 'attendance' ? `${pt.val}%` : pt.val}
              </text>
              <text x={pt.x} y={svgHeight - 2} textAnchor="middle" className="chart-label-text">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
