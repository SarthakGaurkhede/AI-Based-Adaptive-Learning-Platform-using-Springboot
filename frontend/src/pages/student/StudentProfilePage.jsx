import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const levelThresholds = [0, 400, 1000, 2500, 5000, 10000, 20000, 40000, 75000, 120000];
const StudentProfilePage = () => {
  const {
    user
  } = useAuth();
  const {
    data: analytics
  } = useQuery({
    queryKey: ['student-analytics'],
    queryFn: () => api.get('/users/me/analytics').then(r => r.data)
  });
  const {
    data: achievementsData
  } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get('/gamification/achievements').then(r => r.data)
  });
  const stats = analytics?.data || {};
  const achievements = (achievementsData?.data || []).filter(a => a.earned).slice(0, 6);
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const nextLvlXp = levelThresholds[level] || 10000;
  const prevLvlXp = levelThresholds[level - 1] || 0;
  const progress = Math.min((xp - prevLvlXp) / (nextLvlXp - prevLvlXp) * 100, 100);
  return <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="relative h-48 bg-gradient-to-br from-primary via-secondary to-purple-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => <div key={i} className="absolute w-32 h-32 rounded-full border border-white/30" style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`
        }} />)}
        </div>
        <div className="absolute bottom-4 right-4">
          <span className="text-white/20 text-6xl font-black">Lv.{level}</span>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8">
        {/* Avatar + name row */}
        <div className="flex items-end gap-4 -mt-12 mb-6">
          <motion.div initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} className="w-24 h-24 rounded-2xl primary-gradient flex items-center justify-center text-white text-4xl font-black border-4 border-surface shadow-xl shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </motion.div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-on-surface">{user?.name}</h1>
            <p className="text-on-surface-variant text-sm capitalize">{user?.role} · {user?.email}</p>
          </div>
        </div>

        <div className="space-y-6 pb-8">
          {/* Level & XP card */}
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} className="glass-card rounded-2xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Level Progress</p>
                <p className="text-2xl font-bold text-on-surface mt-1">Level {level}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">Total XP</p>
                <p className="text-2xl font-bold primary-gradient-text">{xp.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div initial={{
              width: 0
            }} animate={{
              width: `${progress}%`
            }} transition={{
              duration: 1,
              delay: 0.3
            }} className="h-full primary-gradient rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant mt-2">
              <span>{(xp - prevLvlXp).toLocaleString()} XP this level</span>
              <span>{(nextLvlXp - xp).toLocaleString()} XP to Level {level + 1}</span>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{
            label: 'Knowledge Score',
            value: user?.knowledgeScore || 0,
            icon: 'psychology',
            color: 'text-primary'
          }, {
            label: 'Study Streak',
            value: `${user?.streak?.current || 0}🔥`,
            icon: 'local_fire_department',
            color: 'text-orange-500'
          }, {
            label: 'Courses Done',
            value: stats.coursesCompleted || 0,
            icon: 'check_circle',
            color: 'text-green-500'
          }, {
            label: 'Avg Quiz Score',
            value: `${stats.avgQuizScore || 0}%`,
            icon: 'quiz',
            color: 'text-secondary'
          }].map((s, i) => <motion.div key={s.label} initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: i * 0.06
          }} className="glass-card rounded-2xl p-5 border border-black/5 text-center">
                <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                <p className="text-xl font-bold text-on-surface mt-2">{s.value}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
              </motion.div>)}
          </div>

          {/* Streak info */}
          <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.15
        }} className="glass-card rounded-2xl border border-black/5 p-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-400/10 flex items-center justify-center shrink-0">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-on-surface">Study Streak</p>
              <p className="text-on-surface-variant text-sm">{user?.streak?.current || 0} days current · {user?.streak?.longest || 0} days longest</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">{user?.streak?.current || 0}</p>
              <p className="text-xs text-on-surface-variant">day streak</p>
            </div>
          </motion.div>

          {/* Earned badges */}
          {achievements.length > 0 && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="glass-card rounded-2xl border border-black/5 p-5">
              <h2 className="font-semibold text-on-surface mb-4">Recent Achievements</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {achievements.map(ach => <div key={ach._id} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container text-center">
                    <span className="material-symbols-outlined text-primary text-2xl" style={{
                fontVariationSettings: "'FILL' 1"
              }}>{ach.icon}</span>
                    <p className="text-[10px] text-on-surface-variant leading-tight">{ach.title}</p>
                  </div>)}
              </div>
            </motion.div>}
        </div>
      </div>
    </div>;
};
export default StudentProfilePage;