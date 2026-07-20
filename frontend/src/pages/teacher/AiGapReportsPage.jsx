import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api.client';
const severityColor = {
  high: {
    bar: 'bg-error',
    badge: 'bg-error/10 text-error'
  },
  medium: {
    bar: 'bg-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300'
  },
  low: {
    bar: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300'
  }
};

// Builds a CSV string and triggers a browser download — no backend round
// trip needed since we already have the aggregated data client-side.
function downloadCsv(rows, filename) {
  const header = ['Topic', 'Course', 'Students Affected', 'Severity', 'Avg Mastery %'];
  const lines = [header.join(','), ...rows.map(r => [`"${r.topic.replace(/"/g, '""')}"`, `"${(r.courseTitle || '').replace(/"/g, '""')}"`, r.students, r.severity, r.avgMastery].join(','))];
  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
const AiGapReportsPage = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [notifiedTopic, setNotifiedTopic] = useState(null);
  const {
    data: coursesData
  } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get('/courses?mine=true&limit=100').then(r => r.data)
  });
  const courses = coursesData?.data || [];
  const {
    data: gapsData,
    isLoading
  } = useQuery({
    queryKey: ['class-gaps', selectedCourse],
    queryFn: () => api.get(`/analytics/class-gaps${selectedCourse !== 'all' ? `?courseId=${selectedCourse}` : ''}`).then(r => r.data)
  });
  const {
    data: analyticsData
  } = useQuery({
    queryKey: ['teacher-analytics-for-gaps'],
    queryFn: () => api.get('/users/me/analytics').then(r => r.data)
  });
  const classGaps = gapsData?.data || [];
  const totalStudents = analyticsData?.data?.totalStudents || 0;
  const highCount = classGaps.filter(g => g.severity === 'high').length;
  const medCount = classGaps.filter(g => g.severity === 'medium').length;
  const topGap = classGaps[0];
  const notifyMut = useMutation({
    mutationFn: ({
      studentIds,
      topic
    }) => api.post('/analytics/class-gaps/notify', {
      studentIds,
      topic
    }),
    onSuccess: (_, variables) => {
      setNotifiedTopic(variables.topic);
      setTimeout(() => setNotifiedTopic(null), 3000);
    }
  });
  const handleExportCsv = () => {
    if (classGaps.length === 0) return;
    downloadCsv(classGaps, `class-gap-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI Gap Reports</h1>
          <p className="text-on-surface-variant text-sm mt-1">Aggregated knowledge gaps across your class</p>
        </div>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{
        label: 'Total Students',
        value: totalStudents,
        icon: 'group',
        color: 'text-primary'
      }, {
        label: 'High Priority Gaps',
        value: highCount,
        icon: 'priority_high',
        color: 'text-error'
      }, {
        label: 'Medium Gaps',
        value: medCount,
        icon: 'warning',
        color: 'text-yellow-500'
      }, {
        label: 'Topics Affected',
        value: classGaps.length,
        icon: 'psychology_alt',
        color: 'text-secondary'
      }].map((s, i) => <motion.div key={s.label} initial={{
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

      {/* Gap table */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h2 className="font-semibold text-on-surface">Class Knowledge Gaps — Ranked by Impact</h2>
          <button onClick={handleExportCsv} disabled={classGaps.length === 0} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline disabled:opacity-40 disabled:no-underline">
            <span className="material-symbols-outlined text-sm">download</span>Export CSV
          </button>
        </div>
        {isLoading ? <div className="p-8 text-center text-sm text-on-surface-variant">Loading gap data…</div> : classGaps.length === 0 ? <div className="p-10 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant block">check_circle</span>
            <p className="text-sm text-on-surface-variant">No open knowledge gaps right now — nice work!</p>
          </div> : <div className="divide-y divide-black/5">
            {classGaps.map((gap, i) => {
          const cfg = severityColor[gap.severity];
          const affectedPct = totalStudents ? Math.round(gap.students / totalStudents * 100) : 0;
          return <motion.div key={gap.topicId} initial={{
            opacity: 0,
            x: -8
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: i * 0.05
          }} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container transition-colors">
                  <span className="text-sm font-bold text-on-surface-variant w-6 shrink-0">#{i + 1}</span>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-on-surface text-sm">{gap.topic}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                        {gap.severity}
                      </span>
                      {gap.courseTitle && <span className="text-xs text-on-surface-variant">{gap.courseTitle}</span>}
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden max-w-xs">
                      <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${100 - gap.avgMastery}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.05
                }} className={`h-full rounded-full ${cfg.bar}`} />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Avg mastery: <span className="font-medium text-on-surface">{gap.avgMastery}%</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-on-surface text-sm">{gap.students}</p>
                    <p className="text-xs text-on-surface-variant">students ({affectedPct}%)</p>
                  </div>

                  <div className="flex gap-2 shrink-0 items-center">
                    {notifiedTopic === gap.topic ? <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">check</span>Notified
                      </span> : <>
                        <button onClick={() => navigate('/teacher/quiz-builder')} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Create remediation quiz">
                          <span className="material-symbols-outlined text-lg">quiz</span>
                        </button>
                        <button onClick={() => notifyMut.mutate({
                    studentIds: gap.studentIds,
                    topic: gap.topic
                  })} disabled={notifyMut.isPending} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-secondary transition-colors disabled:opacity-40" title="Send notification to affected students">
                          <span className="material-symbols-outlined text-lg">notifications</span>
                        </button>
                      </>}
                  </div>
                </motion.div>;
        })}
          </div>}
      </motion.div>

      {/* AI Insight */}
      {topGap && <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }} className="glass-card rounded-2xl border border-primary/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h3 className="font-semibold text-on-surface">Teaching Recommendation</h3>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <span className="font-semibold text-on-surface">{topGap.students} student{topGap.students !== 1 ? 's' : ''}</span> {topGap.students !== 1 ? 'are' : 'is'} struggling with <span className="font-semibold text-on-surface">{topGap.topic}</span> ({topGap.avgMastery}% avg mastery).
            Consider scheduling a revision session or creating a targeted remediation quiz for this topic.
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => navigate('/teacher/quiz-builder')} className="flex items-center gap-2 px-4 py-2 primary-gradient text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-base">quiz</span>Generate Remediation Quiz
            </button>
            <AnimatePresence mode="wait">
              {notifiedTopic === topGap.topic ? <motion.span key="done" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-base">check_circle</span>Students notified
                </motion.span> : <motion.button key="btn" onClick={() => notifyMut.mutate({
            studentIds: topGap.studentIds,
            topic: topGap.topic
          })} disabled={notifyMut.isPending} className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-medium hover:bg-surface-container transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-base">notifications</span>{notifyMut.isPending ? 'Notifying…' : 'Notify Students'}
                </motion.button>}
            </AnimatePresence>
          </div>
        </motion.div>}
    </div>;
};
export default AiGapReportsPage;
