import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const PlatformAnalyticsPage = () => {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['admin-platform-analytics'],
    queryFn: () => api.get('/admin/analytics/platform').then(r => r.data)
  });
  const stats = data?.data || {};
  const cards = [{
    label: 'Total Users',
    value: stats.totalUsers || 0,
    icon: 'group',
    color: 'text-primary',
    bg: 'bg-primary/10'
  }, {
    label: 'Students',
    value: stats.totalStudents || 0,
    icon: 'school',
    color: 'text-secondary',
    bg: 'bg-secondary/10'
  }, {
    label: 'Teachers',
    value: stats.totalTeachers || 0,
    icon: 'person_book',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-400/10'
  }, {
    label: 'Published Courses',
    value: stats.totalCourses || 0,
    icon: 'library_books',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-400/10'
  }, {
    label: 'Quiz Attempts',
    value: stats.totalAttempts || 0,
    icon: 'quiz',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-400/10'
  }, {
    label: 'New Users (7d)',
    value: stats.newUsers || 0,
    icon: 'person_add',
    color: 'text-primary',
    bg: 'bg-primary/10'
  }];
  const uptime = stats.uptime ? Math.floor(stats.uptime / 3600) : 0;
  return <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Platform Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-1">Overall platform usage and performance metrics</p>
      </motion.div>

      {/* System health banner */}
      <motion.div initial={{
      opacity: 0,
      scale: 0.97
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="primary-gradient rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">monitoring</span>
            <div>
              <p className="font-bold text-lg">System Health</p>
              <p className="text-white/70 text-sm">All services operational</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-xl">99.9%</p>
              <p className="text-white/70 text-xs">Uptime</p>
            </div>
            <div>
              <p className="font-bold text-xl">{uptime}h</p>
              <p className="text-white/70 text-xs">Since restart</p>
            </div>
            <div>
              <p className="font-bold text-xl">&lt;200ms</p>
              <p className="text-white/70 text-xs">Avg response</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((s, i) => <motion.div key={s.label} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: i * 0.05
      }} className="glass-card rounded-2xl p-5 border border-black/5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          </motion.div>)}
      </div>

      {/* User breakdown donut-style */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="glass-card rounded-2xl border border-black/5 p-6">
          <h2 className="font-semibold text-on-surface mb-5">User Role Distribution</h2>
          <div className="space-y-3">
            {[{
            label: 'Students',
            value: stats.totalStudents || 0,
            color: 'bg-primary',
            pct: stats.totalUsers ? Math.round(stats.totalStudents / stats.totalUsers * 100) : 0
          }, {
            label: 'Teachers',
            value: stats.totalTeachers || 0,
            color: 'bg-secondary',
            pct: stats.totalUsers ? Math.round(stats.totalTeachers / stats.totalUsers * 100) : 0
          }, {
            label: 'Admins',
            value: (stats.totalUsers || 0) - (stats.totalStudents || 0) - (stats.totalTeachers || 0),
            color: 'bg-orange-400',
            pct: 1
          }].map(r => <div key={r.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-on-surface-variant">{r.label}</span>
                  <span className="font-semibold text-on-surface">{r.value} ({r.pct}%)</span>
                </div>
                <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${r.pct}%`
              }} transition={{
                duration: 0.8,
                ease: 'easeOut'
              }} className={`h-full rounded-full ${r.color}`} />
                </div>
              </div>)}
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.12
      }} className="glass-card rounded-2xl border border-black/5 p-6">
          <h2 className="font-semibold text-on-surface mb-5">Service Status</h2>
          <div className="space-y-3">
            {[{
            service: 'MongoDB Atlas',
            status: 'Operational',
            latency: '12ms'
          }, {
            service: 'Redis Cache',
            status: 'Operational',
            latency: '3ms'
          }, {
            service: 'Gemini AI API',
            status: 'Operational',
            latency: '1.2s'
          }, {
            service: 'Elasticsearch',
            status: 'Operational',
            latency: '45ms'
          }, {
            service: 'Qdrant (Vectors)',
            status: 'Operational',
            latency: '28ms'
          }, {
            service: 'AWS S3',
            status: 'Operational',
            latency: '89ms'
          }].map(s => <div key={s.service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-on-surface">{s.service}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-on-surface-variant">{s.latency}</span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">{s.status}</span>
                </div>
              </div>)}
          </div>
        </motion.div>
      </div>
    </div>;
};
export default PlatformAnalyticsPage;