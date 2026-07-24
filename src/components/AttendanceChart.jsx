import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

export default function AttendanceChart({ title = "Growth Trend", type = "growth" }) {
  const [filter, setFilter] = useState(type === "growth" ? "4 Minggu (1 Bulan KKN)" : "7 Hari Terakhir");

  // Sample data points representing 1-Month KKN Program timeline (Weeks & Days)
  const kknMonthlyData = [
    { label: 'Minggu 1', val: 980 },
    { label: 'Minggu 2', val: 1120 },
    { label: 'Minggu 3', val: 1210 },
    { label: 'Minggu 4', val: 1248 }
  ];

  const kknDailyData = [
    { label: 'Senin', val: 92 },
    { label: 'Selasa', val: 94 },
    { label: 'Rabu', val: 91 },
    { label: 'Kamis', val: 96 },
    { label: 'Jumat', val: 93 },
    { label: 'Sabtu', val: 89 },
    { label: 'Minggu', val: 97 }
  ];

  const data = type === 'growth' ? kknMonthlyData : kknDailyData;
  const minVal = type === 'growth' ? 800 : 70;
  const maxVal = type === 'growth' ? 1400 : 100;

  // Viewport geometry with generous spacing
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((item.val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val: item.val, label: item.label };
  });

  // Build SVG smooth cubic path
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
          <Info size={14} className="chart-info-icon" title="Program KKN62 berlangsung 1 bulan (4 Minggu)" />
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

          {/* Grid lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1={paddingLeft} y1={svgHeight - paddingBottom} x2={svgWidth - paddingRight} y2={svgHeight - paddingBottom} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#chartGrad-${type})`} />

          {/* Smooth Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

          {/* Data Circles & Values */}
          {points.map((pt, idx) => (
            <g key={idx} className="chart-point-group">
              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
              
              {/* Value label */}
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="chart-value-text">
                {type === 'attendance' ? `${pt.val}%` : pt.val}
              </text>

              {/* Time Label (Weeks or Days) */}
              <text x={pt.x} y={svgHeight - 12} textAnchor="middle" className="chart-label-text">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
