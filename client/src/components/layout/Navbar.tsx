import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Kanban, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { useLogoutApiMutation } from '../../store/services/apiSlice';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutApiMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Kanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="block text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
                  Management
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-zinc-800/80 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                Task Board
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-zinc-800/80 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <User className="w-4 h-4 text-violet-400" />
                Profile
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-zinc-200 leading-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate max-w-[130px]">
                  {user?.email}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/')
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Task Board
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/profile')
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <User className="w-4 h-4 text-violet-400" />
            Profile ({user?.name})
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};
