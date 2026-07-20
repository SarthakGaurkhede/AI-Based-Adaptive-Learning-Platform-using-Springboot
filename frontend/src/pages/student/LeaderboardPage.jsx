import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const tabs = ['Global', 'Weekly', 'Monthly', 'Course'];
const medalColors = ['text-yellow-400', 'text-slate-400', 'text-amber-600'];
const medalIcons = ['emoji_events', 'workspace_premium', 'military_tech'];
const LeaderboardPage = () => {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState('Global');
  const {
    data: boardData,
    isLoading
  } = useQuery({
    queryKey: ['leaderboard', activeTab],
    queryFn: () => api.get(`/gamification/leaderboard?scope=${activeTab.toLowerCase()}&limit=50`).then(r => r.data)
  });
  const {
    data: myRankData
  } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => api.get('/gamification/rank/me').then(r => r.data)
  });
  const board = boardData?.data || [];
  const myRank = myRankData?.data;
  const myEntry = board.find(r => r.userId === user?._id || r.userId?.toString() === user?._id);
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Leaderboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Compete with learners worldwide</p>
      </motion.div>

      {/* My rank card */}
      {myRank && <motion.div initial={{
      opacity: 0,
      scale: 0.97
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="primary-gradient rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-black">
                #{myRank.rank}
              </div>
              <div>
                <p className="font-bold text-lg">{user?.name}</p>
                <p className="text-white/70 text-sm">{myRank.rankScore} rank score</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">XP to next rank</p>
              <p className="font-bold text-lg">{myRank.nextStudent?.xpNeeded || '—'}</p>
              {myRank.nextStudent && <p className="text-white/70 text-xs">Overtake {myRank.nextStudent.name}</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t border-white/20 pt-4">
            <div><p className="font-bold">{myRank.xp}</p><p className="text-white/70 text-xs">XP</p></div>
            <div><p className="font-bold">{myRank.knowledgeScore}</p><p className="text-white/70 text-xs">Knowledge</p></div>
            <div><p className="font-bold">{myRank.streak}🔥</p><p className="text-white/70 text-xs">Streak</p></div>
          </div>
        </motion.div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1">
        {tabs.map(t => <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${activeTab === t ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t}
          </button>)}
      </div>

      {/* Board */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0
      }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
          {isLoading ? <div className="divide-y divide-black/5">
              {[...Array(10)].map((_, i) => <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-surface-container" />
                  <div className="flex-1 h-4 bg-surface-container rounded" />
                  <div className="w-16 h-4 bg-surface-container rounded" />
                </div>)}
            </div> : board.length === 0 ? <div className="py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2">emoji_events</span>
              <p>No data yet for this period</p>
            </div> : <div className="divide-y divide-black/5">
              {board.map((entry, i) => {
            const isMe = entry.userId === user?._id || entry.userId?.toString() === user?._id;
            const top3 = i < 3;
            return <motion.div key={entry.userId || i} initial={{
              opacity: 0,
              x: -8
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: i * 0.02
            }} className={`flex items-center gap-4 px-5 py-4 transition-colors
                      ${isMe ? 'bg-primary/5' : 'hover:bg-surface-container'}`}>
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {top3 ? <span className={`material-symbols-outlined ${medalColors[i]}`} style={{
                  fontVariationSettings: "'FILL' 1"
                }}>
                          {medalIcons[i]}
                        </span> : <span className="text-sm font-bold text-on-surface-variant">#{i + 1}</span>}
                    </div>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0
                      ${isMe ? 'primary-gradient' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {entry.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                        {entry.name} {isMe && <span className="text-xs font-normal">(you)</span>}
                      </p>
                      <p className="text-xs text-on-surface-variant">Level {entry.level} · {entry.streak || 0}🔥</p>
                    </div>

                    {/* XP */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-on-surface text-sm">{entry.xp?.toLocaleString()} XP</p>
                      <p className="text-xs text-on-surface-variant">Score {entry.rankScore}</p>
                    </div>
                  </motion.div>;
          })}
            </div>}
        </motion.div>
      </AnimatePresence>
    </div>;
};
export default LeaderboardPage;