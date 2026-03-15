import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const { user, token, logout } = useAuth();

  if (!token || !user) return null;

  return (
    <nav className="bg-[#141414] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 decoration-transparent group">
        <span className="text-3xl text-[#d4a843] group-hover:scale-110 transition-transform duration-300">♞</span>
        <h1 className="text-white font-black text-xl tracking-widest uppercase italic hidden sm:block">Knight Vision</h1>
      </Link>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-white font-bold">{user.username}</span>
          <span className="text-[#d4a843] text-xs font-black tracking-widest uppercase">ELO {user.elo}</span>
        </div>
        
        <button 
          onClick={logout}
          className="p-2 bg-[#2a2a2a] hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors active:scale-95 flex items-center gap-2"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">Leave</span>
        </button>
      </div>
    </nav>
  );
}
