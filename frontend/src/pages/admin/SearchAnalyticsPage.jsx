import React, { useState } from 'react';
import { motion } from 'framer-motion';
const SearchAnalyticsPage = () => {
  const [period, setPeriod] = useState('7d');

  // In production these come from aggregated search logs in Elasticsearch
  const topQueries = [{
    query: 'machine learning',
    count: 342,
    results: 24,
    clickRate: '78%'
  }, {
    query: 'neural networks',
    count: 289,
    results: 18,
    clickRate: '82%'
  }, {
    query: 'python basics',
    count: 251,
    results: 31,
    clickRate: '71%'
  }, {
    query: 'quantum mechanics',
    count: 198,
    results: 9,
    clickRate: '65%'
  }, {
    query: 'backpropagation',
    count: 176,
    results: 12,
    clickRate: '73%'
  }, {
    query: 'data structures',
    count: 154,
    results: 27,
    clickRate: '80%'
  }, {
    query: 'deep learning',
    count: 143,
    results: 15,
    clickRate: '76%'
  }, {
    query: 'linear algebra',
    count: 127,
    results: 8,
    clickRate: '69%'
  }, {
    query: 'gradient descent',
    count: 112,
    results: 11,
    clickRate: '74%'
  }, {
    query: 'reinforcement learning',
    count: 98,
    results: 6,
    clickRate: '61%'
  }];
  const zeroResults = [{
    query: 'gpt-5 tutorial',
    count: 43
  }, {
    query: 'transformer from scratch',
    count: 31
  }, {
    query: 'llm fine-tuning 2025',
    count: 28
  }, {
    query: 'diffusion models code',
    count: 22
  }, {
    query: 'rag implementation',
    count: 19
  }];
  const stats = [{
    label: 'Total Searches',
    value: '12,847',
    icon: 'search',
    color: 'text-primary'
  }, {
    label: 'Avg Results/Query',
    value: '14.3',
    icon: 'list',
    color: 'text-secondary'
  }, {
    label: 'Zero-Result Rate',
    value: '4.2%',
    icon: 'search_off',
    color: 'text-error'
  }, {
    label: 'Avg Click Rate',
    value: '73.8%',
    icon: 'ads_click',
    color: 'text-green-500'
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Search Analytics</h1>
          <p className="text-on-surface-variant text-sm mt-1">Monitor platform search behaviour and trends</p>
        </div>
        <div className="flex gap-1 bg-surface-container rounded-xl p-1">
          {['7d', '30d'].map(p => <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${period === p ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant'}`}>
              {p === '7d' ? '7 Days' : '30 Days'}
            </button>)}
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <motion.div key={s.label} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: i * 0.05
      }} className="glass-card rounded-2xl p-5 border border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </div>
          </motion.div>)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top queries */}
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
            <h2 className="font-semibold text-on-surface">Top Search Queries</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Most searched terms this {period}</p>
          </div>
          <div className="divide-y divide-black/5">
            {topQueries.map((q, i) => {
            const maxCount = topQueries[0].count;
            const pct = Math.round(q.count / maxCount * 100);
            return <motion.div key={q.query} initial={{
              opacity: 0,
              x: -8
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: i * 0.04
            }} className="px-5 py-3 hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-on-surface-variant w-4 shrink-0">#{i + 1}</span>
                      <p className="text-sm font-medium text-on-surface truncate">{q.query}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-on-surface-variant">{q.results} results</span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">{q.clickRate}</span>
                      <span className="text-xs font-bold text-on-surface">{q.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden ml-6">
                    <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${pct}%`
                }} transition={{
                  duration: 0.6,
                  delay: 0.3 + i * 0.04
                }} className="h-full primary-gradient rounded-full" />
                  </div>
                </motion.div>;
          })}
          </div>
        </motion.div>

        {/* Zero results */}
        <div className="space-y-4">
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.12
        }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
            <div className="p-5 border-b border-black/5">
              <h2 className="font-semibold text-on-surface">Zero-Result Queries</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Content gaps — consider adding courses on these topics</p>
            </div>
            <div className="divide-y divide-black/5">
              {zeroResults.map((q, i) => <motion.div key={q.query} initial={{
              opacity: 0,
              x: 8
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: i * 0.05
            }} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-lg">search_off</span>
                    <p className="text-sm font-medium text-on-surface">{q.query}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-error">{q.count} searches</span>
                    <button className="text-xs text-primary font-medium hover:underline">+ Add Content</button>
                  </div>
                </motion.div>)}
            </div>
          </motion.div>

          {/* Search performance chart */}
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.16
        }} className="glass-card rounded-2xl border border-black/5 p-5">
            <h2 className="font-semibold text-on-surface mb-4">Daily Search Volume</h2>
            <div className="flex items-end gap-2 h-24">
              {[420, 380, 510, 490, 630, 580, 720, 650, 700, 810, 760, 890, 840, 920].map((v, i) => {
              const max = 920;
              return <motion.div key={i} initial={{
                height: 0
              }} animate={{
                height: `${v / max * 100}%`
              }} transition={{
                duration: 0.5,
                delay: i * 0.04
              }} className="flex-1 primary-gradient rounded-t-lg min-h-[4px] cursor-pointer hover:opacity-80 transition-opacity" title={`${v} searches`} />;
            })}
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant mt-2">
              <span>14 days ago</span>
              <span>Today</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search type breakdown */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }} className="glass-card rounded-2xl border border-black/5 p-5">
        <h2 className="font-semibold text-on-surface mb-4">Search Type Breakdown</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[{
          type: 'Text Search',
          icon: 'text_fields',
          pct: 78,
          count: '10,020',
          color: 'bg-primary'
        }, {
          type: 'Fuzzy / Typo Correction',
          icon: 'spellcheck',
          pct: 18,
          count: '2,312',
          color: 'bg-secondary'
        }, {
          type: 'Voice Search',
          icon: 'mic',
          pct: 4,
          count: '515',
          color: 'bg-orange-400'
        }].map(t => <div key={t.type} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg ${t.color === 'bg-primary' ? 'text-primary' : t.color === 'bg-secondary' ? 'text-secondary' : 'text-orange-400'}`}>{t.icon}</span>
                <p className="text-sm font-medium text-on-surface">{t.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${t.pct}%`
              }} transition={{
                duration: 0.8
              }} className={`h-full rounded-full ${t.color}`} />
                </div>
                <span className="text-xs font-bold text-on-surface shrink-0">{t.pct}%</span>
              </div>
              <p className="text-xs text-on-surface-variant">{t.count} searches</p>
            </div>)}
        </div>
      </motion.div>
    </div>;
};
export default SearchAnalyticsPage;