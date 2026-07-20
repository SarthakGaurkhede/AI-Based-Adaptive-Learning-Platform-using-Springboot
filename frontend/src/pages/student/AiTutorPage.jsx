import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api.client';
const AiTutorPage = () => {
  const [messages, setMessages] = useState([{
    id: '1',
    role: 'assistant',
    content: 'Hi! I\'m your AI Learning Assistant, grounded in your course material. Ask me anything about your enrolled courses — I\'ll give you answers backed by your own uploaded resources.',
    citations: [],
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const res = await api.post('/ai/tutor/message', {
        message: text
      });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response || res.data.message,
        citations: res.data.citations || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const suggestions = ['Explain quantum superposition', 'What are my knowledge gaps?', 'Create a study plan for me', 'Summarize the last lesson'];
  return <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-surface">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 nav-glass border-b border-black/5 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl" style={{
              fontVariationSettings: "'FILL' 1"
            }}>smart_toy</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">AI Learning Assistant</p>
              <p className="text-xs text-green-500 font-medium">● Online · RAG-powered</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant" title="New chat">
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant" title="History">
              <span className="material-symbols-outlined text-xl">history</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Suggestions (show only if one message) */}
          {messages.length === 1 && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} className="grid grid-cols-2 gap-3 mb-6">
              {suggestions.map(s => <button key={s} onClick={() => {
            setInput(s);
            inputRef.current?.focus();
          }} className="glass-card border border-black/5 rounded-xl px-4 py-3 text-left text-sm text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all">
                  {s}
                </button>)}
            </motion.div>}

          <AnimatePresence initial={false}>
            {messages.map(msg => <motion.div key={msg.id} initial={{
            opacity: 0,
            y: 16,
            scale: 0.97
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} transition={{
            duration: 0.3
          }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>

                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-white text-sm" style={{
                fontVariationSettings: "'FILL' 1"
              }}>smart_toy</span>
                  </div>}

                <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user' ? 'user-bubble bg-gradient-to-br from-primary to-secondary text-white rounded-br-md' : 'ai-bubble glass-card border border-black/5 text-on-surface rounded-bl-md'}`}>
                    {msg.content}
                  </div>
                  {msg.citations && msg.citations.length > 0 && <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          📄 {c}
                        </span>)}
                    </div>}
                  <p className="text-[10px] text-on-surface-variant px-1">
                    {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </p>
                </div>

                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                  </div>}
              </motion.div>)}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && <motion.div initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-sm" style={{
              fontVariationSettings: "'FILL' 1"
            }}>smart_toy</span>
              </div>
              <div className="ai-bubble glass-card border border-black/5 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1 items-center h-4">
                  {[0, 0.2, 0.4].map(d => <motion.div key={d} className="w-2 h-2 rounded-full bg-primary" animate={{
                y: [0, -5, 0]
              }} transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: d
              }} />)}
                </div>
              </div>
            </motion.div>}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-4 nav-glass border-t border-black/5 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 glass-card border border-outline-variant rounded-2xl px-4 py-3 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask anything about your course material…" rows={1} className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline resize-none focus:outline-none max-h-32 leading-relaxed" style={{
            minHeight: '24px'
          }} />
            <div className="flex items-center gap-2 shrink-0">
              <button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors" title="Attach file">
                <span className="material-symbols-outlined text-xl">attach_file</span>
              </button>
              <motion.button onClick={sendMessage} disabled={!input.trim() || isTyping} whileTap={{
              scale: 0.92
            }} className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                <span className="material-symbols-outlined text-lg">send</span>
              </motion.button>
            </div>
          </div>
          <p className="text-[10px] text-outline text-center mt-2">AI responses are grounded in your uploaded course material via RAG.</p>
        </div>
      </div>
    </div>;
};
export default AiTutorPage;