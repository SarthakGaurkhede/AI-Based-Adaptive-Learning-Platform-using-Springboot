import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api.client';
const QuizPage = () => {
  const {
    quizId
  } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const {
    data: quizData,
    isLoading
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => api.get(`/quizzes/${quizId}/start`).then(r => {
      setTimeLeft(r.data.timeLimitMinutes * 60);
      return r.data;
    }),
    enabled: !!quizId
  });
  const submitMutation = useMutation({
    mutationFn: payload => api.post(`/quizzes/${quizId}/submit`, payload),
    onSuccess: res => navigate(`/student/quizzes/${quizId}/results/${res.data.attemptId}`)
  });
  const questions = quizData?.questions || [];
  const current = questions[currentIndex];
  const progress = (currentIndex + 1) / Math.max(questions.length, 1) * 100;

  // Timer
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft > 0]);
  const handleSubmit = useCallback(() => {
    const payload = {
      answers: Object.entries(answers).map(([questionId, response]) => ({
        questionId,
        response
      }))
    };
    submitMutation.mutate(payload);
  }, [answers]);
  const formatTime = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const timeColor = timeLeft < 120 ? 'text-error' : timeLeft < 300 ? 'text-yellow-500' : 'text-on-surface';
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-surface">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 primary-gradient rounded-2xl mx-auto flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-white text-3xl">quiz</span>
        </div>
        <p className="text-on-surface-variant">Loading quiz…</p>
      </div>
    </div>;
  if (!current) return null;
  return <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-30 nav-glass border-b border-black/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-base">quiz</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface text-sm truncate">{quizData?.title}</p>
              <p className="text-xs text-on-surface-variant">{currentIndex + 1} of {questions.length}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeColor}`}>
            <span className="material-symbols-outlined text-xl">timer</span>
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
            <motion.div animate={{
            width: `${progress}%`
          }} transition={{
            duration: 0.3
          }} className="h-full primary-gradient rounded-full" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Question navigator */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {questions.map((_, i) => <button key={i} onClick={() => setCurrentIndex(i)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                ${i === currentIndex ? 'primary-gradient text-white shadow-md' : answers[questions[i]?._id] ? 'bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {i + 1}
            </button>)}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.25
        }} className="space-y-6">
            {/* Difficulty badge */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                ${current.difficulty === 'hard' ? 'bg-error/10 text-error' : current.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300' : 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300'}`}>
                {current.difficulty?.charAt(0).toUpperCase() + current.difficulty?.slice(1)}
              </span>
              <span className="text-xs text-on-surface-variant">{current.marks} mark{current.marks !== 1 ? 's' : ''}</span>
            </div>

            {/* Question text */}
            <div className="glass-card rounded-2xl p-6 border border-black/5">
              <p className="text-on-surface font-medium leading-relaxed text-base">{current.text}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {current.options?.map((opt, oi) => {
              const letter = String.fromCharCode(65 + oi);
              const isSelected = answers[current._id] === opt;
              return <motion.button key={oi} whileTap={{
                scale: 0.99
              }} onClick={() => setAnswers(prev => ({
                ...prev,
                [current._id]: opt
              }))} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150
                      ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-transparent bg-surface-container hover:border-outline-variant hover:bg-surface-container-high'}`}>
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all
                      ${isSelected ? 'primary-gradient text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {letter}
                    </span>
                    <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{opt}</span>
                    {isSelected && <span className="material-symbols-outlined text-primary ml-auto text-xl" style={{
                  fontVariationSettings: "'FILL' 1"
                }}>check_circle</span>}
                  </motion.button>;
            })}
            </div>

            {/* True/False */}
            {current.type === 'true_false' && <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map(v => <motion.button key={v} whileTap={{
              scale: 0.97
            }} onClick={() => setAnswers(prev => ({
              ...prev,
              [current._id]: v
            }))} className={`py-4 rounded-2xl border-2 font-semibold text-sm transition-all
                      ${answers[current._id] === v ? 'primary-gradient text-white border-transparent shadow-md' : 'border-outline-variant text-on-surface hover:border-primary/30'}`}>
                    {v === 'True' ? '✓ True' : '✗ False'}
                  </motion.button>)}
              </div>}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
          <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Previous
          </button>

          {currentIndex < questions.length - 1 ? <button onClick={() => setCurrentIndex(i => i + 1)} className="flex items-center gap-2 px-5 py-2.5 primary-gradient rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
              Next <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button> : <motion.button whileTap={{
          scale: 0.97
        }} onClick={handleSubmit} disabled={submitMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-white text-sm font-medium transition-colors shadow-md shadow-green-500/20 disabled:opacity-60">
              {submitMutation.isPending ? 'Submitting…' : <><span className="material-symbols-outlined text-lg">check_circle</span> Submit Quiz</>}
            </motion.button>}
        </div>
      </div>
    </div>;
};
export default QuizPage;