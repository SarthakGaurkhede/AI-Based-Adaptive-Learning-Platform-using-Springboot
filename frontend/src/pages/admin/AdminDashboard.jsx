import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const fadeUp = (delay = 0) => ({
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.4,
    delay,
    ease: [0.22, 1, 0.36, 1]
  }
});
const AdminDashboard = () => {
  const {
    data: platformData
  } = useQuery({
    queryKey: ['admin-platform'],
    queryFn: () => api.get('/admin/analytics/platform').then(r => r.data)
  });
  const {
    data: costData
  } = useQuery({
    queryKey: ['admin-ai-cost'],
    queryFn: () => api.get('/admin/ai-cost?period=7d').then(r => r.data)
  });
  const {
    data: securityData
  } = useQuery({
    queryKey: ['admin-security'],
    queryFn: () => api.get('/admin/security/events').then(r => r.data)
  });
  const {
    data: auditData
  } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.get('/admin/audit-logs?limit=5').then(r => r.data)
  });
  const platform = platformData?.data || {};
  const cost = costData?.data || {};
  const security = securityData?.data || [];
  const audits = auditData?.data || [];
  const statCards = [{
    icon: 'group',
    label: 'Total Users',
    value: platform.totalUsers || 0,
    color: 'text-primary',
    bg: 'bg-primary/10'
  }, {
    icon: 'school',
    label: 'Active Students',
    value: platform.totalStudents || 0,
    color: 'text-secondary',
    bg: 'bg-secondary/10'
  }, {
    icon: 'library_books',
    label: 'Published Courses',
    value: platform.totalCourses || 0,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-400/10'
  }, {
    icon: 'warning',
    label: 'Suspended Accounts',
    value: platform.suspendedUsers || 0,
    color: 'text-error',
    bg: 'bg-error/10'
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div {...fadeUp()} className="relative overflow-hidden rounded-2xl primary-gradient p-6 md:p-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium">Admin Control Center</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Platform Overview</h1>
          <p className="text-white/70 text-sm mt-1">Monitor health, costs, security, and activity</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => <motion.div key={s.label} {...fadeUp(i * 0.05)} className="glass-card rounded-2xl p-5 border border-black/5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          </motion.div>)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Cost widget */}
        <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              <h2 className="font-semibold text-on-surface">AI Cost (7d)</h2>
            </div>
            <Link to="/admin/ai-usage" className="text-primary text-xs font-medium hover:underline">Details</Link>
          </div>
          <div className="p-5 space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-on-surface">${(cost.totalCost || 0).toFixed(4)}</p>
              <p className="text-xs text-on-surface-variant mt-1">{cost.callCount || 0} API calls · 7 days</p>
            </div>
            <div className="space-y-2">
              {Object.entries(cost.byModule || {}).slice(0, 4).map(([mod, c]) => <div key={mod} className="flex items-center gap-3">
                  <p className="text-xs text-on-surface-variant capitalize flex-1">{mod}</p>
                  <p className="text-xs font-medium text-on-surface">${c.toFixed(4)}</p>
                </div>)}
            </div>
          </div>
        </motion.div>

        {/* Security widget */}
        <motion.div {...fadeUp(0.12)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">security</span>
              <h2 className="font-semibold text-on-surface">Security Events</h2>
            </div>
            <Link to="/admin/security" className="text-primary text-xs font-medium hover:underline">View all</Link>
          </div>
          <div className="p-5 space-y-3">
            {security.length === 0 ? <div className="py-6 text-center">
                <span className="material-symbols-outlined text-3xl text-green-400 block mb-1">shield</span>
                <p className="text-sm text-on-surface-variant">No blocked prompts recently</p>
              </div> : security.slice(0, 4).map(ev => <div key={ev._id} className="flex items-center gap-3 p-3 rounded-xl bg-error/5">
                <span className="material-symbols-outlined text-error text-lg">block</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-on-surface truncate">{ev.userId?.name || 'Unknown user'}</p>
                  <p className="text-[10px] text-on-surface-variant">{ev.module} · {new Date(ev.createdAt).toLocaleDateString()}</p>
                </div>
              </div>)}
          </div>
        </motion.div>

        {/* Audit log widget */}
        <motion.div {...fadeUp(0.14)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              <h2 className="font-semibold text-on-surface">Recent Actions</h2>
            </div>
            <Link to="/admin/audit-logs" className="text-primary text-xs font-medium hover:underline">All logs</Link>
          </div>
          <div className="divide-y divide-black/5">
            {audits.length === 0 ? <p className="p-5 text-sm text-center text-on-surface-variant">No recent actions</p> : audits.map(log => <div key={log._id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-xs font-bold text-on-surface-variant">
                  {log.actorId?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{log.action}</p>
                  <p className="text-[10px] text-on-surface-variant">{log.actorId?.name} · {new Date(log.createdAt).toLocaleDateString()}</p>
                </div>
              </div>)}
          </div>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div {...fadeUp(0.18)}>
        <h2 className="font-semibold text-on-surface mb-4">Admin Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{
          label: 'User Management',
          icon: 'manage_accounts',
          path: '/admin/users',
          color: 'from-primary to-secondary'
        }, {
          label: 'Audit Logs',
          icon: 'history',
          path: '/admin/audit-logs',
          color: 'from-secondary to-purple-500'
        }, {
          label: 'AI Cost',
          icon: 'payments',
          path: '/admin/ai-usage',
          color: 'from-green-400 to-teal-500'
        }, {
          label: 'Security',
          icon: 'security',
          path: '/admin/security',
          color: 'from-orange-400 to-red-500'
        }].map(a => <Link key={a.label} to={a.path} className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${a.color} text-white shadow-lg hover:-translate-y-0.5 transition-all active:scale-95`}>
              <span className="material-symbols-outlined text-2xl">{a.icon}</span>
              <span className="font-medium text-sm text-center">{a.label}</span>
            </Link>)}
        </div>
      </motion.div>
    </div>;
};
export default AdminDashboard;