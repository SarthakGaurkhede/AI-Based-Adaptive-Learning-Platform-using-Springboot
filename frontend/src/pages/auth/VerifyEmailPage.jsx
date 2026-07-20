import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/auth.service';
import ThemeToggle from '../../components/ui/ThemeToggle';
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'verifying' : 'missing');
  useEffect(() => {
    if (!token) return;
    authService.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);
  const content = {
    verifying: {
      icon: 'hourglass_top',
      color: 'text-primary',
      title: 'Verifying your email…',
      body: 'Just a moment.'
    },
    success: {
      icon: 'check_circle',
      color: 'text-green-500',
      title: 'Email verified!',
      body: 'Your email has been confirmed. You can now use all features of your account.'
    },
    error: {
      icon: 'error',
      color: 'text-error',
      title: 'Verification failed',
      body: 'This link is invalid or has expired. Please request a new one from your profile settings.'
    },
    missing: {
      icon: 'error',
      color: 'text-error',
      title: 'Invalid verification link',
      body: 'No verification token was provided.'
    }
  }[status];
  return <div className="min-h-screen bg-surface flex flex-col">
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <motion.div initial={{
        opacity: 0,
        y: 24,
        scale: 0.97
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} className="w-full max-w-[420px] glass-card rounded-2xl p-8 border border-black/5 text-center space-y-4">
          <span className={`material-symbols-outlined text-5xl ${content.color}`}>{content.icon}</span>
          <h1 className="text-xl font-bold text-on-surface">{content.title}</h1>
          <p className="text-sm text-on-surface-variant">{content.body}</p>
          <Link to="/login" className="inline-flex items-center gap-1 text-primary font-medium hover:underline text-sm">
            <span className="material-symbols-outlined text-base">arrow_back</span>Back to Sign In
          </Link>
        </motion.div>
      </main>
    </div>;
};
export default VerifyEmailPage;
