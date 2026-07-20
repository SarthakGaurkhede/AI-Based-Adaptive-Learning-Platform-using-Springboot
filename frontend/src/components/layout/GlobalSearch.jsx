import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
import { useAuth } from '../../contexts/AuthContext';

// Debounces the raw input so we don't hit the API on every keystroke.
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
const GlobalSearch = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const {
    data,
    isFetching
  } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`).then(r => r.data),
    enabled: debouncedQuery.trim().length >= 2
  });
  const results = data?.data || [];
  useEffect(() => {
    const onClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  const goToResult = r => {
    setOpen(false);
    setQuery('');
    if (user?.role === 'admin') {
      navigate('/admin/courses');
      return;
    }
    const courseBasePath = user?.role === 'teacher' ? '/teacher/courses' : '/student/courses';
    if (r.index === 'courses') navigate(`${courseBasePath}/${r.id}`);else if (r.index === 'topics' && r.courseId) navigate(`${courseBasePath}/${r.courseId}`);
  };
  return <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">search</span>
        <input value={query} onChange={e => {
        setQuery(e.target.value);
        setOpen(true);
      }} onFocus={() => query && setOpen(true)} placeholder="Search courses & topics…" className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
      </div>
      <AnimatePresence>
        {open && debouncedQuery.trim().length >= 2 && <motion.div initial={{
        opacity: 0,
        y: 8
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: 8
      }} className="absolute left-0 right-0 top-full mt-2 glass-card rounded-2xl border border-outline-variant/30 shadow-glass-lg max-h-96 overflow-y-auto z-50">
            {isFetching ? <div className="p-4 text-center text-sm text-on-surface-variant">Searching…</div> : results.length === 0 ? <div className="p-4 text-center text-sm text-on-surface-variant">No results for "{debouncedQuery}"</div> : <ul className="p-2">
                {results.map(r => <li key={`${r.index}-${r.id}`}>
                    <button onClick={() => goToResult(r)} className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-primary text-lg mt-0.5">{r.index === 'courses' ? 'menu_book' : 'topic'}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-on-surface truncate">{r.title}</span>
                        {r.index === 'courses' ? <span className="block text-xs text-on-surface-variant truncate">{r.category} · {r.level}</span> : <span className="block text-xs text-on-surface-variant truncate">in {r.courseTitle}</span>}
                      </span>
                    </button>
                  </li>)}
              </ul>}
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default GlobalSearch;
