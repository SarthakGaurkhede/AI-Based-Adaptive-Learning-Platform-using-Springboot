import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const TeacherStudentAnalyticsPage = () => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const {
    data: coursesData
  } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get('/courses?mine=true').then(r => r.data)
  });
  const {
    data: studentData,
    isLoading: loadingStudent
  } = useQuery({
    queryKey: ['student-analytics', selectedStudentId],
    queryFn: () => api.get(`/analytics/student/${selectedStudentId}`).then(r => r.data),
    enabled: !!selectedStudentId
  });
  const {
    data: gapsData
  } = useQuery({
    queryKey: ['student-gaps', selectedStudentId],
    queryFn: () => api.get(`/knowledge-gaps/${selectedStudentId}`).then(r => r.data),
    enabled: !!selectedStudentId
  });
  const courses = coursesData?.data || [];
  const stats = studentData?.data || {};
  const gaps = gapsData?.data || [];
  return <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Student Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-1">View performance and knowledge gaps for individual students</p>
      </motion.div>

      {/* Student ID input */}
      <div className="glass-card rounded-2xl border border-black/5 p-5">
        <label className="text-xs font-semibold text-on-surface-variant block mb-2">Enter Student ID to view their analytics</label>
        <div className="flex gap-3">
          <input type="text" placeholder="Student Object ID…" className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" onChange={e => setSelectedStudentId(e.target.value.trim() || null)} />
          <button className="px-5 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            View
          </button>
        </div>
      </div>

      {selectedStudentId && <div className="grid lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-4">
            {loadingStudent ? <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass-card rounded-2xl border border-black/5 animate-pulse" />)}
              </div> : <>
                <div className="grid grid-cols-2 gap-4">
                  {[{
              label: 'Quizzes Attempted',
              value: stats.quizzesAttempted || 0,
              icon: 'quiz',
              color: 'text-primary'
            }, {
              label: 'Avg Quiz Score',
              value: `${stats.avgQuizScore || 0}%`,
              icon: 'bar_chart',
              color: 'text-secondary'
            }, {
              label: 'Knowledge Score',
              value: stats.knowledgeScore || 0,
              icon: 'psychology',
              color: 'text-green-500'
            }, {
              label: 'Study Streak',
              value: `${stats.streak?.current || 0}🔥`,
              icon: 'local_fire_department',
              color: 'text-orange-500'
            }].map((s, i) => <motion.div key={s.label} initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: i * 0.05
            }} className="glass-card rounded-2xl p-5 border border-black/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-on-surface">{s.value}</p>
                        <p className="text-xs text-on-surface-variant">{s.label}</p>
                      </div>
                    </motion.div>)}
                </div>

                {/* Score history chart */}
                {stats.scoreHistory?.length > 0 && <motion.div initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} className="glass-card rounded-2xl border border-black/5 p-5">
                    <h3 className="font-semibold text-on-surface mb-4">Score History</h3>
                    <div className="flex items-end gap-2 h-32">
                      {stats.scoreHistory.map((s, i) => <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div initial={{
                  height: 0
                }} animate={{
                  height: `${s.score}%`
                }} transition={{
                  duration: 0.5,
                  delay: i * 0.07
                }} className="w-full primary-gradient rounded-t-lg min-h-[4px]" />
                          <span className="text-[10px] text-on-surface-variant">{s.score}%</span>
                        </div>)}
                    </div>
                  </motion.div>}
              </>}
          </div>

          {/* Knowledge gaps */}
          <motion.div initial={{
        opacity: 0,
        x: 16
      }} animate={{
        opacity: 1,
        x: 0
      }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
            <div className="p-5 border-b border-black/5">
              <h3 className="font-semibold text-on-surface">Knowledge Gaps</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{gaps.length} gap{gaps.length !== 1 ? 's' : ''} detected</p>
            </div>
            <div className="divide-y divide-black/5 max-h-80 overflow-y-auto">
              {gaps.length === 0 ? <div className="p-5 text-center text-on-surface-variant text-sm">No gaps detected</div> : gaps.map(g => <div key={g._id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-2 h-8 rounded-full shrink-0 ${g.severity === 'high' ? 'bg-error' : g.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{g.topicId?.title || 'Unknown'}</p>
                    <p className="text-xs text-on-surface-variant">{g.severity} priority</p>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">{g.confidenceScore}%</span>
                </div>)}
            </div>
          </motion.div>
        </div>}

      {!selectedStudentId && <div className="py-16 text-center space-y-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl block">person_search</span>
          <p className="font-semibold text-on-surface">Enter a student ID above</p>
          <p className="text-sm">View their quiz scores, knowledge gaps, and learning progress</p>
        </div>}
    </div>;
};
export default TeacherStudentAnalyticsPage;