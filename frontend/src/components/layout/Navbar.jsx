import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import banner from '../../images/banner.png';
const Navbar = ({
  variant = 'landing'
}) => {
  const {
    isAuthenticated,
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'teacher') return '/teacher/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };
  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'teacher') return '/teacher/profile';
    if (user.role === 'admin') return '/admin/settings';
    return '/student/profile';
  };
  return <header className="sticky top-0 w-full z-50 nav-glass border-b border-black/5">
      <nav className="max-w-container-max mx-auto px-4 py-4 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-headline-md font-bold text-primary"><img className="h-full w-40 object-contain" src={banner} alt="Knowledge Guru" /></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {variant === 'landing' && !isAuthenticated && <>
              <Link to="/features" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">Features</Link>
              <Link to="/pricing" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">Pricing</Link>
              <Link to="/about" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">About</Link>
            </>}
          <ThemeToggle />
          {isAuthenticated ? <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-container transition-colors">
                <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-label-md text-on-surface hidden lg:block">{user?.name}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
              </button>
              <AnimatePresence>
                {profileOpen && <motion.div initial={{
              opacity: 0,
              y: 8,
              scale: 0.95
            }} animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }} exit={{
              opacity: 0,
              y: 8,
              scale: 0.95
            }} transition={{
              duration: 0.15
            }} className="absolute right-0 top-12 w-52 glass-card rounded-2xl p-2 shadow-glass-lg border border-outline-variant/30">
                    <Link to={getDashboardPath()} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-primary text-xl">dashboard</span>
                      Dashboard
                    </Link>
                    <Link to={getProfilePath()} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                      Profile
                    </Link>
                    <div className="border-t border-outline-variant/30 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/10 transition-colors text-label-md text-error">
                      <span className="material-symbols-outlined text-xl">logout</span>
                      Sign Out
                    </button>
                  </motion.div>}
              </AnimatePresence>
            </div> : <div className="flex items-center gap-3">
              <Link to="/login" className="text-label-md text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link to="/register" className="primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-label-md font-medium shadow-primary/20 shadow-sm hover:opacity-90 transition-opacity active:scale-95">
                Get Started
              </Link>
            </div>}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface">
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="overflow-hidden border-t border-black/5 md:hidden">
            <div className="px-4 py-4 space-y-2 bg-surface">
              {!isAuthenticated ? <>
                  <Link to="/features" className="block px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface text-label-md">Features</Link>
                  <Link to="/pricing" className="block px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface text-label-md">Pricing</Link>
                  <Link to="/login" className="block px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface text-label-md">Sign In</Link>
                  <Link to="/register" className="block px-4 py-3 rounded-xl primary-gradient text-center text-on-primary font-medium">Get Started</Link>
                </> : <>
                  <Link to={getDashboardPath()} className="block px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface text-label-md">Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl hover:bg-error/10 text-error text-label-md">Sign Out</button>
                </>}
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
};
export default Navbar;