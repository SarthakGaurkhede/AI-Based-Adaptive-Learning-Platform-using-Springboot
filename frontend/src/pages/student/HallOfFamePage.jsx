import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const HallOfFamePage = () => {
  const {
    user
  } = useAuth();
  const {
    data: boardData,
    isLoading
  } = useQuery({
    queryKey: ['hall-of-fame'],
    queryFn: () => api.get('/gamification/leaderboard?scope=global&limit=100').then(r => r.data)
  });
  const {
    data: myRankData
  } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => api.get('/gamification/rank/me').then(r => r.data)
  });
  const board = boardData?.data || [];
  const myRank = myRankData?.data;
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ['h-24', 'h-32', 'h-20'];
  const podiumColors = ['bg-slate-300 dark:bg-slate-600', 'bg-yellow-400', 'bg-amber-600'];
  const medals = ['🥈', '🥇', '🥉'];
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-on-surface">Hall of Fame</h1>
        <p className="text-on-surface-variant">Top performers on Knowledge Guru — all time</p>
      </motion.div>

      {/* Podium */}
      {!isLoading && top3.length >= 3 && <motion.div initial={{
      opacity: 0,
      y: 24
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="flex items-end justify-center gap-4 py-6">
          {podiumOrder.map((entry, i) => {
        const isMe = entry?.userId === user?._id;
        return <div key={entry?.userId || i} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg
                  ${i === 1 ? 'primary-gradient shadow-primary/20 scale-110' : 'bg-surface-container-high'}`}>
                  {entry?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <p className={`text-sm font-bold ${isMe ? 'text-primary' : 'text-on-surface'} max-w-[80px] text-center truncate`}>
                  {medals[i]} {entry?.name}
                </p>
                <p className="text-xs text-on-surface-variant">{entry?.xp?.toLocaleString()} XP</p>
                <div className={`w-20 ${podiumHeights[i]} ${podiumColors[i]} rounded-t-xl flex items-start justify-center pt-2`}>
                  <span className="text-white font-black text-lg">#{i === 0 ? 2 : i === 1 ? 1 : 3}</span>
                </div>
              </div>;
      })}
        </motion.div>}

      {/* My rank callout */}
      {myRank && <motion.div initial={{
      opacity: 0,
      scale: 0.97
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: 0.2
    }} className="primary-gradient rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-black">
                #{myRank.rank}
              </div>
              <div>
                <p className="font-bold">{user?.name} (You)</p>
                <p className="text-white/70 text-sm">{myRank.xp.toLocaleString()} XP · Score {myRank.rankScore}</p>
              </div>
            </div>
            {myRank.nextStudent && <div className="text-right">
                <p className="text-white/70 text-xs">To overtake {myRank.nextStudent.name}</p>
                <p className="font-bold text-lg">+{myRank.nextStudent.xpNeeded.toLocaleString()} XP</p>
              </div>}
          </div>
        </motion.div>}

      {/* Full rankings */}
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
          <h2 className="font-semibold text-on-surface">All Rankings</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{board.length} students ranked</p>
        </div>
        <div className="divide-y divide-black/5">
          {isLoading ? [...Array(10)].map((_, i) => <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-container" />
                <div className="flex-1 h-4 bg-surface-container rounded" />
                <div className="w-20 h-4 bg-surface-container rounded" />
              </div>) : board.map((entry, i) => {
          const isMe = entry.userId === user?._id;
          return <motion.div key={entry.userId || i} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: i * 0.02
          }} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-surface-container'}`}>
                <span className="w-8 text-center text-sm font-bold text-on-surface-variant shrink-0">#{i + 1}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0
                  ${isMe ? 'primary-gradient' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {entry.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                    {entry.name} {isMe && '(you)'}
                  </p>
                  <p className="text-xs text-on-surface-variant">Level {entry.level} · {entry.streak || 0}🔥</p>
                </div>
                <div className="text-center hidden sm:block shrink-0">
                  <p className="text-sm font-medium text-on-surface">{entry.knowledgeScore || 0}</p>
                  <p className="text-[10px] text-on-surface-variant">Knowledge</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary text-sm">{(entry.xp || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-on-surface-variant">XP</p>
                </div>
              </motion.div>;
        })}
        </div>
      </motion.div>
    </div>;
};
export default HallOfFamePage;