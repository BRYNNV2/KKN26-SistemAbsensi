import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function MiniCalendar({ events = [25, 27, 30] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date()); // Dynamic current real-time date
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const resetToToday = () => {
    setViewDate(new Date());
    setSelectedDay(today.getDate());
  };

  // Generate calendar days for the current view date
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

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
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasEvent = events.includes(d);
    days.push({ 
      day: d, 
      currentMonth: true, 
      isToday, 
      hasEvent,
      isSelected: d === selectedDay && month === viewDate.getMonth() 
    });
  }

  // Next month leading days
  const totalCells = Math.ceil(days.length / 7) * 7;
  const remainingCells = totalCells - days.length;
  for (let n = 1; n <= remainingCells; n++) {
    days.push({ day: n, currentMonth: false });
  }

  return (
    <div className="mini-calendar-card">
      {/* Calendar Header with Realtime Month & Year */}
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={prevMonth} title="Bulan Sebelumnya">
          <ChevronLeft size={16} />
        </button>
        
        <div className="calendar-title-group" onClick={resetToToday} style={{ cursor: 'pointer' }} title="Klik untuk Kembali ke Hari Ini">
          <span className="calendar-month-title">
            {monthNames[month]} {year}
          </span>
        </div>

        <button type="button" className="calendar-nav-btn" onClick={nextMonth} title="Bulan Berikutnya">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Days Grid */}
      <div className="calendar-grid">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="calendar-day-header">
            {day}
          </div>
        ))}

        {days.map((item, idx) => {
          const cellClasses = [
            'calendar-day-cell',
            !item.currentMonth ? 'other-month' : '',
            item.isToday ? 'today' : '',
            item.isSelected && !item.isToday ? 'selected' : '',
            item.hasEvent ? 'has-event' : ''
          ].filter(Boolean).join(' ');

          return (
            <div
              key={idx}
              className={cellClasses}
              onClick={() => {
                if (item.currentMonth) {
                  setSelectedDay(item.day);
                }
              }}
              title={item.hasEvent ? `Ada Agenda Supervisi pada tanggal ${item.day} ${monthNames[month]}` : ''}
            >
              <span className="day-number">{item.day}</span>
              {/* Event Marker Indicator Dot */}
              {item.hasEvent && item.currentMonth && (
                <span className="calendar-event-dot" />
              )}
            </div>
          );
        })}
      </div>

      {/* Realtime Footer Badge */}
      <div className="calendar-footer-badge">
        <CalendarIcon size={13} />
        <span>Hari Ini: {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}</span>
      </div>
    </div>
  );
}
