import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react';

export default function AdminTopbar({ user, onLogout, theme = 'light', onToggleTheme }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="admin-topbar">
      {/* Page Title & Subtitle */}
      <div className="topbar-title-group">
        <h1 className="topbar-page-title">Dashboard</h1>
        <p className="topbar-page-sub">Overview aktivitas KKN & metrik utama</p>
      </div>

      {/* Center Search Input */}
      <div className="topbar-search-wrapper">
        <Search size={17} className="search-icon" />
        <input 
          type="text" 
          className="topbar-search-input" 
          placeholder="Cari mahasiswa, DPL, lokasi desa... (⌘K)" 
        />
        <span className="search-shortcut">⌘K</span>
      </div>

      {/* Right Controls */}
      <div className="topbar-right-controls">
        {/* Dark Mode / Light Mode Sun & Moon Toggle Button */}
        <button 
          type="button" 
          className="topbar-icon-btn theme-toggle" 
          onClick={onToggleTheme} 
          title={theme === 'dark' ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
        >
          {theme === 'dark' ? <Sun size={19} className="sun-icon" /> : <Moon size={19} className="moon-icon" />}
        </button>

        {/* Bell Notification */}
        <button type="button" className="topbar-icon-btn" title="Notifikasi">
          <Bell size={19} />
          <span className="notification-badge">3</span>
        </button>

        {/* Message Square */}
        <button type="button" className="topbar-icon-btn" title="Pesan & Diskusi">
          <MessageSquare size={19} />
          <span className="notification-badge blue">5</span>
        </button>

        {/* Admin Profile Pill Dropdown */}
        <div className="admin-profile-wrapper">
          <button 
            type="button" 
            className="admin-profile-pill"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              <User size={18} />
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'Spencer Admin'}</span>
              <span className="profile-role">Admin KKN62</span>
            </div>
            <ChevronDown size={16} className="profile-chevron" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <strong>{user?.name || 'Administrator'}</strong>
                <span>{user?.email || 'admin.kkn62@gmail.com'}</span>
              </div>
              <hr />
              <button 
                type="button" 
                className="dropdown-item logout"
                onClick={onLogout}
              >
                <LogOut size={16} />
                <span>Keluar dari Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
