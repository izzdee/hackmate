import { useCallback, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronDown, LogOut, Menu, Shield, User, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useClickOutside from '../hooks/useClickOutside';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/hackathons', label: 'Hackathons' },
  { to: '/search', label: 'Find Teammates' },
  { to: '/requests', label: 'Requests' },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // user dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // mobile nav
  const menuRef = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClickOutside(menuRef, closeMenu, menuOpen);

  const links = isAdmin ? [...LINKS, { to: '/admin/hackathons', label: 'Admin' }] : LINKS;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <button className="btn-ghost -ml-2 p-2 md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Users size={18} /></span>
          <span className="hidden sm:inline">HackMate</span>
        </Link>

        <div className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
          <div className="relative" ref={menuRef}>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <Avatar user={user} size="sm" />
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:inline">{user?.name}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg" role="menu">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
                  <User size={16} /> My profile
                </Link>
                {isAdmin && (
                  <Link to="/admin/hackathons" onClick={closeMenu} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
                    <Shield size={16} /> Admin panel
                  </Link>
                )}
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem">
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMobileOpen(false)} className={(s) => `block ${linkClass(s)}`}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
