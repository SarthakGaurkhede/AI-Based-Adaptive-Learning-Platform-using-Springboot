import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const StudentRankingsPage = () => {
  const [view, setView] = useState('global');
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['teacher-leaderboard', view],
    queryFn: () => api.get(`/gamification/leaderboard?scope=${view}&limit=30`).then(r => r.data)
  });
  const board = data?.data || [];
  const medalColors = ['text-yellow-400', 'text-slate-400', 'text-amber-600'];
  const medalIcons = ['emoji_events', 'workspace_premium', 'military_tech'];
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Student Rankings</h1>
        <p className="text-on-surface-variant text-sm mt-1">Monitor student performance and engagement</p>
      </motion.div>

      {/* View tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 max-w-sm">
        {['global', 'weekly', 'monthly'].map(v => <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all
              ${view === v ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {v}
          </button>)}
      </div>

      {/* Leaderboard */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h2 className="font-semibold text-on-surface capitalize">{view} Rankings</h2>
          <button className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <span className="material-symbols-outlined text-sm">download</span>Export
          </button>
        </div>

        <div className="divide-y divide-black/5">
          {isLoading ? [...Array(8)].map((_, i) => <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-container" />
                <div className="flex-1 h-4 bg-surface-container rounded" />
                <div className="w-20 h-4 bg-surface-container rounded" />
              </div>) : board.map((s, i) => <motion.div key={s.userId || i} initial={{
          opacity: 0,
          x: -8
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: i * 0.03
        }} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container transition-colors">
              <div className="w-8 text-center shrink-0">
                {i < 3 ? <span className={`material-symbols-outlined ${medalColors[i]} text-xl`} style={{
              fontVariationSettings: "'FILL' 1"
            }}>
                    {medalIcons[i]}
                  </span> : <span className="text-sm font-bold text-on-surface-variant">#{i + 1}</span>}
              </div>
              <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                {s.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface text-sm truncate">{s.name}</p>
                <p className="text-xs text-on-surface-variant">Level {s.level} · {s.streak || 0}🔥 streak</p>
              </div>
              <div className="text-center shrink-0">
                <p className="font-bold text-on-surface text-sm">{s.knowledgeScore || 0}</p>
                <p className="text-[10px] text-on-surface-variant">Knowledge</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-primary text-sm">{(s.xp || 0).toLocaleString()}</p>
                <p className="text-[10px] text-on-surface-variant">XP</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors" title="Send congratulations">
                  <span className="material-symbols-outlined text-base">celebration</span>
                </button>
                <button className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors" title="View gap report">
                  <span className="material-symbols-outlined text-base">analytics</span>
                </button>
              </div>
            </motion.div>)}
        </div>
      </motion.div>
    </div>;
};
export default StudentRankingsPage;