import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const fadeUp = (delay = 0) => ({
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.4,
    delay,
    ease: [0.22, 1, 0.36, 1]
  }
});
const StatCard = ({
  icon,
  label,
  value,
  color = 'text-primary',
  sub
}) => <motion.div {...fadeUp(0.05)} className="glass-card rounded-2xl p-5 border border-black/5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10`}>
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
        {sub && <p className="text-xs text-primary font-medium mt-1">{sub}</p>}
      </div>
    </motion.div>;
const StudentDashboard = () => {
  const {
    user
  } = useAuth();
  const {
    data: gaps
  } = useQuery({
    queryKey: ['knowledge-gaps'],
    queryFn: () => api.get('/knowledge-gaps').then(r => r.data),
    staleTime: 60_000
  });
  const {
    data: recommendations
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations').then(r => r.data),
    staleTime: 60_000
  });
  const {
    data: analytics
  } = useQuery({
    queryKey: ['student-analytics'],
    queryFn: () => api.get('/users/me/analytics').then(r => r.data),
    staleTime: 60_000
  });
  const topGaps = (gaps?.data || []).slice(0, 3);
  const topRecs = (recommendations?.data || []).slice(0, 3);
  return <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Hero ──────────────────────────── */}
      <motion.div {...fadeUp()} className="relative overflow-hidden rounded-2xl primary-gradient p-6 md:p-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-white/70 text-sm font-medium">Welcome back 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold">{user?.name || 'Student'}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">local_fire_department</span>
                {user?.streak?.current || 0} day streak
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">star</span>
                Level {user?.level || 1} · {user?.xp || 0} XP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">psychology</span>
                Knowledge Score: {user?.knowledgeScore || 0}
              </span>
            </div>
          </div>
          <Link to="/student/courses" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-5 py-3 rounded-xl font-medium text-sm shrink-0 backdrop-blur-sm">
            <span className="material-symbols-outlined text-lg">play_circle</span>
            Continue Learning
          </Link>
        </div>
        {/* XP progress */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>Progress to Level {(user?.level || 1) + 1}</span>
            <span>{user?.xp || 0} / {(user?.level || 1) * 1000} XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{
            width: 0
          }} animate={{
            width: `${Math.min((user?.xp || 0) / ((user?.level || 1) * 1000) * 100, 100)}%`
          }} transition={{
            duration: 1,
            delay: 0.3,
            ease: 'easeOut'
          }} className="h-full bg-white rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="school" label="Courses Enrolled" value={analytics?.data?.coursesEnrolled || 0} />
        <StatCard icon="check_circle" label="Courses Completed" value={analytics?.data?.coursesCompleted || 0} color="text-green-500" />
        <StatCard icon="quiz" label="Avg Quiz Score" value={`${analytics?.data?.avgQuizScore || 0}%`} color="text-secondary" />
        <StatCard icon="schedule" label="Study Hours" value={`${analytics?.data?.studyHours || 0}h`} color="text-orange-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Knowledge Gaps ────────────────── */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-error/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-error">psychology_alt</span>
              </div>
              <div>
                <h2 className="font-semibold text-on-surface">Knowledge Gaps</h2>
                <p className="text-xs text-on-surface-variant">Topics needing attention</p>
              </div>
            </div>
            <Link to="/student/knowledge-gaps" className="text-primary text-xs font-medium hover:underline">View all</Link>
          </div>
          <div className="p-5 space-y-4">
            {topGaps.length === 0 ? <div className="py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl block mb-2 text-green-400">check_circle</span>
                No critical gaps right now. Keep it up!
              </div> : topGaps.map((gap, i) => <div key={gap._id} className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${gap.severity === 'high' ? 'bg-error' : gap.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{gap.topicId?.title || 'Unknown Topic'}</p>
                  <p className="text-xs text-on-surface-variant">{gap.courseId?.title} · Priority #{i + 1}</p>
                  <div className="mt-1.5 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${gap.severity === 'high' ? 'bg-error' : gap.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} style={{
                  width: `${100 - gap.confidenceScore}%`
                }} />
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0
                  ${gap.severity === 'high' ? 'bg-error/10 text-error' : gap.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300'}`}>
                  {gap.severity}
                </span>
              </div>)}
          </div>
          <div className="px-5 pb-5">
            <Link to="/student/study-plan" className="w-full flex items-center justify-center gap-2 py-3 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Generate AI Study Plan
            </Link>
          </div>
        </motion.div>

        {/* ── AI Recommendations ────────────── */}
        <motion.div {...fadeUp(0.15)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span>
              </div>
              <h2 className="font-semibold text-on-surface">AI Picks</h2>
            </div>
            <Link to="/student/recommendations" className="text-primary text-xs font-medium hover:underline">All</Link>
          </div>
          <div className="p-4 space-y-3">
            {topRecs.length === 0 ? <p className="py-6 text-center text-on-surface-variant text-sm">No recommendations yet. Complete a quiz to get started!</p> : topRecs.map(rec => <div key={rec._id} className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-lg">
                    {rec.type === 'course' ? 'school' : rec.type === 'resource' ? 'article' : 'lightbulb'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface line-clamp-2">{rec.reason}</p>
                    <span className="text-xs text-primary font-medium mt-1 inline-flex items-center gap-1">
                      {rec.type} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>)}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Quiz Attempts ──────────── */}
      <motion.div {...fadeUp(0.18)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">history</span>
            </div>
            <h2 className="font-semibold text-on-surface">Recent Quiz Attempts</h2>
          </div>
        </div>
        <div className="divide-y divide-black/5">
          {(analytics?.data?.recentAttempts || []).length === 0 ? <p className="py-8 text-center text-on-surface-variant text-sm">No quizzes taken yet. Take one to see your results here!</p> : analytics.data.recentAttempts.map(a => <div key={a._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.passed ? 'bg-green-100 dark:bg-green-400/10' : 'bg-error/10'}`}>
                  <span className={`material-symbols-outlined text-lg ${a.passed ? 'text-green-500' : 'text-error'}`}>{a.passed ? 'check_circle' : 'cancel'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{a.quizTitle}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(a.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${a.passed ? 'text-green-600 dark:text-green-400' : 'text-error'}`}>{a.percentScore}%</span>
              </div>)}
        </div>
      </motion.div>

      {/* ── Quick actions ─────────────────── */}
      <motion.div {...fadeUp(0.2)}>
        <h2 className="font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{
          label: 'AI Tutor',
          icon: 'smart_toy',
          path: '/student/ai-tutor',
          color: 'from-primary to-secondary'
        }, {
          label: 'Flashcards',
          icon: 'style',
          path: '/student/flashcards',
          color: 'from-secondary to-purple-500'
        }, {
          label: 'Leaderboard',
          icon: 'emoji_events',
          path: '/student/leaderboards',
          color: 'from-orange-400 to-red-500'
        }, {
          label: 'Analytics',
          icon: 'bar_chart',
          path: '/student/analytics',
          color: 'from-green-400 to-teal-500'
        }].map(a => <Link key={a.label} to={a.path} className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${a.color} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95`}>
              <span className="material-symbols-outlined text-2xl">{a.icon}</span>
              <span className="font-medium text-sm">{a.label}</span>
            </Link>)}
        </div>
      </motion.div>
    </div>;
};
export default StudentDashboard;