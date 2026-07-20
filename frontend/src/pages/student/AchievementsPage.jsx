import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const families = ['All', 'Learning', 'Quiz', 'Streak', 'AI'];
const familyIcon = {
  learning: 'school',
  quiz: 'quiz',
  streak: 'local_fire_department',
  ai: 'smart_toy'
};
const AchievementsPage = () => {
  const [filter, setFilter] = useState('All');
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get('/gamification/achievements').then(r => r.data)
  });
  const all = data?.data || [];
  const filtered = filter === 'All' ? all : all.filter(a => a.family?.toLowerCase() === filter.toLowerCase());
  const earnedCount = all.filter(a => a.earned).length;
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Achievements</h1>
        <p className="text-on-surface-variant text-sm mt-1">{earnedCount} of {all.length} badges earned</p>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-on-surface">Overall Progress</span>
          <span className="text-primary font-bold">{all.length ? Math.round(earnedCount / all.length * 100) : 0}%</span>
        </div>
        <div className="h-3 bg-surface-container rounded-full overflow-hidden">
          <motion.div initial={{
          width: 0
        }} animate={{
          width: `${all.length ? earnedCount / all.length * 100 : 0}%`
        }} transition={{
          duration: 1,
          delay: 0.2
        }} className="h-full primary-gradient rounded-full" />
        </div>
        <p className="text-xs text-on-surface-variant mt-2">{earnedCount} earned · {all.length - earnedCount} remaining</p>
      </motion.div>

      {/* Family filter */}
      <div className="flex gap-2 flex-wrap">
        {families.map(f => <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === f ? 'primary-gradient text-white shadow-md shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
            {f !== 'All' && <span className="material-symbols-outlined text-base">{familyIcon[f.toLowerCase()]}</span>}
            {f}
          </button>)}
      </div>

      {/* Badge grid */}
      {isLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-36 glass-card rounded-2xl border border-black/5 animate-pulse" />)}
        </div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ach, i) => <motion.div key={ach._id} initial={{
        opacity: 0,
        scale: 0.93
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: i * 0.04
      }} className={`glass-card rounded-2xl border p-5 text-center transition-all
                ${ach.earned ? 'border-primary/20 bg-primary/5 shadow-md shadow-primary/5' : 'border-black/5 opacity-50 grayscale'}`}>
              <div className={`w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-3
                ${ach.earned ? 'primary-gradient shadow-lg shadow-primary/20' : 'bg-surface-container'}`}>
                <span className="material-symbols-outlined text-white text-2xl" style={{
            fontVariationSettings: "'FILL' 1",
            filter: ach.earned ? 'none' : 'grayscale(1)'
          }}>
                  {ach.icon || 'emoji_events'}
                </span>
              </div>
              <p className={`text-sm font-semibold ${ach.earned ? 'text-on-surface' : 'text-on-surface-variant'}`}>{ach.title}</p>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug line-clamp-2">{ach.description}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">bolt</span>
                <span className="text-xs font-semibold text-primary">+{ach.xpReward} XP</span>
              </div>
              {ach.earned && ach.earnedAt && <p className="text-[10px] text-primary mt-1">{new Date(ach.earnedAt).toLocaleDateString()}</p>}
            </motion.div>)}
        </div>}
    </div>;
};
export default AchievementsPage;