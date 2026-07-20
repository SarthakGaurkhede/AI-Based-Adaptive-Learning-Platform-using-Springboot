import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const FlashcardsPage = () => {
  const qc = useQueryClient();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({
    topicTitle: '',
    courseId: '',
    topicId: '',
    count: 10
  });
  const [showGenForm, setShowGenForm] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => api.get('/flashcards').then(r => r.data)
  });
  const {
    data: enrolledData
  } = useQuery({
    queryKey: ['enrolled-courses-for-flashcards'],
    queryFn: () => api.get('/courses/enrolled').then(r => r.data)
  });
  const enrolledCourses = (enrolledData?.data || []).map(e => e.courseId || e).filter(Boolean);
  const {
    data: topicsData
  } = useQuery({
    queryKey: ['course-topics-for-flashcards', genForm.courseId],
    queryFn: () => api.get(`/courses/${genForm.courseId}/topics`).then(r => r.data),
    enabled: !!genForm.courseId
  });
  const topics = topicsData?.data || [];
  const reviewMut = useMutation({
    mutationFn: ({
      id,
      quality
    }) => api.patch(`/flashcards/${id}/review`, {
      quality
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['flashcards']
    })
  });
  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/flashcards/${id}`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['flashcards']
    })
  });
  const cards = data?.data || [];
  const current = cards[currentIdx];
  const handleReview = quality => {
    if (!current) return;
    reviewMut.mutate({
      id: current._id,
      quality
    });
    setFlipped(false);
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setSessionComplete(true);
    }
  };
  const handleDiscard = () => {
    if (!current) return;
    deleteMut.mutate(current._id);
    setFlipped(false);
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setSessionComplete(true);
    }
  };
  const handleGenerate = async () => {
    if (!genForm.topicTitle || !genForm.courseId) return;
    setGenerating(true);
    try {
      await api.post('/flashcards/generate', genForm);
      qc.invalidateQueries({
        queryKey: ['flashcards']
      });
      setShowGenForm(false);
      setCurrentIdx(0);
      setSessionComplete(false);
    } finally {
      setGenerating(false);
    }
  };
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-surface">
      <div className="animate-pulse w-16 h-16 primary-gradient rounded-2xl mx-auto" />
    </div>;
  return <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Flashcards</h1>
          <p className="text-on-surface-variant text-sm mt-1">{cards.length} cards due for review</p>
        </div>
        <button onClick={() => setShowGenForm(!showGenForm)} className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-lg">auto_awesome</span>Generate AI Cards
        </button>
      </div>

      {/* Generate form */}
      <AnimatePresence>
        {showGenForm && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="glass-card rounded-2xl p-5 border border-black/5 space-y-4">
            <h3 className="font-semibold text-on-surface">Generate Flashcard Deck</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Course</label>
                <select value={genForm.courseId} onChange={e => setGenForm(f => ({
              ...f,
              courseId: e.target.value,
              topicId: ''
            }))} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                  <option value="">Select a course…</option>
                  {enrolledCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Week / Topic</label>
                <select value={genForm.topicId} onChange={e => {
              const t = topics.find(t => t._id === e.target.value);
              setGenForm(f => ({
                ...f,
                topicId: e.target.value,
                topicTitle: t?.title || f.topicTitle
              }));
            }} disabled={!genForm.courseId} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none disabled:opacity-50">
                  <option value="">{genForm.courseId ? 'Select a topic…' : 'Select a course first'}</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Focus (optional refinement)</label>
                <input value={genForm.topicTitle} onChange={e => setGenForm(f => ({
              ...f,
              topicTitle: e.target.value
            }))} placeholder="e.g. Quantum Mechanics basics" className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Number of Cards</label>
                <select value={genForm.count} onChange={e => setGenForm(f => ({
              ...f,
              count: parseInt(e.target.value)
            }))} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
              {generating ? <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Generating…</> : <><span className="material-symbols-outlined text-lg">auto_awesome</span>Generate</>}
            </button>
          </motion.div>}
      </AnimatePresence>

      {/* Session complete */}
      {sessionComplete ? <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="glass-card rounded-2xl p-10 border border-black/5 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-green-400 block">check_circle</span>
          <h2 className="text-xl font-bold text-on-surface">Session Complete!</h2>
          <p className="text-on-surface-variant text-sm">You've reviewed all due cards. Great work!</p>
          <button onClick={() => {
        setCurrentIdx(0);
        setSessionComplete(false);
        setFlipped(false);
      }} className="px-6 py-3 primary-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
            Review Again
          </button>
        </motion.div> : cards.length === 0 ? <div className="py-20 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary block">style</span>
          <p className="font-semibold text-on-surface">No cards due for review</p>
          <p className="text-on-surface-variant text-sm">Generate a new deck or come back later.</p>
        </div> : <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <motion.div animate={{
            width: `${currentIdx / cards.length * 100}%`
          }} transition={{
            duration: 0.3
          }} className="h-full primary-gradient rounded-full" />
            </div>
            <span className="text-xs text-on-surface-variant font-medium">{currentIdx + 1}/{cards.length}</span>
          </div>

          {/* Card */}
          <div className="perspective-1000 h-72 cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <AnimatePresence mode="wait">
              <motion.div key={`${currentIdx}-${flipped}`} initial={{
            rotateY: flipped ? -90 : 90,
            opacity: 0
          }} animate={{
            rotateY: 0,
            opacity: 1
          }} exit={{
            rotateY: flipped ? 90 : -90,
            opacity: 0
          }} transition={{
            duration: 0.3
          }} className={`h-full glass-card rounded-2xl border border-black/5 p-8 flex flex-col items-center justify-center text-center shadow-glass-lg
                  ${flipped ? 'bg-primary/5' : ''}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider mb-4
                  ${flipped ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {flipped ? 'Answer' : 'Question'} · {current?.difficulty}
                </span>
                <p className="text-lg font-medium text-on-surface leading-relaxed">
                  {flipped ? current?.answer : current?.question}
                </p>
                {!flipped && <p className="mt-6 text-xs text-on-surface-variant">Tap to reveal answer</p>}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center">
            <button onClick={handleDiscard} disabled={deleteMut.isPending} className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-error transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-base">delete</span>Discard this card
            </button>
          </div>

          {/* Review buttons */}
          {flipped && <motion.div initial={{
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} className="grid grid-cols-4 gap-3">
              {[{
          quality: 0,
          label: 'Again',
          color: 'bg-error/10 text-error border-error/20'
        }, {
          quality: 1,
          label: 'Hard',
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-400/10 dark:text-yellow-300 dark:border-yellow-400/20'
        }, {
          quality: 2,
          label: 'Good',
          color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20'
        }, {
          quality: 3,
          label: 'Easy',
          color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-400/10 dark:text-green-300 dark:border-green-400/20'
        }].map(b => <motion.button key={b.label} whileTap={{
          scale: 0.95
        }} onClick={() => handleReview(b.quality)} className={`py-3 rounded-xl border text-sm font-semibold transition-all ${b.color}`}>
                  {b.label}
                </motion.button>)}
            </motion.div>}
        </>}
    </div>;
};
export default FlashcardsPage;