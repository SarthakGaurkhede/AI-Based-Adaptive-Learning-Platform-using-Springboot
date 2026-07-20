import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const typeIcon = {
  course: 'school',
  topic: 'lightbulb',
  resource: 'article',
  action: 'bolt'
};
const typeColor = {
  course: 'text-primary',
  topic: 'text-secondary',
  resource: 'text-orange-500',
  action: 'text-green-500'
};
const RecommendationsPage = () => {
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations').then(r => r.data)
  });
  const generateMut = useMutation({
    mutationFn: () => api.post('/recommendations/generate'),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['recommendations']
    })
  });
  const dismissMut = useMutation({
    mutationFn: id => api.post(`/recommendations/${id}/dismiss`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['recommendations']
    })
  });
  const recs = data?.data || [];
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI Recommendations</h1>
          <p className="text-on-surface-variant text-sm mt-1">Personalized next steps based on your knowledge gaps</p>
        </div>
        <motion.button whileTap={{
        scale: 0.97
      }} onClick={() => generateMut.mutate()} disabled={generateMut.isPending} className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60">
          <span className={`material-symbols-outlined text-lg ${generateMut.isPending ? 'animate-spin' : ''}`}>
            {generateMut.isPending ? 'refresh' : 'auto_awesome'}
          </span>
          {generateMut.isPending ? 'Generating…' : 'Refresh with AI'}
        </motion.button>
      </motion.div>

      {isLoading ? <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 border border-black/5 animate-pulse h-24" />)}
        </div> : recs.length === 0 ? <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="py-20 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary block">auto_awesome</span>
          <p className="font-semibold text-on-surface">No recommendations yet</p>
          <p className="text-on-surface-variant text-sm">Complete quizzes to generate personalized AI recommendations.</p>
          <button onClick={() => generateMut.mutate()} className="mt-2 px-6 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Generate Now
          </button>
        </motion.div> : <div className="space-y-4">
          {recs.map((rec, i) => <motion.div key={rec._id} initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: i * 0.05
      }} className="glass-card rounded-2xl p-5 border border-black/5 hover:shadow-glass-lg transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined ${typeColor[rec.type] || 'text-primary'}`}>
                    {typeIcon[rec.type] || 'lightbulb'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize
                      ${rec.type === 'course' ? 'bg-primary/10 text-primary' : rec.type === 'topic' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {rec.type}
                    </span>
                    <span className="text-xs text-on-surface-variant">Priority: {rec.priorityScore}</span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{rec.reason}</p>
                </div>
                <button onClick={() => dismissMut.mutate(rec._id)} className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0" title="Dismiss">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <div className="mt-4 ml-14 flex gap-3">
                <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <span className="material-symbols-outlined text-sm">open_in_new</span>View
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-sm">bookmark</span>Save
                </button>
              </div>
            </motion.div>)}
        </div>}
    </div>;
};
export default RecommendationsPage;