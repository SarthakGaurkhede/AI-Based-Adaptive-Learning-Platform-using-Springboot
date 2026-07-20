import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api.client';
const AiNotesPage = () => {
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const generateMut = useMutation({
    mutationFn: () => api.post('/ai/notes/generate', {
      content
    }),
    onSuccess: res => setNotes(res.data.data || '')
  });
  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const examples = ['Paste your lesson text here…', 'A neural network is a computational model inspired by the human brain…', 'Quantum entanglement is a phenomenon where two particles become correlated…'];
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">AI Notes Generator</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Paste any lesson content — get structured study notes instantly
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div initial={{
        opacity: 0,
        x: -16
      }} animate={{
        opacity: 1,
        x: 0
      }} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-on-surface">Lesson Content</label>
            <span className="text-xs text-on-surface-variant">{content.length} chars</span>
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={examples[0]} rows={16} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-2xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-relaxed placeholder:text-outline" />
          <div className="flex gap-3">
            <motion.button whileTap={{
            scale: 0.97
          }} onClick={() => generateMut.mutate()} disabled={!content.trim() || generateMut.isPending} className="flex-1 py-3 primary-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {generateMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Generating…</> : <><span className="material-symbols-outlined text-lg">auto_awesome</span>Generate Notes</>}
            </motion.button>
            <button onClick={() => setContent('')} className="px-4 py-3 border border-outline-variant text-on-surface-variant rounded-xl text-sm hover:bg-surface-container transition-colors">
              Clear
            </button>
          </div>

          {/* Quick examples */}
          <div>
            <p className="text-xs text-on-surface-variant mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {['Neural Networks', 'Quantum Physics', 'Machine Learning'].map(ex => <button key={ex} onClick={() => setContent(`This lesson covers ${ex}. ${examples[1]}`)} className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors font-medium">
                  {ex}
                </button>)}
            </div>
          </div>
        </motion.div>

        {/* Output */}
        <motion.div initial={{
        opacity: 0,
        x: 16
      }} animate={{
        opacity: 1,
        x: 0
      }} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-on-surface">Generated Notes</label>
            {notes && <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied!' : 'Copy'}
              </button>}
          </div>

          <AnimatePresence mode="wait">
            {generateMut.isPending ? <motion.div key="loading" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="glass-card rounded-2xl border border-black/5 p-6 h-[400px] flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 primary-gradient rounded-2xl flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-white text-3xl">auto_awesome</span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-on-surface">Generating your notes…</p>
                  <p className="text-xs text-on-surface-variant mt-1">AI is reading and summarising your content</p>
                </div>
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map(d => <motion.div key={d} className="w-2 h-2 rounded-full bg-primary" animate={{
                y: [0, -6, 0]
              }} transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: d
              }} />)}
                </div>
              </motion.div> : notes ? <motion.div key="notes" initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} className="glass-card rounded-2xl border border-primary/20 p-6 h-[400px] overflow-y-auto">
                <pre className="text-sm text-on-surface whitespace-pre-wrap font-sans leading-relaxed">{notes}</pre>
              </motion.div> : <motion.div key="empty" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="glass-card rounded-2xl border border-black/5 p-6 h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">description</span>
                <div>
                  <p className="font-semibold text-on-surface-variant">Notes appear here</p>
                  <p className="text-xs text-outline mt-1">Paste your content and click Generate</p>
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Download button */}
          {notes && <motion.button initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} whileTap={{
          scale: 0.97
        }} onClick={() => {
          const blob = new Blob([notes], {
            type: 'text/plain'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'study-notes.txt';
          a.click();
        }} className="w-full py-2.5 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Download Notes
            </motion.button>}
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }} className="glass-card rounded-2xl border border-black/5 p-5">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Tips for better notes</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[{
          icon: 'menu_book',
          tip: 'Paste full lesson text for comprehensive notes'
        }, {
          icon: 'format_list',
          tip: 'The AI structures output into summary + key concepts'
        }, {
          icon: 'quiz',
          tip: 'Generated notes include revision questions at the end'
        }].map(t => <div key={t.tip} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-lg shrink-0">{t.icon}</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">{t.tip}</p>
            </div>)}
        </div>
      </motion.div>
    </div>;
};
export default AiNotesPage;