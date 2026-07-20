import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const CourseManagementPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['teacher-courses-manage'],
    queryFn: () => api.get('/courses?mine=true').then(r => r.data)
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      updates
    }) => api.patch(`/courses/${id}`, updates),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['teacher-courses-manage']
    })
  });
  const courses = (data?.data || []).filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));
  const statusColors = {
    published: 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300',
    draft: 'bg-surface-container text-on-surface-variant',
    archived: 'bg-error/10 text-error'
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
          <h1 className="text-2xl font-bold text-on-surface">Course Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">{courses.length} courses</p>
        </div>
        <Link to="/teacher/create-course" className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-lg">add</span>New Course
        </Link>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      {/* Course table */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container">
              <tr>
                {['Course', 'Status', 'Visibility', 'Students', 'Rating', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container rounded w-20" /></td>)}
                  </tr>) : courses.length === 0 ? <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                    No courses found. <Link to="/teacher/create-course" className="text-primary hover:underline">Create one</Link>
                  </td>
                </tr> : courses.map(c => <tr key={c._id} className="hover:bg-surface-container transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-base">school</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-on-surface text-sm truncate max-w-48">{c.title}</p>
                        <p className="text-xs text-on-surface-variant capitalize">{c.level} · {c.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${c.visibility === 'public' ? 'text-green-600 dark:text-green-400' : 'text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-sm">{c.visibility === 'public' ? 'public' : 'lock'}</span>
                      {c.visibility}
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
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {c.status === 'draft' && <button onClick={() => updateMut.mutate({
                    id: c._id,
                    updates: {
                      status: 'published'
                    }
                  })} className="text-xs font-medium text-green-600 hover:underline dark:text-green-400">Publish</button>}
                      {c.status === 'published' && <button onClick={() => updateMut.mutate({
                    id: c._id,
                    updates: {
                      status: 'archived'
                    }
                  })} className="text-xs font-medium text-on-surface-variant hover:text-error hover:underline">Archive</button>}
                      <Link to={`/teacher/courses/${c._id}`} className="text-xs font-medium text-primary hover:underline">Edit</Link>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>;
};
export default CourseManagementPage;