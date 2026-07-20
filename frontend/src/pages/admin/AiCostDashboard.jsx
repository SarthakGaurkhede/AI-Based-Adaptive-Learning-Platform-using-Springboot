import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const periods = ['1d', '7d', '30d'];
const moduleColors = {
  tutor: 'bg-primary',
  'study-plan': 'bg-secondary',
  'quiz-gen': 'bg-orange-400',
  'course-gen': 'bg-green-400',
  flashcards: 'bg-blue-400',
  notes: 'bg-pink-400',
  'gap-detection': 'bg-yellow-400'
};
const AiCostDashboard = () => {
  const [period, setPeriod] = useState('7d');
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['admin-ai-cost', period],
    queryFn: () => api.get(`/admin/ai-cost?period=${period}`).then(r => r.data)
  });
  const cost = data?.data || {};
  const byModule = Object.entries(cost.byModule || {});
  const totalCost = cost.totalCost || 0;
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI Cost Dashboard</h1>
          <p className="text-on-surface-variant text-sm mt-1">Monitor Gemini API spend by module</p>
        </div>
        <div className="flex gap-1 bg-surface-container rounded-xl p-1">
          {periods.map(p => <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${period === p ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant'}`}>
              {p === '1d' ? '24h' : p === '7d' ? '7 Days' : '30 Days'}
            </button>)}
        </div>
      </motion.div>

      {/* Total cost hero */}
      <motion.div initial={{
      opacity: 0,
      scale: 0.97
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="primary-gradient rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
        <p className="text-white/70 text-sm">Total Gemini Spend</p>
        <p className="text-5xl font-black mt-2">${totalCost.toFixed(4)}</p>
        <div className="flex gap-6 mt-4 text-sm text-white/80">
          <span>{cost.callCount || 0} API calls</span>
          <span>·</span>
          <span>{period === '1d' ? 'Last 24 hours' : period === '7d' ? 'Last 7 days' : 'Last 30 days'}</span>
        </div>
      </motion.div>

      {/* By module */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <h2 className="font-semibold text-on-surface">Cost by AI Module</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Breakdown of spend per feature</p>
        </div>
        <div className="p-5 space-y-4">
          {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-24 h-4 bg-surface-container rounded" />
                <div className="flex-1 h-3 bg-surface-container rounded-full" />
                <div className="w-16 h-4 bg-surface-container rounded" />
              </div>) : byModule.length === 0 ? <p className="text-center text-on-surface-variant py-8">No AI usage in this period</p> : byModule.sort((a, b) => b[1] - a[1]).map(([mod, c]) => {
          const pct = totalCost > 0 ? c / totalCost * 100 : 0;
          return <div key={mod} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-on-surface capitalize">{mod}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-on-surface-variant text-xs">{pct.toFixed(1)}%</span>
                    <span className="font-semibold text-on-surface">${c.toFixed(4)}</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${pct}%`
              }} transition={{
                duration: 0.8,
                ease: 'easeOut'
              }} className={`h-full rounded-full ${moduleColors[mod] || 'bg-primary'}`} />
                </div>
              </div>;
        })}
        </div>
      </motion.div>

      {/* Cost info */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.15
    }} className="grid md:grid-cols-3 gap-4">
        {[{
        icon: 'smart_toy',
        label: 'AI Tutor',
        desc: 'Most expensive — real-time RAG queries',
        color: 'text-primary'
      }, {
        icon: 'auto_awesome',
        label: 'Course Gen',
        desc: 'High token usage for full course drafts',
        color: 'text-secondary'
      }, {
        icon: 'quiz',
        label: 'Quiz Gen',
        desc: 'Moderate — batched question generation',
        color: 'text-orange-500'
      }].map(tip => <div key={tip.label} className="glass-card rounded-2xl p-4 border border-black/5">
            <span className={`material-symbols-outlined ${tip.color} text-2xl`}>{tip.icon}</span>
            <p className="font-semibold text-on-surface text-sm mt-2">{tip.label}</p>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{tip.desc}</p>
          </div>)}
      </motion.div>
    </div>;
};
export default AiCostDashboard;