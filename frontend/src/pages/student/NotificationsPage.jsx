import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const typeIcon = {
  performance: 'trending_up',
  warning: 'warning',
  rank: 'emoji_events',
  study_plan: 'calendar_month',
  quiz: 'quiz',
  announcement: 'campaign'
};
const typeColor = {
  performance: 'text-green-500',
  warning: 'text-yellow-500',
  rank: 'text-primary',
  study_plan: 'text-secondary',
  quiz: 'text-orange-500',
  announcement: 'text-blue-500'
};
const typeBg = {
  performance: 'bg-green-50 dark:bg-green-400/10',
  warning: 'bg-yellow-50 dark:bg-yellow-400/10',
  rank: 'bg-primary/10',
  study_plan: 'bg-secondary/10',
  quiz: 'bg-orange-50 dark:bg-orange-400/10',
  announcement: 'bg-blue-50 dark:bg-blue-400/10'
};
const NotificationsPage = () => {
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data)
  });
  const readMut = useMutation({
    mutationFn: id => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['notifications']
    })
  });
  const readAllMut = useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read'),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['notifications']
    })
  });
  const notifications = data?.data || [];
  const unread = data?.meta?.unread || 0;
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
          {unread > 0 && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
        </div>
        {unread > 0 && <button onClick={() => readAllMut.mutate()} className="text-sm text-primary font-medium hover:underline">Mark all as read</button>}
      </motion.div>

      {isLoading ? <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 border border-black/5 animate-pulse h-20" />)}
        </div> : notifications.length === 0 ? <div className="py-20 text-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant block">notifications_none</span>
          <p className="font-semibold text-on-surface">You're all caught up!</p>
          <p className="text-on-surface-variant text-sm">Notifications will appear here as you progress.</p>
        </div> : <div className="space-y-3">
          {notifications.map((n, i) => <motion.div key={n._id} initial={{
        opacity: 0,
        x: -12
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: i * 0.04
      }} onClick={() => !n.read && readMut.mutate(n._id)} className={`flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer group
                ${n.read ? 'glass-card border-black/5 hover:bg-surface-container' : 'bg-primary/5 border-primary/20 hover:bg-primary/8'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeBg[n.type] || 'bg-surface-container'}`}>
                <span className={`material-symbols-outlined ${typeColor[n.type] || 'text-on-surface-variant'}`}>
                  {typeIcon[n.type] || 'notifications'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.read ? 'text-on-surface' : 'text-primary'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-outline mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </motion.div>)}
        </div>}
    </div>;
};
export default NotificationsPage;