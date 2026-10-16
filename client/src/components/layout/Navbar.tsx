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
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm shadow-pink-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-pink-400/30 group-hover:scale-105 transition-transform">
                <Kanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="block text-[10px] text-pink-400 font-medium tracking-wider uppercase">
                  Management
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-pink-50 text-pink-700 shadow-sm border border-pink-200'
                    : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-pink-400" />
                Task Board
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-pink-50 text-pink-700 shadow-sm border border-pink-200'
                    : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50/60'
                }`}
              >
                <User className="w-4 h-4 text-fuchsia-400" />
                Profile
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-pink-50 border border-pink-200 hover:border-pink-300 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-pink-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-fuchsia-500 text-white font-semibold text-xs flex items-center justify-center">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700 leading-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] text-pink-400 truncate max-w-[130px]">
                  {user?.email}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50"
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
        <div className="md:hidden border-b border-pink-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/')
                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                : 'text-slate-500 hover:bg-pink-50/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-pink-400" />
            Task Board
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/profile')
                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                : 'text-slate-500 hover:bg-pink-50/60'
            }`}
          >
            <User className="w-4 h-4 text-fuchsia-400" />
            Profile ({user?.name})
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};
