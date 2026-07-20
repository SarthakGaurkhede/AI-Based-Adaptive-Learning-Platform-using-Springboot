import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const SecurityCenterPage = () => {
  const [tab, setTab] = useState('blocked');
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => api.get('/admin/security/events').then(r => r.data)
  });
  const events = data?.data || [];
  const summaryCards = [{
    label: 'Blocked Prompts',
    value: events.length,
    icon: 'block',
    color: 'text-error',
    bg: 'bg-error/10'
  }, {
    label: 'Jailbreak Attempts',
    value: 0,
    icon: 'security',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-400/10'
  }, {
    label: 'Flagged Accounts',
    value: 0,
    icon: 'flag',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-400/10'
  }, {
    label: 'System Health',
    value: '99.9%',
    icon: 'health_and_safety',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-400/10'
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Security Center</h1>
        <p className="text-on-surface-variant text-sm mt-1">Monitor AI safety filters, blocked prompts and anomalies</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((s, i) => <motion.div key={s.label} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: i * 0.05
      }} className="glass-card rounded-2xl p-5 border border-black/5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </div>
          </motion.div>)}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 max-w-xs">
        {['blocked', 'anomalies'].map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all
              ${tab === t ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t === 'blocked' ? 'Blocked Prompts' : 'Anomalies'}
          </button>)}
      </div>

      {/* Events list */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <h2 className="font-semibold text-on-surface">
            {tab === 'blocked' ? 'Blocked AI Prompts' : 'Detected Anomalies'}
          </h2>
        </div>

        {isLoading ? <div className="divide-y divide-black/5">
            {[...Array(5)].map((_, i) => <div key={i} className="flex gap-4 p-5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-48" />
                  <div className="h-3 bg-surface-container rounded w-full" />
                </div>
              </div>)}
          </div> : events.length === 0 ? <div className="py-16 text-center space-y-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block text-green-400">shield</span>
            <p className="font-semibold text-on-surface">All clear!</p>
            <p className="text-sm">No security events detected recently</p>
          </div> : <div className="divide-y divide-black/5">
            {events.map((ev, i) => <motion.div key={ev._id} initial={{
          opacity: 0,
          x: -8
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: i * 0.04
        }} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-container transition-colors">
                <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-error text-lg">block</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-on-surface text-sm">{ev.userId?.name || 'Unknown User'}</p>
                    <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full font-medium">
                      {ev.status?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                      {ev.module}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{ev.userId?.email}</p>
                  <p className="text-[10px] text-outline mt-1">{new Date(ev.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-on-surface-variant">{ev.promptTokens} tokens</p>
                  <p className="text-[10px] text-outline">${(ev.costUsd || 0).toFixed(6)}</p>
                </div>
              </motion.div>)}
          </div>}
      </motion.div>

      {/* AI Security rules */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.15
    }} className="glass-card rounded-2xl border border-black/5 p-5">
        <h2 className="font-semibold text-on-surface mb-4">Active Security Controls</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[{
          label: 'Prompt Injection Protection',
          status: 'Active',
          icon: 'security'
        }, {
          label: 'Jailbreak Detection',
          status: 'Active',
          icon: 'gpp_maybe'
        }, {
          label: 'Toxic Content Filter',
          status: 'Active',
          icon: 'block'
        }, {
          label: 'Output Validation',
          status: 'Active',
          icon: 'verified'
        }, {
          label: 'Rate Limiting',
          status: 'Active',
          icon: 'speed'
        }, {
          label: 'Audit Logging',
          status: 'Active',
          icon: 'history'
        }].map(rule => <div key={rule.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
              <span className="material-symbols-outlined text-primary text-lg">{rule.icon}</span>
              <span className="text-sm text-on-surface flex-1">{rule.label}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{rule.status}
              </span>
            </div>)}
        </div>
      </motion.div>
    </div>;
};
export default SecurityCenterPage;