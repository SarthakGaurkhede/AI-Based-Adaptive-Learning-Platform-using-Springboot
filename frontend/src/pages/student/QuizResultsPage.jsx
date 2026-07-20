import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const QuizResultsPage = () => {
  const {
    quizId,
    attemptId
  } = useParams();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['quiz-attempt', attemptId],
    queryFn: () => api.get(`/quizzes/${quizId}/attempts/${attemptId}`).then(r => r.data)
  });
  const attempt = data?.data;
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-surface">
      <div className="animate-pulse text-center space-y-3">
        <div className="w-16 h-16 primary-gradient rounded-2xl mx-auto" />
        <p className="text-on-surface-variant">Loading results…</p>
      </div>
    </div>;
  if (!attempt) return null;
  const pct = attempt.percentScore ?? 0;
  const passed = attempt.passed;
  const correct = attempt.answers?.filter(a => a.isCorrect).length || 0;
  const total = attempt.answers?.length || 0;
  const ringColor = passed ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 52;
  const dash = circumference - pct / 100 * circumference;
  return <div className="min-h-screen bg-surface p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Score hero */}
        <motion.div initial={{
        opacity: 0,
        y: 24
      }} animate={{
        opacity: 1,
        y: 0
      }} className={`rounded-2xl p-8 text-center border border-black/5 glass-card`}>
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container" />
              <motion.circle cx="60" cy="60" r="52" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round" initial={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference
            }} animate={{
              strokeDashoffset: dash
            }} transition={{
              duration: 1.2,
              delay: 0.3,
              ease: 'easeOut'
            }} style={{
              strokeDasharray: circumference
            }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-on-surface">{pct}%</span>
              <span className="text-xs text-on-surface-variant">Score</span>
            </div>
          </div>

          <motion.div initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.5
        }}>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3
              ${passed ? 'bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300' : 'bg-error/10 text-error'}`}>
              <span className="material-symbols-outlined text-lg">{passed ? 'check_circle' : 'cancel'}</span>
              {passed ? 'Passed!' : 'Not Passed'}
            </span>
          </motion.div>

          <h1 className="text-2xl font-bold text-on-surface">{attempt.quizId?.title || 'Quiz'}</h1>
          <p className="text-on-surface-variant mt-1">
            {correct} of {total} correct · {attempt.score} / {attempt.quizId?.totalMarks} marks
          </p>

          {passed && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.7
        }} className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium">
              <span className="material-symbols-outlined">bolt</span>+50 XP earned
            </motion.div>}
        </motion.div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-4">
          {[{
          label: 'Correct',
          value: correct,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-400/10'
        }, {
          label: 'Incorrect',
          value: total - correct,
          color: 'text-error',
          bg: 'bg-error/10'
        }, {
          label: 'Pass Mark',
          value: `${attempt.quizId?.passPercent || 60}%`,
          color: 'text-primary',
          bg: 'bg-primary/10'
        }].map(s => <motion.div key={s.label} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.2
        }} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </motion.div>)}
        </div>

        {/* Per-question review */}
        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h2 className="font-semibold text-on-surface">Question Review</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">See what you got right and wrong</p>
          </div>
          <div className="divide-y divide-black/5">
            {attempt.answers?.map((ans, i) => {
            const q = ans.questionId;
            return <div key={i} className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                      ${ans.isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300' : 'bg-error/10 text-error'}`}>
                      {ans.isCorrect ? '✓' : '✗'}
                    </span>
                    <p className="text-sm font-medium text-on-surface leading-snug">{q?.text || `Question ${i + 1}`}</p>
                  </div>
                  <div className="ml-9 space-y-1 text-xs">
                    <p className="text-on-surface-variant">
                      Your answer: <span className={ans.isCorrect ? 'text-green-600 font-medium' : 'text-error font-medium'}>{ans.response || '—'}</span>
                    </p>
                    {!ans.isCorrect && q?.correctAnswer && <p className="text-on-surface-variant">Correct answer: <span className="text-green-600 font-medium">{q.correctAnswer}</span></p>}
                    {q?.explanation && <p className="mt-2 p-3 bg-surface-container rounded-xl text-on-surface-variant leading-relaxed">{q.explanation}</p>}
                  </div>
                </div>;
          })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          {!passed && <Link to={`/student/quizzes/${quizId}`} className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined">refresh</span>Retake Quiz
            </Link>}
          <Link to="/student/knowledge-gaps" className="flex-1 flex items-center justify-center gap-2 py-3.5 primary-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
            <span className="material-symbols-outlined">psychology_alt</span>View Knowledge Gaps
          </Link>
          <Link to="/student/dashboard" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-surface-container text-on-surface rounded-xl font-medium hover:bg-surface-container-high transition-colors border border-black/5">
            <span className="material-symbols-outlined">dashboard</span>Back to Dashboard
          </Link>
        </div>
      </div>
    </div>;
};
export default QuizResultsPage;