import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

export default function AttendanceChart({ title = "Growth Trend", type = "growth" }) {
  const [filter, setFilter] = useState(type === "growth" ? "12 Bulan Terakhir" : "7 Hari Terakhir");
  const [activePoint, setActivePoint] = useState(null);

  // Sample data points
  const growthData = [
    { label: 'Jun', val: 820 },
    { label: 'Jul', val: 850 },
    { label: 'Agu', val: 880 },
    { label: 'Sep', val: 910 },
    { label: 'Okt', val: 950 },
    { label: 'Nov', val: 985 },
    { label: 'Des', val: 1020 },
    { label: 'Jan', val: 1060 },
    { label: 'Feb', val: 1100 },
    { label: 'Mar', val: 1150 },
    { label: 'Apr', val: 1200 },
    { label: 'Mei', val: 1248 }
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

  // Viewport geometry with ample padding to prevent text overlap
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingLeft = 35;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((item.val - minVal) / (maxVal - minVal)) * chartHeight;
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

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

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
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1={paddingLeft} y1={svgHeight - paddingBottom} x2={svgWidth - paddingRight} y2={svgHeight - paddingBottom} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#chartGrad-${type})`} />

          {/* Smooth Curved Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

          {/* Data Circles & Values */}
          {points.map((pt, idx) => (
            <g 
              key={idx} 
              className="chart-point-group"
              onMouseEnter={() => setActivePoint(idx)}
              onMouseLeave={() => setActivePoint(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Point Circle */}
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={activePoint === idx ? 6 : 4} 
                fill="#ffffff" 
                stroke="#2563eb" 
                strokeWidth={activePoint === idx ? 3 : 2} 
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Value Text Above Point */}
              <text 
                x={pt.x} 
                y={pt.y - 10} 
                textAnchor="middle" 
                className="chart-value-text"
              >
                {type === 'attendance' ? `${pt.val}%` : pt.val}
              </text>

              {/* Bottom Label Text */}
              <text 
                x={pt.x} 
                y={svgHeight - 12} 
                textAnchor="middle" 
                className="chart-label-text"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
