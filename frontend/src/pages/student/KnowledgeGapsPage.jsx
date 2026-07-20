import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const severityConfig = {
  high: {
    label: 'High',
    color: 'text-error',
    bg: 'bg-error/10',
    bar: 'bg-error'
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600 dark:text-yellow-300',
    bg: 'bg-yellow-50 dark:bg-yellow-400/10',
    bar: 'bg-yellow-400'
  },
  low: {
    label: 'Low',
    color: 'text-blue-600 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-400/10',
    bar: 'bg-blue-400'
  }
};
const KnowledgeGapsPage = () => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('priority');
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['knowledge-gaps'],
    queryFn: () => api.get('/knowledge-gaps').then(r => r.data)
  });
  const resolveMut = useMutation({
    mutationFn: id => api.patch(`/knowledge-gaps/${id}/resolve`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['knowledge-gaps']
    })
  });
  const gaps = data?.data || [];
  const filtered = gaps.filter(g => filter === 'all' || g.severity === filter).sort((a, b) => sort === 'priority' ? b.priorityScore - a.priorityScore : 0);
  const counts = {
    high: gaps.filter(g => g.severity === 'high').length,
    medium: gaps.filter(g => g.severity === 'medium').length,
    low: gaps.filter(g => g.severity === 'low').length
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Knowledge Gap Analysis</h1>
          <p className="text-on-surface-variant text-sm mt-1">AI-detected weak areas ranked by improvement priority</p>
        </div>
        <Link to="/student/study-plan" className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-lg">auto_awesome</span>
          Generate Study Plan
        </Link>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {['high', 'medium', 'low'].map(s => {
        const cfg = severityConfig[s];
        return <motion.div key={s} initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.05
        }} onClick={() => setFilter(filter === s ? 'all' : s)} className={`glass-card rounded-2xl p-4 border border-black/5 cursor-pointer transition-all
                ${filter === s ? 'ring-2 ring-primary' : 'hover:shadow-glass-lg'}`}>
              <p className={`text-2xl font-bold ${cfg.color}`}>{counts[s]}</p>
              <p className="text-xs text-on-surface-variant mt-1">{cfg.label} Priority</p>
              <div className={`mt-2 h-1 rounded-full ${cfg.bar} opacity-40`} style={{
            width: `${counts[s] / Math.max(gaps.length, 1) * 100}%`
          }} />
            </motion.div>;
      })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 bg-surface-container rounded-xl p-1">
          {['all', 'high', 'medium', 'low'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === f ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {f === 'all' ? 'All' : severityConfig[f].label}
            </button>)}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="ml-auto text-xs border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest dark:bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="priority">Sort by Priority</option>
          <option value="severity">Sort by Severity</option>
        </select>
      </div>

      {/* Gap list */}
      <div className="space-y-4">
        {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 border border-black/5 animate-pulse">
              <div className="h-4 bg-surface-container rounded w-48 mb-3" />
              <div className="h-2 bg-surface-container rounded w-full" />
            </div>) : filtered.length === 0 ? <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-green-400 block mb-3">check_circle</span>
            <p className="font-semibold text-on-surface">No gaps found for this filter</p>
            <p className="text-on-surface-variant text-sm mt-1">Keep learning and taking quizzes to get personalized insights.</p>
          </div> : filtered.map((gap, i) => {
        const cfg = severityConfig[gap.severity] || severityConfig.low;
        const mastery = gap.confidenceScore ?? 50;
        return <motion.div key={gap._id} initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: i * 0.05
        }} className="glass-card rounded-2xl p-5 border border-black/5 hover:shadow-glass-lg transition-all">
              <div className="flex items-start gap-4">
                {/* Priority badge */}
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="font-bold text-on-surface-variant text-sm">#{i + 1}</span>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-on-surface">{gap.topicId?.title || 'Unknown Topic'}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">{gap.courseId?.title} · Detected {new Date(gap.detectedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Mastery bar */}
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Current Mastery</span>
                      <span className="font-medium">{mastery}%</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: `${mastery}%`
                  }} transition={{
                    duration: 0.8,
                    delay: 0.2 + i * 0.05
                  }} className={`h-full rounded-full ${cfg.bar}`} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link to={`/student/ai-tutor?topic=${gap.topicId?._id}`} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                      <span className="material-symbols-outlined text-sm">smart_toy</span> Ask AI Tutor
                    </Link>
                    <Link to={`/student/flashcards?topic=${gap.topicId?._id}`} className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline">
                      <span className="material-symbols-outlined text-sm">style</span> Practice Flashcards
                    </Link>
                    <Link to={`/student/courses/${gap.courseId?._id}`} className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:underline">
                      Review Topic <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                    <button onClick={() => resolveMut.mutate(gap._id)} disabled={resolveMut.isPending} className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:underline ml-auto disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">check_circle</span> Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>;
      })}
      </div>
    </div>;
};
export default KnowledgeGapsPage;