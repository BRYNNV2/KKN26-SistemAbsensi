import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 20)); // May 20, 2026

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, currentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, currentMonth: true, isToday: d === 20 && month === 4 && year === 2026 });
  }

  // Next month leading days
  const totalCells = Math.ceil(days.length / 7) * 7;
  const remainingCells = totalCells - days.length;
  for (let n = 1; n <= remainingCells; n++) {
    days.push({ day: n, currentMonth: false });
  }

  return (
    <div className="mini-calendar-card">
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className="calendar-month-title">
          {monthNames[month]} {year}
        </span>
        <button type="button" className="calendar-nav-btn" onClick={nextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="calendar-day-header">
            {day}
          </div>
        ))}
        {days.map((item, idx) => (
          <div
            key={idx}
            className={`calendar-day-cell ${!item.currentMonth ? 'other-month' : ''} ${item.isToday ? 'today' : ''}`}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  );
}
