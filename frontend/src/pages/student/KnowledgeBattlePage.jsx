import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.client';
const KnowledgeBattlePage = () => {
  const {
    user,
    token
  } = useAuth();
  const [status, setStatus] = useState('lobby');
  const [battleId, setBattleId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [winner, setWinner] = useState(null);
  const socketRef = useRef(null);
  const {
    data: coursesData
  } = useQuery({
    queryKey: ['courses-for-battle'],
    queryFn: () => api.get('/courses/enrolled').then(r => r.data)
  });
  const createMut = useMutation({
    mutationFn: quizId => api.post('/gamification/battle/create', {
      quizId
    }),
    onSuccess: res => {
      const bid = res.data.data._id;
      setBattleId(bid);
      setStatus('waiting');
      socketRef.current?.publish({
        destination: '/app/battle/join',
        body: JSON.stringify({
          battleId: bid
        })
      });
    }
  });

  // STOMP (SockJS) setup — replaces the previous Socket.IO connection.
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 4000
    });
    client.onConnect = () => {
      if (battleId) {
        client.subscribe(`/topic/battle/${battleId}`, message => {
          const event = JSON.parse(message.body);
          if (event.type === 'battle:start') {
            setQuestions(event.questionIds || []);
            setStatus('active');
            setCurrentQ(0);
            setTimeLeft(15);
          } else if (event.type === 'battle:score_update') {
            const mine = event.scores.find(s => s.userId === user?._id);
            const opp = event.scores.find(s => s.userId !== user?._id);
            if (mine) setMyScore(mine.score);
            if (opp) setOppScore(opp.score);
          } else if (event.type === 'battle:ended') {
            setWinner(event.winnerId);
            setStatus('completed');
          }
        });
      }
    };
    client.activate();
    socketRef.current = client;
    return () => {
      client.deactivate();
    };
  }, [token, user?._id, battleId]);

  // Per-question timer
  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          handleNext();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, currentQ]);
  const handleAnswer = ans => {
    if (selected) return;
    setSelected(ans);
    const q = questions[currentQ];
    if (q?.correctAnswer === ans) {
      setMyScore(s => s + 1);
      socketRef.current?.publish({
        destination: '/app/battle/answer',
        body: JSON.stringify({
          battleId,
          userId: user?._id,
          questionId: q._id,
          answer: ans,
          timeMs: (15 - timeLeft) * 1000
        })
      });
    }
  };
  const handleNext = () => {
    setSelected(null);
    setTimeLeft(15);
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      const winnerId = myScore > oppScore ? user?._id : 'opponent';
      socketRef.current?.publish({
        destination: '/app/battle/complete',
        body: JSON.stringify({
          battleId,
          winnerId
        })
      });
      setStatus('completed');
    }
  };
  const q = questions[currentQ];
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Knowledge Battle</h1>
        <p className="text-on-surface-variant text-sm mt-1">Real-time head-to-head quiz challenge</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Lobby */}
        {status === 'lobby' && <motion.div key="lobby" initial={{
        opacity: 0,
        scale: 0.97
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0
      }} className="glass-card rounded-2xl border border-black/5 p-8 text-center space-y-6">
            <div className="w-24 h-24 primary-gradient rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-white text-5xl">swords</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Challenge a Classmate</h2>
              <p className="text-on-surface-variant text-sm mt-2">Answer the same questions simultaneously. Fastest and most accurate wins!</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[{
            icon: 'timer',
            label: '15 sec',
            sub: 'per question'
          }, {
            icon: 'quiz',
            label: '10 Qs',
            sub: 'randomized'
          }, {
            icon: 'bolt',
            label: '+80 XP',
            sub: 'winner gets'
          }].map(f => <div key={f.label} className="p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-xl block mb-1">{f.icon}</span>
                  <p className="font-bold text-on-surface text-sm">{f.label}</p>
                  <p className="text-xs text-on-surface-variant">{f.sub}</p>
                </div>)}
            </div>
            <motion.button whileTap={{
          scale: 0.97
        }} onClick={() => createMut.mutate('sample-quiz-id')} disabled={createMut.isPending} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">swords</span>
              {createMut.isPending ? 'Creating Battle…' : 'Start Battle'}
            </motion.button>
          </motion.div>}

        {/* Waiting */}
        {status === 'waiting' && <motion.div key="waiting" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="glass-card rounded-2xl border border-black/5 p-10 text-center space-y-5">
            <div className="w-16 h-16 primary-gradient rounded-2xl mx-auto flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-white text-3xl">hourglass_top</span>
            </div>
            <p className="font-bold text-on-surface text-lg">Waiting for opponent…</p>
            <p className="text-on-surface-variant text-sm">Share your battle link or wait for a classmate to join</p>
            <div className="bg-surface-container rounded-xl p-3 text-xs font-mono text-on-surface-variant break-all">
              Battle ID: {battleId}
            </div>
            <div className="flex gap-2 justify-center">
              {[0, 0.2, 0.4].map(d => <motion.div key={d} className="w-3 h-3 rounded-full bg-primary" animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }} transition={{
            repeat: Infinity,
            duration: 1,
            delay: d
          }} />)}
            </div>
          </motion.div>}

        {/* Active battle */}
        {status === 'active' && q && <motion.div key="active" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="space-y-4">
            {/* Score bar */}
            <div className="glass-card rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">
              <div className="text-center">
                <p className="font-bold text-2xl text-primary">{myScore}</p>
                <p className="text-xs text-on-surface-variant">You</p>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-3xl font-black ${timeLeft <= 5 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                  {timeLeft}s
                </div>
                <p className="text-xs text-on-surface-variant">Q{currentQ + 1}/{questions.length}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-2xl text-secondary">{oppScore}</p>
                <p className="text-xs text-on-surface-variant">Opponent</p>
              </div>
            </div>

            {/* Timer bar */}
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <motion.div className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-error' : 'primary-gradient'}`} animate={{
            width: `${timeLeft / 15 * 100}%`
          }} transition={{
            duration: 0.3
          }} />
            </div>

            {/* Question */}
            <div className="glass-card rounded-2xl border border-black/5 p-6">
              <p className="font-semibold text-on-surface leading-relaxed">{q.text || 'Loading question…'}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {(q.options || []).map((opt, i) => <motion.button key={i} whileTap={{
            scale: 0.97
          }} onClick={() => handleAnswer(opt)} className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all
                    ${selected === opt ? opt === q.correctAnswer ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300' : 'border-error bg-error/5 text-error' : selected && opt === q.correctAnswer ? 'border-green-400 bg-green-50 dark:bg-green-400/10' : !selected ? 'border-outline-variant hover:border-primary/50 hover:bg-primary/5 text-on-surface' : 'border-outline-variant text-on-surface-variant opacity-50'}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                </motion.button>)}
            </div>

            {selected && <motion.button initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} onClick={handleNext} whileTap={{
          scale: 0.97
        }} className="w-full py-3 primary-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
              </motion.button>}
          </motion.div>}

        {/* Completed */}
        {status === 'completed' && <motion.div key="completed" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} className="glass-card rounded-2xl border border-black/5 p-10 text-center space-y-5">
            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-xl
              ${winner === user?._id ? 'bg-yellow-400 shadow-yellow-400/20' : 'bg-surface-container'}`}>
              <span className="material-symbols-outlined text-4xl" style={{
            fontVariationSettings: "'FILL' 1"
          }}>
                {winner === user?._id ? 'emoji_events' : 'sentiment_neutral'}
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-on-surface">
                {winner === user?._id ? '🎉 You Won!' : 'Battle Complete!'}
              </p>
              <p className="text-on-surface-variant text-sm mt-1">
                {winner === user?._id ? '+80 XP earned for winning!' : 'Better luck next time!'}
              </p>
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{myScore}</p>
                <p className="text-xs text-on-surface-variant">Your Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-secondary">{oppScore}</p>
                <p className="text-xs text-on-surface-variant">Opponent</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => {
            setStatus('lobby');
            setBattleId(null);
            setMyScore(0);
            setOppScore(0);
          }} className="px-6 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                Play Again
              </button>
              <button onClick={() => window.location.href = '/student/leaderboards'} className="px-6 py-2.5 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition-colors">
                Leaderboard
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default KnowledgeBattlePage;