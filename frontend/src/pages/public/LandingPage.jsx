import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import brain from '../../images/brain.jpg';
import banner from '../../images/banner.png';
const fadeUp = (delay = 0) => ({
  initial: {
    opacity: 0,
    y: 28
  },
  whileInView: {
    opacity: 1,
    y: 0
  },
  viewport: {
    once: true
  },
  transition: {
    duration: 0.5,
    delay,
    ease: [0.22, 1, 0.36, 1]
  }
});
const features = [{
  icon: 'psychology_alt',
  title: 'Knowledge Gap Detection',
  desc: 'AI continuously scores topic-level mastery from quiz attempts and surfaces your weakest areas with a priority ranking.'
}, {
  icon: 'auto_awesome',
  title: 'AI Study Plans',
  desc: 'Personalized daily, weekly, and monthly plans generated from your open gaps, deadlines, and available time.'
}, {
  icon: 'smart_toy',
  title: 'AI Tutor (RAG-powered)',
  desc: 'Context-aware tutor grounded in your own uploaded course material — not generic internet knowledge.'
}, {
  icon: 'style',
  title: 'Smart Flashcards',
  desc: 'Spaced-repetition flashcards auto-generated for every flagged knowledge gap, scheduled for peak retention.'
}, {
  icon: 'emoji_events',
  title: 'Gamification & Battles',
  desc: 'XP, levels, leaderboards, and real-time Knowledge Battle mode keep motivation high throughout your journey.'
}, {
  icon: 'bar_chart',
  title: 'Deep Analytics',
  desc: 'Track your score trends, topic radar, completion rate, and rank history across all enrolled courses.'
}];
const stats = [{
  value: '50k+',
  label: 'Global Students'
}, {
  value: '1k+',
  label: 'Expert Courses'
}, {
  value: '98%',
  label: 'Satisfaction Rate'
}, {
  value: '4.9★',
  label: 'Average Rating'
}];
const testimonials = [{
  name: 'Priya Sharma',
  role: 'Data Science Student',
  text: 'The AI tutor knew exactly where my gaps were before I even realized them. My quiz scores jumped 40% in three weeks.',
  initials: 'PS'
}, {
  name: 'Arjun Mehta',
  role: 'Software Engineer',
  text: 'The knowledge battle mode made studying actually fun. I competed with friends and learned without even noticing.',
  initials: 'AM'
}, {
  name: 'Divya Reddy',
  role: 'MBA Student',
  text: 'The personalized study plans adapt to my schedule. I finally feel like the platform works for me, not the other way around.',
  initials: 'DR'
}];
const LandingPage = () => <div className="min-h-screen bg-surface selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
    <Navbar variant="landing" />

    {/* ── Hero ─────────────────────────────── */}
    <section className="relative overflow-hidden pt-7 pb-32 lg:pt-7 lg:pb-48">
      <div className="blob-animation top-0 left-0 bg-primary" />
      <div className="blob-animation bottom-0 right-0 bg-secondary" style={{
      animationDelay: '-5s'
    }} />

      <div className="max-w-container-max mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              New: AI Study Companion 2.0
            </motion.div>

            <motion.h1 {...fadeUp(0.08)} className="text-5xl lg:text-6xl font-extrabold leading-tight text-on-surface tracking-tight">
              Knowledge Guru,{' '}
              <br />
              <span className="primary-gradient-text">Where Ambition Meets Mastery</span>
            </motion.h1>

            <motion.p {...fadeUp(0.14)} className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
              Unlock your potential with an adaptive learning platform that identifies your knowledge gaps and builds a custom curriculum just for you.
            </motion.p>

            <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/register" className="primary-gradient text-white px-8 py-4 rounded-xl font-medium text-lg shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 text-center">
                Get Started Free
              </Link>
              <Link to="/features" className="flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-medium text-lg hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined">play_circle</span>
                View Features
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.26)} className="flex items-center gap-5 pt-2">
              <div className="flex -space-x-2">
                {['PS', 'AM', 'DR', 'KL'].map((i, idx) => <div key={idx} className="w-9 h-9 rounded-full primary-gradient border-2 border-surface flex items-center justify-center text-white text-xs font-bold">
                    {i}
                  </div>)}
              </div>
              <p className="text-sm text-on-surface-variant">
                Join <span className="font-bold text-on-surface">50,000+</span> active learners today
              </p>
            </motion.div>
          </div>

          {/* Hero card */}
          <motion.div {...fadeUp(0.1)} className="relative lg:h-[580px] flex items-center justify-center">
            <div className="glass-card p-4 rounded-3xl w-full max-w-lg relative z-10">
              <div className="w-full h-72 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <img src={brain} alt="AI Brain" className="w-full h-72 object-cover rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 flex items-center justify-center"  />
                </div>
              </div>

              {/* Floating cards */}
              <motion.div animate={{
              y: [0, -8, 0]
            }} transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut'
            }} className="absolute -top-6 -right-6 glass-card px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl border border-black/5">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Analysis Complete</p>
                  <p className="text-[10px] text-on-surface-variant">Gap in 'Quantum Physics' found</p>
                </div>
              </motion.div>

              <motion.div animate={{
              y: [0, 8, 0]
            }} transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: 'easeInOut',
              delay: 0.5
            }} className="absolute -bottom-8 -left-6 glass-card px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl border border-black/5">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">+24% Mastery</p>
                  <p className="text-[10px] text-on-surface-variant">Learning velocity increased</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Stats ─────────────────────────────── */}
    <section className="py-12 bg-surface-container-low border-y border-black/5">
      <div className="max-w-container-max mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => <motion.div key={s.label} {...fadeUp(i * 0.08)} className="space-y-1">
              <p className="text-3xl font-extrabold primary-gradient-text">{s.value}</p>
              <p className="text-sm text-on-surface-variant">{s.label}</p>
            </motion.div>)}
        </div>
      </div>
    </section>

    {/* ── Features ─────────────────────────── */}
    <section className="py-24 bg-surface">
      <div className="max-w-container-max mx-auto px-4">
        <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase">Platform Features</p>
          <h2 className="text-4xl font-bold text-on-surface">Everything You Need to Master Any Subject</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Knowledge Guru combines AI, gamification, and adaptive learning to close your knowledge gaps automatically.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => <motion.div key={f.title} {...fadeUp(i * 0.07)} className="glass-card rounded-2xl p-6 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1 group border border-black/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">{f.icon}</span>
              </div>
              <h3 className="font-semibold text-on-surface mb-2">{f.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
            </motion.div>)}
        </div>
      </div>
    </section>

    {/* ── How it works ─────────────────────── */}
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-4">
        <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase">How It Works</p>
          <h2 className="text-4xl font-bold text-on-surface">From Gap to Mastery in 4 Steps</h2>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-8">
          {[{
          step: '01',
          icon: 'quiz',
          title: 'Take a Quiz',
          desc: 'Complete topic assessments as you learn through your courses.'
        }, {
          step: '02',
          icon: 'psychology_alt',
          title: 'AI Detects Gaps',
          desc: 'Our AI analyzes your answers to find exactly what you don\'t know yet.'
        }, {
          step: '03',
          icon: 'auto_awesome',
          title: 'Get a Plan',
          desc: 'Receive a personalized study plan, flashcards, and recommendations.'
        }, {
          step: '04',
          icon: 'emoji_events',
          title: 'Master & Rank Up',
          desc: 'Close gaps, earn XP, climb leaderboards, and track your mastery.'
        }].map((s, i) => <motion.div key={s.step} {...fadeUp(i * 0.1)} className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-white text-2xl">{s.icon}</span>
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">{s.step}</span>
              </div>
              <h3 className="font-semibold text-on-surface">{s.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
            </motion.div>)}
        </div>
      </div>
    </section>

    {/* ── Testimonials ─────────────────────── */}
    <section className="py-24 bg-surface">
      <div className="max-w-container-max mx-auto px-4">
        <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase">Testimonials</p>
          <h2 className="text-4xl font-bold text-on-surface">Loved by Learners Worldwide</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => <motion.div key={t.name} {...fadeUp(i * 0.1)} className="glass-card rounded-2xl p-6 border border-black/5 space-y-4">
              <div className="flex text-yellow-400 gap-0.5">
                {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-lg" style={{
              fontVariationSettings: "'FILL' 1"
            }}>star</span>)}
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold">{t.initials}</div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>

    {/* ── CTA ──────────────────────────────── */}
    <section className="py-24 bg-surface-container-low border-t border-black/5">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-8">
        <motion.div {...fadeUp()} className="space-y-4">
          <h2 className="text-4xl font-extrabold text-on-surface">Ready to Close Your Knowledge Gaps?</h2>
          <p className="text-on-surface-variant text-lg">Join thousands of students who have already transformed their learning with AI.</p>
        </motion.div>
        <motion.div {...fadeUp(0.1)} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="primary-gradient text-white px-10 py-4 rounded-xl font-medium text-lg shadow-lg hover:opacity-90 transition-all active:scale-95">
            Get Started Free
          </Link>
          <Link to="/login" className="bg-surface-container border border-outline-variant text-on-surface px-10 py-4 rounded-xl font-medium text-lg hover:bg-surface-container-high transition-all">
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── Footer ───────────────────────────── */}
    <footer className="bg-surface border-t border-black/5 py-12">
      <div className="max-w-container-max mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg"><img className="h-full w-40 object-contain" src={banner} alt="Knowledge Guru" /></span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant">
            {['Features', 'Pricing', 'About', 'Contact', 'Privacy', 'Terms'].map(l => <Link key={l} to={`/${l.toLowerCase()}`} className="hover:text-primary transition-colors">{l}</Link>)}
          </div>
          <p className="text-xs text-outline">© 2026 Knowledge Guru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>;
export default LandingPage;