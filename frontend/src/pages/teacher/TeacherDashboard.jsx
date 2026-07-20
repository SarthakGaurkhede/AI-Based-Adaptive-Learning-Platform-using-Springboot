import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
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
const TeacherDashboard = () => {
  const {
    user
  } = useAuth();
  const {
    data: courses
  } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get('/courses?mine=true').then(r => r.data)
  });
  const {
    data: analytics
  } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => api.get('/users/me/analytics').then(r => r.data)
  });
  const myCourses = courses?.data || [];
  const stats = analytics?.data || {};
  const quickActions = [{
    label: 'Create Course with AI',
    icon: 'auto_awesome',
    path: '/teacher/create-course',
    color: 'primary-gradient text-white',
    shadow: 'shadow-primary/20'
  }, {
    label: 'Generate Quiz with AI',
    icon: 'quiz',
    path: '/teacher/quiz-builder',
    color: 'bg-secondary text-white',
    shadow: 'shadow-secondary/20'
  }, {
    label: 'View Student Rankings',
    icon: 'leaderboard',
    path: '/teacher/rankings',
    color: 'bg-surface-container text-on-surface',
    shadow: ''
  }, {
    label: 'Gap Analytics',
    icon: 'troubleshoot',
    path: '/teacher/reports',
    color: 'bg-surface-container text-on-surface',
    shadow: ''
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div {...fadeUp()} className="relative overflow-hidden rounded-2xl primary-gradient p-6 md:p-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-white/70 text-sm font-medium">Teacher Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-white/70 text-sm">Manage your courses and track student progress</p>
          </div>
          <div className="flex gap-3">
            <Link to="/teacher/create-course" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium backdrop-blur-sm">
              <span className="material-symbols-outlined text-lg">add</span> New Course
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{
        icon: 'group',
        label: 'Total Students',
        value: stats.totalStudents || 0,
        color: 'text-primary'
      }, {
        icon: 'library_books',
        label: 'Active Courses',
        value: myCourses.length,
        color: 'text-secondary'
      }, {
        icon: 'bar_chart',
        label: 'Avg Performance',
        value: `${stats.avgPerformance || 0}%`,
        color: 'text-green-500'
      }, {
        icon: 'psychology_alt',
        label: 'Open Gaps',
        value: stats.totalGaps || 0,
        color: 'text-error'
      }].map((s, i) => <motion.div key={s.label} {...fadeUp(i * 0.05)} className="glass-card rounded-2xl p-5 border border-black/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          </motion.div>)}
      </div>

      {/* Quick Actions */}
      <motion.div {...fadeUp(0.1)}>
        <h2 className="font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(a => <Link key={a.label} to={a.path} className={`flex flex-col items-center gap-3 p-5 rounded-2xl ${a.color} shadow-lg ${a.shadow} hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 border border-black/5`}>
              <span className="material-symbols-outlined text-2xl">{a.icon}</span>
              <span className="font-medium text-sm text-center leading-snug">{a.label}</span>
            </Link>)}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* My Courses */}
        <motion.div {...fadeUp(0.12)} className="lg:col-span-3 glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <h2 className="font-semibold text-on-surface">My Courses</h2>
            <Link to="/teacher/courses" className="text-primary text-xs font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-black/5">
            {myCourses.length === 0 ? <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl block mb-2">library_books</span>
                <p className="text-sm">No courses yet. Create your first course!</p>
              </div> : myCourses.slice(0, 5).map(c => <div key={c._id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-lg">school</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{c.title}</p>
                  <p className="text-xs text-on-surface-variant">{c.enrollmentCount || 0} students · {c.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === 'published' ? 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300' : 'bg-surface-container text-on-surface-variant'}`}>
                    {c.status}
                  </span>
                  <Link to={`/teacher/courses/${c._id}`} className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                </div>
              </div>)}
          </div>
        </motion.div>

        {/* AI Gap Reports */}
        <motion.div {...fadeUp(0.16)} className="lg:col-span-2 glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">psychology_alt</span>
              <h2 className="font-semibold text-on-surface">Class Gap Report</h2>
            </div>
            <Link to="/teacher/reports" className="text-primary text-xs font-medium hover:underline">Details</Link>
          </div>
          <div className="p-5 space-y-4">
            {[{
            topic: 'Quantum Mechanics',
            students: 12,
            severity: 'high'
          }, {
            topic: 'Backpropagation',
            students: 8,
            severity: 'medium'
          }, {
            topic: 'Linear Algebra',
            students: 5,
            severity: 'medium'
          }, {
            topic: 'Probability Theory',
            students: 3,
            severity: 'low'
          }].map(g => <div key={g.topic} className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full shrink-0 ${g.severity === 'high' ? 'bg-error' : g.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{g.topic}</p>
                  <p className="text-xs text-on-surface-variant">{g.students} students struggling</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                  ${g.severity === 'high' ? 'bg-error/10 text-error' : g.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300'}`}>
                  {g.severity}
                </span>
              </div>)}
          </div>
          <div className="px-5 pb-5">
            <Link to="/teacher/reports" className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-lg">analytics</span> View Full Report
            </Link>
          </div>
        </motion.div>
      </div>
    </div>;
};
export default TeacherDashboard;