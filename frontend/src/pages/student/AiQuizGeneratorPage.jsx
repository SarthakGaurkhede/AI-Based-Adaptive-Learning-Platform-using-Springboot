import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api.client';
const AiQuizGeneratorPage = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDiff] = useState('mixed');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const generateMut = useMutation({
    mutationFn: () => api.post('/ai/tutor/message', {
      message: `Generate ${count} ${difficulty} practice quiz questions about "${topic}". Return ONLY a JSON array with no markdown: [{"text":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"...","difficulty":"easy"}]`
    }),
    onSuccess: res => {
      try {
        const raw = res.data.response || '';
        const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setQuestions(Array.isArray(parsed) ? parsed : []);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
      } catch {
        setQuestions([]);
      }
    }
  });
  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };
  const pct = questions.length ? Math.round(score / questions.length * 100) : 0;
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">AI Quiz Generator</h1>
        <p className="text-on-surface-variant text-sm mt-1">Generate practice quizzes on any topic instantly</p>
      </motion.div>

      {/* Config form */}
      <motion.div initial={{
      opacity: 0,
      y: 12
    }} animate={{
      opacity: 1,
      y: 0
    }} className="glass-card rounded-2xl border border-black/5 p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Topic *</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">psychology</span>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Backpropagation, Quantum Entanglement, Recursion…" className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-outline" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Questions</label>
            <select value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
              {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Difficulty</label>
            <select value={difficulty} onChange={e => setDiff(e.target.value)} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
              {['easy', 'medium', 'hard', 'mixed'].map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>
        </div>

        <motion.button whileTap={{
        scale: 0.97
      }} onClick={() => generateMut.mutate()} disabled={!topic.trim() || generateMut.isPending} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
          {generateMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Generating…</> : <><span className="material-symbols-outlined text-lg">auto_awesome</span>Generate Quiz</>}
        </motion.button>
      </motion.div>

      {/* Quiz questions */}
      <AnimatePresence>
        {questions.length > 0 && <motion.div key="quiz" initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-on-surface">{questions.length} Questions — {topic}</p>
              {!submitted && <button onClick={() => {
            setQuestions([]);
            setAnswers({});
          }} className="text-xs text-on-surface-variant hover:text-error transition-colors">
                  Clear
                </button>}
            </div>

            {/* Score result */}
            {submitted && <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} className={`rounded-2xl p-5 text-center border ${pct >= 70 ? 'bg-green-50 border-green-200 dark:bg-green-400/10 dark:border-green-400/20' : 'bg-error/5 border-error/20'}`}>
                <p className={`text-3xl font-black ${pct >= 70 ? 'text-green-600 dark:text-green-400' : 'text-error'}`}>{pct}%</p>
                <p className="text-sm font-semibold text-on-surface mt-1">{score}/{questions.length} correct</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {pct >= 70 ? 'Great job! Topic mastered.' : 'Keep practising — check the explanations below.'}
                </p>
              </motion.div>}

            {/* Questions */}
            {questions.map((q, i) => {
          const chosen = answers[i];
          const isRight = chosen === q.correctAnswer;
          return <motion.div key={i} initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: i * 0.06
          }} className="glass-card rounded-2xl border border-black/5 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                      ${submitted ? isRight ? 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-300' : 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-on-surface leading-snug">{q.text}</p>
                  </div>

                  <div className="space-y-2 ml-10">
                    {(q.options || []).map((opt, oi) => {
                const isSelected = chosen === opt;
                const isCorrect = opt === q.correctAnswer;
                let cls = 'border-outline-variant text-on-surface hover:border-primary/30 hover:bg-primary/5';
                if (submitted) {
                  if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300';else if (isSelected) cls = 'border-error bg-error/5 text-error';else cls = 'border-outline-variant text-on-surface-variant opacity-50';
                } else if (isSelected) cls = 'border-primary bg-primary/5 text-primary';
                return <button key={oi} onClick={() => !submitted && setAnswers(a => ({
                  ...a,
                  [i]: opt
                }))} disabled={submitted} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm transition-all ${cls}`}>
                          <span className="font-bold shrink-0">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                          {submitted && isCorrect && <span className="material-symbols-outlined text-green-500 ml-auto text-lg" style={{
                    fontVariationSettings: "'FILL' 1"
                  }}>check_circle</span>}
                        </button>;
              })}
                  </div>

                  {/* Explanation */}
                  {submitted && q.explanation && <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="ml-10 p-3 bg-surface-container rounded-xl text-xs text-on-surface-variant leading-relaxed">
                      <span className="font-semibold text-on-surface">Explanation: </span>{q.explanation}
                    </motion.div>}
                </motion.div>;
        })}

            {/* Submit button */}
            {!submitted && <motion.button initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} whileTap={{
          scale: 0.97
        }} onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors shadow-md shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Submit Answers ({Object.keys(answers).length}/{questions.length} answered)
              </motion.button>}

            {submitted && <button onClick={() => {
          setSubmitted(false);
          setAnswers({});
          generateMut.mutate();
        }} className="w-full py-3 primary-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                Generate New Quiz
              </button>}
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default AiQuizGeneratorPage;