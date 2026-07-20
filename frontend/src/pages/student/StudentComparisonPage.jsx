import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const StudentComparisonPage = () => {
  const {
    user
  } = useAuth();
  const [mode, setMode] = useState('top');
  const {
    data: myRank
  } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => api.get('/gamification/rank/me').then(r => r.data)
  });
  const {
    data: boardData
  } = useQuery({
    queryKey: ['leaderboard-top'],
    queryFn: () => api.get('/gamification/leaderboard?limit=1').then(r => r.data)
  });
  const me = myRank?.data;
  const top = boardData?.data?.[0];
  const modeLabels = {
    top: 'vs Top Student',
    class: 'vs Class Average',
    course: 'vs Course Average'
  };

  // Simulated comparison data
  const comparisons = {
    top: [{
      label: 'XP',
      me: me?.xp || 0,
      them: top?.xp || 0,
      unit: 'XP'
    }, {
      label: 'Knowledge Score',
      me: me?.knowledgeScore || 0,
      them: top?.knowledgeScore || 75,
      unit: 'pts'
    }, {
      label: 'Study Streak',
      me: me?.streak || 0,
      them: top?.streak || 18,
      unit: 'days'
    }, {
      label: 'Level',
      me: user?.level || 1,
      them: top?.level || 5
    }],
    class: [{
      label: 'XP',
      me: me?.xp || 0,
      them: 1800,
      unit: 'XP'
    }, {
      label: 'Knowledge Score',
      me: me?.knowledgeScore || 0,
      them: 52,
      unit: 'pts'
    }, {
      label: 'Study Streak',
      me: me?.streak || 0,
      them: 7,
      unit: 'days'
    }, {
      label: 'Avg Quiz Score',
      me: 71,
      them: 65,
      unit: '%'
    }],
    course: [{
      label: 'XP',
      me: me?.xp || 0,
      them: 1400,
      unit: 'XP'
    }, {
      label: 'Knowledge Score',
      me: me?.knowledgeScore || 0,
      them: 48,
      unit: 'pts'
    }, {
      label: 'Completion',
      me: 60,
      them: 55,
      unit: '%'
    }, {
      label: 'Avg Quiz Score',
      me: 71,
      them: 68,
      unit: '%'
    }]
  };
  const stats = comparisons[mode];
  const getBarWidth = (value, max) => `${Math.min(value / Math.max(max, 1) * 100, 100)}%`;
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Student Comparison</h1>
        <p className="text-on-surface-variant text-sm mt-1">Benchmark your performance against peers</p>
      </motion.div>

      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(modeLabels).map(m => <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${mode === m ? 'primary-gradient text-white shadow-md shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
            {modeLabels[m]}
          </button>)}
      </div>

      {/* Comparison header */}
      <motion.div key={mode} initial={{
      opacity: 0,
      y: 12
    }} animate={{
      opacity: 1,
      y: 0
    }} className="grid grid-cols-3 gap-4 text-center">
        {/* Me */}
        <div className="glass-card rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="w-12 h-12 primary-gradient rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-3">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <p className="font-bold text-on-surface text-sm">{user?.name}</p>
          <p className="text-xs text-primary font-medium">You · Rank #{me?.rank || '—'}</p>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
            <span className="font-black text-on-surface-variant text-sm">VS</span>
          </div>
        </div>

        {/* Them */}
        <div className="glass-card rounded-2xl border border-black/5 p-5">
          <div className="w-12 h-12 bg-surface-container-high rounded-xl mx-auto flex items-center justify-center text-on-surface-variant font-bold text-lg mb-3">
            {mode === 'top' ? top?.name?.[0] || 'T' : mode === 'class' ? '👥' : '📚'}
          </div>
          <p className="font-bold text-on-surface text-sm">
            {mode === 'top' ? top?.name || 'Top Student' : mode === 'class' ? 'Class Average' : 'Course Average'}
          </p>
          <p className="text-xs text-on-surface-variant">{mode === 'top' ? `Rank #${top?.rank || 1}` : 'Benchmark'}</p>
        </div>
      </motion.div>

      {/* Metric comparisons */}
      <div className="space-y-4">
        {stats.map((stat, i) => {
        const max = Math.max(stat.me, stat.them);
        const meWins = stat.me >= stat.them;
        return <motion.div key={stat.label} initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: i * 0.07
        }} className="glass-card rounded-2xl border border-black/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-on-surface text-sm">{stat.label}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${meWins ? 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300' : 'bg-surface-container text-on-surface-variant'}`}>
                  {meWins ? '✓ You lead' : 'Gap to close'}
                </span>
              </div>

              <div className="space-y-3">
                {/* Me bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-primary">You</span>
                    <span className="font-bold text-on-surface">{stat.me.toLocaleString()}{stat.unit ? ` ${stat.unit}` : ''}</span>
                  </div>
                  <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                    <motion.div initial={{
                  width: 0
                }} animate={{
                  width: getBarWidth(stat.me, max)
                }} transition={{
                  duration: 0.8,
                  delay: i * 0.07
                }} className="h-full primary-gradient rounded-full" />
                  </div>
                </div>

                {/* Them bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface-variant">
                      {mode === 'top' ? top?.name || 'Top Student' : mode === 'class' ? 'Class Avg' : 'Course Avg'}
                    </span>
                    <span className="font-bold text-on-surface">{stat.them.toLocaleString()}{stat.unit ? ` ${stat.unit}` : ''}</span>
                  </div>
                  <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                    <motion.div initial={{
                  width: 0
                }} animate={{
                  width: getBarWidth(stat.them, max)
                }} transition={{
                  duration: 0.8,
                  delay: i * 0.07 + 0.1
                }} className="h-full bg-on-surface-variant/30 rounded-full" />
                  </div>
                </div>

                {/* Difference */}
                <p className={`text-xs font-medium ${meWins ? 'text-green-600 dark:text-green-400' : 'text-error'}`}>
                  {meWins ? `+${(stat.me - stat.them).toLocaleString()}${stat.unit ? ` ${stat.unit}` : ''} ahead` : `${(stat.them - stat.me).toLocaleString()}${stat.unit ? ` ${stat.unit}` : ''} behind — keep going!`}
                </p>
              </div>
            </motion.div>;
      })}
      </div>

      {/* Motivational CTA */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }} className="glass-card rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
        <div className="flex-1">
          <p className="font-semibold text-on-surface">Want to climb faster?</p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Close your knowledge gaps, maintain your streak, and pass quizzes to earn more XP.
          </p>
        </div>
        <a href="/student/knowledge-gaps" className="px-4 py-2 primary-gradient text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
          View Gaps
        </a>
      </motion.div>
    </div>;
};
export default StudentComparisonPage;