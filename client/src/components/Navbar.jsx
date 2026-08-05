import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      if (quickSearch.toUpperCase().startsWith('REP-')) {
        navigate(`/track/${quickSearch.trim().toUpperCase()}`);
      } else {
        navigate(`/repairs?search=${encodeURIComponent(quickSearch.trim())}`);
      }
      setQuickSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60"
            aria-label="Toggle Navigation"
          >
            <Wrench className="w-5 h-5 text-blue-400" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search Repair ID (REP-2026-...), Phone, Name..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </form>
        </div>

        {/* Right: Quick actions, Role Indicator, User profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/track/REP-2026-00101"
            target="_blank"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition"
          >
            <span>Customer Track Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold leading-none text-slate-100">{user?.name}</p>
                <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400">
                  {user?.role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-200 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
