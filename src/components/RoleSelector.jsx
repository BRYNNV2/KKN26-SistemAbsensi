import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export default function RoleSelector({ selectedRole, onSelectRole }) {
  return (
    <div className="role-switcher">
      <button
        type="button"
        className={`role-btn ${selectedRole === 'mahasiswa' ? 'active' : ''}`}
        onClick={() => onSelectRole('mahasiswa')}
      >
        <GraduationCap size={18} />
        <span>Mahasiswa KKN</span>
      </button>

      <button
        type="button"
        className={`role-btn ${selectedRole === 'dosen' ? 'active' : ''}`}
        onClick={() => onSelectRole('dosen')}
      >
        <ShieldCheck size={18} />
        <span>Dosen DPL</span>
      </button>
    </div>
  );
}
