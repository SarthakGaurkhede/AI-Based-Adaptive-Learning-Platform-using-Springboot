import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const ProgressAnalyticsPage = () => {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['student-analytics-full'],
    queryFn: () => api.get('/analytics/me').then(r => r.data)
  });
  const stats = data?.data || {};
  const scoreHistory = stats.scoreHistory || [];
  const maxScore = Math.max(...scoreHistory.map(s => s.score), 100);
  const statCards = [{
    label: 'Quizzes Attempted',
    value: stats.quizzesAttempted || 0,
    icon: 'quiz',
    color: 'text-primary'
  }, {
    label: 'Quizzes Passed',
    value: stats.quizzesPassed || 0,
    icon: 'check_circle',
    color: 'text-green-500'
  }, {
    label: 'Avg Quiz Score',
    value: `${stats.avgQuizScore || 0}%`,
    icon: 'bar_chart',
    color: 'text-secondary'
  }, {
    label: 'Study Hours',
    value: `${stats.studyHours || 0}h`,
    icon: 'schedule',
    color: 'text-orange-500'
  }, {
    label: 'Open Gaps',
    value: stats.openGaps || 0,
    icon: 'psychology_alt',
    color: 'text-error'
  }, {
    label: 'Resolved Gaps',
    value: stats.resolvedGaps || 0,
    icon: 'task_alt',
    color: 'text-green-500'
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Progress Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-1">Track your learning performance over time</p>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((s, i) => <motion.div key={s.label} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: i * 0.05
      }} className="glass-card rounded-2xl p-5 border border-black/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          </motion.div>)}
      </div>

      {/* Score history chart */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="glass-card rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold text-on-surface mb-5">Quiz Score History</h2>
        {isLoading ? <div className="h-40 animate-pulse bg-surface-container rounded-xl" /> : scoreHistory.length === 0 ? <div className="h-40 flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl block mb-2">bar_chart</span>
              <p className="text-sm">No quiz history yet</p>
            </div>
          </div> : <div className="flex items-end gap-2 h-40">
            {scoreHistory.map((s, i) => <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">{s.score}%</span>
                <motion.div initial={{
            height: 0
          }} animate={{
            height: `${s.score / maxScore * 100}%`
          }} transition={{
            duration: 0.6,
            delay: i * 0.08
          }} className="w-full primary-gradient rounded-t-lg min-h-[4px] cursor-pointer" style={{
            maxHeight: '100%'
          }} />
                <span className="text-[10px] text-on-surface-variant">
                  {s.date ? new Date(s.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            }) : `Q${i + 1}`}
                </span>
              </div>)}
          </div>}
      </motion.div>

      {/* Knowledge Score vs XP */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.15
      }} className="glass-card rounded-2xl border border-black/5 p-5">
          <h2 className="font-semibold text-on-surface mb-4">Knowledge Score</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-container" />
                <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#4648d4" strokeWidth="6" strokeLinecap="round" initial={{
                strokeDasharray: '213.6',
                strokeDashoffset: '213.6'
              }} animate={{
                strokeDashoffset: `${213.6 - (stats.knowledgeScore || 0) / 100 * 213.6}`
              }} transition={{
                duration: 1,
                delay: 0.3
              }} style={{
                strokeDasharray: '213.6'
              }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-on-surface">{stats.knowledgeScore || 0}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-on-surface-variant">Based on quiz performance and resolved knowledge gaps</p>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-green-400" />Improving since last week
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.18
      }} className="glass-card rounded-2xl border border-black/5 p-5">
          <h2 className="font-semibold text-on-surface mb-4">Knowledge Gaps Status</h2>
          <div className="space-y-3">
            {[{
            label: 'Open',
            value: stats.openGaps || 0,
            color: 'bg-error'
          }, {
            label: 'Improving',
            value: 0,
            color: 'bg-yellow-400'
          }, {
            label: 'Resolved',
            value: stats.resolvedGaps || 0,
            color: 'bg-green-400'
          }].map(g => {
            const total = (stats.openGaps || 0) + (stats.resolvedGaps || 0) + 1;
            const pct = Math.round(g.value / total * 100);
            return <div key={g.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{g.label}</span>
                    <span className="font-medium text-on-surface">{g.value}</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${pct}%`
                }} transition={{
                  duration: 0.8
                }} className={`h-full rounded-full ${g.color}`} />
                  </div>
                </div>;
          })}
          </div>
        </motion.div>
      </div>
    </div>;
};
export default ProgressAnalyticsPage;