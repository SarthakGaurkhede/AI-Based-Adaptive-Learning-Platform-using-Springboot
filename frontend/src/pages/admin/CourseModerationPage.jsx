import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const CourseModerationPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['admin-courses-moderation'],
    queryFn: () => api.get('/admin/courses/moderation').then(r => r.data)
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      status
    }) => api.patch(`/courses/${id}`, {
      status
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['admin-courses-moderation']
    })
  });
  const courses = (data?.data || []).filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));
  const levelBadge = {
    beginner: 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300',
    intermediate: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300',
    advanced: 'bg-error/10 text-error'
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Course Moderation</h1>
          <p className="text-on-surface-variant text-sm mt-1">{courses.length} published courses</p>
        </div>
      </motion.div>

      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container">
              <tr>
                {['Course', 'Teacher', 'Level', 'Students', 'Rating', 'Created', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container rounded w-20" /></td>)}
                  </tr>) : courses.length === 0 ? <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">No courses found</td>
                </tr> : courses.map(c => <tr key={c._id} className="hover:bg-surface-container transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-base">school</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-on-surface text-sm truncate max-w-40">{c.title}</p>
                        <p className="text-xs text-on-surface-variant capitalize">{c.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-on-surface">{c.teacherId?.name || 'Unknown'}</p>
                    <p className="text-xs text-on-surface-variant">{c.teacherId?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${levelBadge[c.level] || ''}`}>
                      {c.level}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-on-surface">{c.enrollmentCount || 0}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-sm text-on-surface">
                      <span className="material-symbols-outlined text-yellow-400 text-base" style={{
                    fontVariationSettings: "'FILL' 1"
                  }}>star</span>
                      {c.rating || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateMut.mutate({
                    id: c._id,
                    status: 'archived'
                  })} disabled={updateMut.isPending} className="text-xs font-medium text-error hover:underline disabled:opacity-50">
                        Archive
                      </button>
                      <span className="text-outline-variant">·</span>
                      <button className="text-xs font-medium text-primary hover:underline">View</button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>;
};
export default CourseModerationPage;