import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const RankHistoryPage = () => {
  const {
    user
  } = useAuth();
  const [period, setPeriod] = useState('weekly');
  const {
    data: myRank
  } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => api.get('/gamification/rank/me').then(r => r.data)
  });

  // Mock rank history — in production from leaderboard_snapshots collection
  const historyData = [{
    label: 'Week 1',
    rank: 42,
    xp: 800
  }, {
    label: 'Week 2',
    rank: 38,
    xp: 1100
  }, {
    label: 'Week 3',
    rank: 31,
    xp: 1450
  }, {
    label: 'Week 4',
    rank: 27,
    xp: 1820
  }, {
    label: 'Week 5',
    rank: 24,
    xp: 2200
  }, {
    label: 'Week 6',
    rank: 19,
    xp: 2650
  }, {
    label: 'Week 7',
    rank: 15,
    xp: 3100
  }, {
    label: 'Week 8',
    rank: 12,
    xp: 3600
  }];
  const rank = myRank?.data;
  const maxRank = Math.max(...historyData.map(d => d.rank));
  const minRank = Math.min(...historyData.map(d => d.rank));
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Rank History</h1>
        <p className="text-on-surface-variant text-sm mt-1">Track your rank movement over time</p>
      </motion.div>

      {/* Current rank card */}
      {rank && <motion.div initial={{
      opacity: 0,
      scale: 0.97
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="primary-gradient rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black">
                #{rank.rank}
              </div>
              <div>
                <p className="text-white/70 text-sm">Current Rank</p>
                <p className="font-bold text-xl">{user?.name}</p>
                <p className="text-white/70 text-sm">{rank.xp?.toLocaleString()} XP · Score {rank.rankScore}</p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="font-bold text-xl">{rank.knowledgeScore}</p>
                <p className="text-white/70 text-xs">Knowledge</p>
              </div>
              <div>
                <p className="font-bold text-xl">{rank.streak}🔥</p>
                <p className="text-white/70 text-xs">Streak</p>
              </div>
              {rank.nextStudent && <div>
                  <p className="font-bold text-xl">+{rank.nextStudent.xpNeeded}</p>
                  <p className="text-white/70 text-xs">XP to #{rank.rank - 1}</p>
                </div>}
            </div>
          </div>
        </motion.div>}

      {/* Period toggle */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 max-w-xs">
        {['weekly', 'monthly'].map(p => <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all
              ${period === p ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {p}
          </button>)}
      </div>

      {/* Rank chart */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="glass-card rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold text-on-surface mb-1">Rank Movement</h2>
        <p className="text-xs text-on-surface-variant mb-6">Lower rank number = better position</p>

        {/* SVG line chart */}
        <div className="relative h-48">
          <svg className="w-full h-full" viewBox="0 0 700 180" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3].map(i => <line key={i} x1="0" y1={i * 45} x2="700" y2={i * 45} stroke="currentColor" strokeWidth="1" className="text-outline-variant/30" />)}

            {/* Area fill */}
            <defs>
              <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4648d4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4648d4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line */}
            <motion.polyline fill="none" stroke="#4648d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{
            pathLength: 0
          }} animate={{
            pathLength: 1
          }} transition={{
            duration: 1.5,
            ease: 'easeOut'
          }} points={historyData.map((d, i) => {
            const x = i / (historyData.length - 1) * 700;
            const y = (d.rank - minRank) / Math.max(maxRank - minRank, 1) * 140 + 20;
            return `${x},${y}`;
          }).join(' ')} />

            {/* Dots */}
            {historyData.map((d, i) => {
            const x = i / (historyData.length - 1) * 700;
            const y = (d.rank - minRank) / Math.max(maxRank - minRank, 1) * 140 + 20;
            return <motion.g key={i} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.1 * i + 1
            }}>
                  <circle cx={x} cy={y} r="5" fill="#4648d4" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="currentColor" className="text-on-surface-variant">
                    #{d.rank}
                  </text>
                </motion.g>;
          })}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2">
            {historyData.map(d => <span key={d.label} className="text-[10px] text-on-surface-variant">{d.label}</span>)}
          </div>
        </div>
      </motion.div>

      {/* XP progression */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.15
    }} className="glass-card rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold text-on-surface mb-4">XP Progression</h2>
        <div className="space-y-3">
          {historyData.map((d, i) => {
          const maxXp = Math.max(...historyData.map(h => h.xp));
          const pct = Math.round(d.xp / maxXp * 100);
          const improvement = i > 0 ? d.xp - historyData[i - 1].xp : 0;
          return <div key={d.label} className="flex items-center gap-4">
                <span className="text-xs text-on-surface-variant w-12 shrink-0">{d.label}</span>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${pct}%`
              }} transition={{
                duration: 0.6,
                delay: i * 0.08
              }} className="h-full primary-gradient rounded-full" />
                </div>
                <span className="text-xs font-semibold text-on-surface w-20 text-right shrink-0">
                  {d.xp.toLocaleString()} XP
                </span>
                {improvement > 0 && <span className="text-xs text-green-500 font-medium shrink-0">+{improvement}</span>}
              </div>;
        })}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }} className="grid grid-cols-3 gap-4">
        {[{
        label: 'Best Rank',
        value: `#${minRank}`,
        icon: 'emoji_events',
        color: 'text-yellow-500'
      }, {
        label: 'Ranks Gained',
        value: `+${historyData[0].rank - historyData[historyData.length - 1].rank}`,
        icon: 'trending_up',
        color: 'text-green-500'
      }, {
        label: 'XP Gained',
        value: `+${(historyData[historyData.length - 1].xp - historyData[0].xp).toLocaleString()}`,
        icon: 'bolt',
        color: 'text-primary'
      }].map(s => <div key={s.label} className="glass-card rounded-2xl border border-black/5 p-4 text-center">
            <span className={`material-symbols-outlined text-2xl ${s.color} block mb-1`}>{s.icon}</span>
            <p className="font-bold text-on-surface text-lg">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>)}
      </motion.div>
    </div>;
};
export default RankHistoryPage;