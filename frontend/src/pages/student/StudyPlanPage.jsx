import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const tabs = ['daily', 'weekly', 'monthly'];
const StudyPlanPage = () => {
  const qc = useQueryClient();
  const [type, setType] = useState('daily');
  const [generating, setGenerating] = useState(false);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['study-plans', type],
    queryFn: () => api.get(`/study-plans?type=${type}`).then(r => r.data)
  });
  const plans = data?.data || [];
  const activePlan = plans[0];
  const completeMut = useMutation({
    mutationFn: ({
      planId,
      itemId
    }) => api.patch(`/study-plans/${planId}/items/${itemId}/complete`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['study-plans', type]
    })
  });
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/study-plans/generate', {
        type
      });
      qc.invalidateQueries({
        queryKey: ['study-plans', type]
      });
    } finally {
      setGenerating(false);
    }
  };
  const taskIcon = {
    review: 'menu_book',
    quiz: 'quiz',
    practice: 'psychology',
    study: 'school'
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI Study Plan</h1>
          <p className="text-on-surface-variant text-sm mt-1">Personalized from your knowledge gaps</p>
        </div>
        <motion.button whileTap={{
        scale: 0.97
      }} onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-60">
          <span className={`material-symbols-outlined text-lg ${generating ? 'animate-spin' : ''}`}>
            {generating ? 'refresh' : 'auto_awesome'}
          </span>
          {generating ? 'Generating…' : 'Generate Plan'}
        </motion.button>
      </motion.div>

      {/* Type tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1">
        {tabs.map(t => <button key={t} onClick={() => setType(t)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium capitalize transition-all
              ${type === t ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t}
          </button>)}
      </div>

      {isLoading ? <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card rounded-2xl border border-black/5 animate-pulse" />)}
        </div> : !activePlan ? <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="py-20 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary block">calendar_month</span>
          <p className="font-semibold text-on-surface">No {type} plan yet</p>
          <p className="text-on-surface-variant text-sm">Generate a plan based on your knowledge gaps</p>
          <button onClick={handleGenerate} disabled={generating} className="px-6 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {generating ? 'Generating…' : 'Generate Now'}
          </button>
        </motion.div> : <AnimatePresence mode="wait">
          <motion.div key={type} initial={{
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0
      }} className="space-y-4">
            {/* Plan header */}
            <div className="glass-card rounded-2xl border border-black/5 p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-on-surface capitalize">{type} Plan</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {new Date(activePlan.periodStart).toLocaleDateString()} –{' '}
                    {new Date(activePlan.periodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{activePlan.totalEstimatedHours?.toFixed(1)}h</p>
                  <p className="text-xs text-on-surface-variant">estimated</p>
                </div>
              </div>

              {/* Overall progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                  <span>Completion</span>
                  <span>{activePlan.items?.filter(i => i.completed).length || 0}/{activePlan.items?.length || 0} tasks</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${activePlan.items?.length ? activePlan.items.filter(i => i.completed).length / activePlan.items.length * 100 : 0}%`
              }} transition={{
                duration: 0.8
              }} className="h-full primary-gradient rounded-full" />
                </div>
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {activePlan.items?.map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            x: -12
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: i * 0.05
          }} className={`glass-card rounded-2xl border p-4 transition-all
                    ${item.completed ? 'border-green-200 dark:border-green-400/20 bg-green-50/50 dark:bg-green-400/5' : 'border-black/5 hover:shadow-glass-lg'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => !item.completed && completeMut.mutate({
                planId: activePlan._id,
                itemId: item.topicId
              })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${item.completed ? 'bg-green-500 border-green-500' : 'border-outline-variant hover:border-primary'}`}>
                      {item.completed && <span className="material-symbols-outlined text-white text-sm">check</span>}
                    </button>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                      ${item.completed ? 'bg-green-100 dark:bg-green-400/10' : 'bg-primary/10'}`}>
                      <span className={`material-symbols-outlined text-lg ${item.completed ? 'text-green-500' : 'text-primary'}`}>
                        {taskIcon[item.taskType] || 'school'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${item.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                        {item.topicId?.title || 'Study Topic'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 capitalize">{item.taskType} · {item.estimatedMinutes} min</p>
                    </div>
                    {item.completed && <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">Done ✓</span>}
                  </div>
                </motion.div>)}
            </div>

            {/* AI text plan */}
            {activePlan.aiGenerated && <div className="glass-card rounded-2xl border border-primary/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  <p className="font-semibold text-on-surface text-sm">AI Recommendations</p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">{activePlan.aiGenerated}</p>
                </div>
              </div>}
          </motion.div>
        </AnimatePresence>}
    </div>;
};
export default StudyPlanPage;