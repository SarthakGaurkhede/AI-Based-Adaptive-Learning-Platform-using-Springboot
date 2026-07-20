import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
const studentNav = [{
  label: 'Dashboard',
  icon: 'dashboard',
  path: '/student/dashboard'
}, {
  label: 'My Courses',
  icon: 'school',
  path: '/student/courses'
}, {
  label: 'Knowledge Gaps',
  icon: 'psychology_alt',
  path: '/student/knowledge-gaps'
}, {
  label: 'AI Recommendations',
  icon: 'auto_awesome',
  path: '/student/recommendations'
}, {
  label: 'Study Plans',
  icon: 'calendar_month',
  path: '/student/study-plan'
}, {
  label: 'Flashcards',
  icon: 'style',
  path: '/student/flashcards'
}, {
  label: 'AI Tutor',
  icon: 'smart_toy',
  path: '/student/ai-tutor'
}, {
  label: 'Leaderboards',
  icon: 'emoji_events',
  path: '/student/leaderboards'
}, {
  label: 'Achievements',
  icon: 'workspace_premium',
  path: '/student/achievements'
}, {
  label: 'Analytics',
  icon: 'bar_chart',
  path: '/student/analytics'
}, {
  label: 'Notifications',
  icon: 'notifications',
  path: '/student/notifications'
}, {
  label: 'Profile',
  icon: 'person',
  path: '/student/profile'
}];
const teacherNav = [{
  label: 'Dashboard',
  icon: 'dashboard',
  path: '/teacher/dashboard'
}, {
  label: 'Courses',
  icon: 'library_books',
  path: '/teacher/courses'
}, {
  label: 'AI Course Gen',
  icon: 'auto_awesome',
  path: '/teacher/create-course'
}, {
  label: 'Quiz Builder',
  icon: 'quiz',
  path: '/teacher/quiz-builder'
}, {
  label: 'Student Rankings',
  icon: 'leaderboard',
  path: '/teacher/rankings'
}, {
  label: 'Gap Analytics',
  icon: 'troubleshoot',
  path: '/teacher/reports'
}, {
  label: 'Profile',
  icon: 'person',
  path: '/teacher/profile'
}];
const adminNav = [{
  label: 'Dashboard',
  icon: 'dashboard',
  path: '/admin/dashboard'
}, {
  label: 'Users',
  icon: 'manage_accounts',
  path: '/admin/users'
}, {
  label: 'Courses',
  icon: 'library_books',
  path: '/admin/courses'
}, {
  label: 'Analytics',
  icon: 'analytics',
  path: '/admin/analytics'
}, {
  label: 'AI Cost',
  icon: 'payments',
  path: '/admin/ai-usage'
}, {
  label: 'Security',
  icon: 'security',
  path: '/admin/security'
}, {
  label: 'Audit Logs',
  icon: 'history',
  path: '/admin/audit-logs'
}, {
  label: 'Settings',
  icon: 'settings',
  path: '/admin/settings'
}];
const navByRole = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav
};
const Sidebar = ({
  mobileOpen,
  onClose
}) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const navItems = user ? navByRole[user.role] : [];
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const SidebarContent = () => <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-black/5">
        <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-sm">
          <span className="material-symbols-filled text-white text-lg">school</span>
        </div>
        <span className="font-bold text-primary text-lg">Knowledge Guru</span>
      </div>

      {/* User chip */}
      {user && <div className="mx-3 mt-4 p-3 rounded-xl bg-surface-container flex items-center gap-3">
          <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-label-md font-semibold text-on-surface truncate">{user.name}</p>
            <p className="text-label-sm text-on-surface-variant capitalize">{user.role} · Lvl {user.level}</p>
          </div>
        </div>}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.path} to={item.path} onClick={onClose} className={({
        isActive
      }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-label-md group
               ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
            {({
          isActive
        }) => <>
                <span className={`material-symbols-outlined text-xl transition-all
                  ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`} style={{
            fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
          }}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>}
              </>}
          </NavLink>)}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-black/5 pt-3">
        <ThemeToggle showLabel className="w-full justify-start px-3 py-2.5 rounded-xl" />
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/10 transition-colors text-label-md text-on-surface-variant hover:text-error">
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </button>
      </div>
    </div>;
  return <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 sidebar-bg border-r border-black/5 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={onClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
            <motion.aside initial={{
          x: -280
        }} animate={{
          x: 0
        }} exit={{
          x: -280
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200
        }} className="fixed left-0 top-0 h-full w-72 sidebar-bg z-50 lg:hidden overflow-hidden shadow-xl">
              <SidebarContent />
            </motion.aside>
          </>}
      </AnimatePresence>
    </>;
};
export default Sidebar;