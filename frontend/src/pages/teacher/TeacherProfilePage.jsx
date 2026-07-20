import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const TeacherProfilePage = () => {
  const {
    user
  } = useAuth();
  const {
    data: analyticsData
  } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => api.get('/analytics/me').then(r => r.data)
  });
  const {
    data: coursesData
  } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get('/courses?mine=true').then(r => r.data)
  });
  const stats = analyticsData?.data || {};
  const courses = coursesData?.data || [];
  const published = courses.filter(c => c.status === 'published');
  return <div className="max-w-3xl mx-auto">
      {/* Header banner */}
      <div className="relative h-40 bg-gradient-to-br from-primary via-secondary to-purple-600 overflow-hidden rounded-b-none">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => <div key={i} className="absolute w-24 h-24 rounded-full border border-white/40" style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`
        }} />)}
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pb-8">
        {/* Avatar row */}
        <div className="flex items-end gap-4 -mt-10 mb-6">
          <motion.div initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} className="w-20 h-20 rounded-2xl primary-gradient flex items-center justify-center text-white text-3xl font-black border-4 border-surface shadow-xl shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </motion.div>
          <div className="mb-2">
            <h1 className="text-xl font-bold text-on-surface">{user?.name}</h1>
            <p className="text-on-surface-variant text-sm capitalize flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">person_book</span>
              {user?.role} · {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{
            label: 'Courses Published',
            value: published.length,
            icon: 'library_books',
            color: 'text-primary'
          }, {
            label: 'Total Students',
            value: stats.totalStudents || 0,
            icon: 'group',
            color: 'text-secondary'
          }, {
            label: 'Avg Rating',
            value: `${(stats.avgRating || 0).toFixed(1)}★`,
            icon: 'star',
            color: 'text-yellow-500'
          }, {
            label: 'Open Gaps',
            value: stats.totalGaps || 0,
            icon: 'psychology_alt',
            color: 'text-error'
          }].map((s, i) => <motion.div key={s.label} initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: i * 0.06
          }} className="glass-card rounded-2xl p-4 border border-black/5 text-center">
                <span className={`material-symbols-outlined text-2xl ${s.color} block mb-1`}>{s.icon}</span>
                <p className="text-xl font-bold text-on-surface">{s.value}</p>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
              </motion.div>)}
          </div>

          {/* Published courses */}
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.15
        }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
            <div className="p-5 border-b border-black/5">
              <h2 className="font-semibold text-on-surface">Published Courses</h2>
            </div>
            <div className="divide-y divide-black/5">
              {published.length === 0 ? <p className="p-5 text-sm text-center text-on-surface-variant">No published courses yet</p> : published.map(c => <div key={c._id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container transition-colors">
                  <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-base">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">{c.title}</p>
                    <p className="text-xs text-on-surface-variant">{c.enrollmentCount || 0} students · {c.level}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-yellow-400 text-sm" style={{
                  fontVariationSettings: "'FILL' 1"
                }}>star</span>
                    <span className="text-xs font-medium text-on-surface">{c.rating || 'New'}</span>
                  </div>
                </div>)}
            </div>
          </motion.div>

          {/* About section */}
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="glass-card rounded-2xl border border-black/5 p-5">
            <h2 className="font-semibold text-on-surface mb-3">About</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {user?.name} is a certified instructor on Knowledge Guru with expertise in creating adaptive learning content.
              Their courses are designed to close knowledge gaps and build deep understanding through AI-powered assessments.
            </p>
          </motion.div>
        </div>
      </div>
    </div>;
};
export default TeacherProfilePage;