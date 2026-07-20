import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../../services/api.client';
import ThemeToggle from '../../components/ui/ThemeToggle';
const schema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const token = searchParams.get('token') || '';
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm({
    resolver: zodResolver(schema)
  });
  const onSubmit = async data => {
    try {
      setError('');
      await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      navigate('/login?reset=success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired reset link.');
    }
  };
  if (!token) return <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-5xl text-error block">error</span>
        <p className="font-semibold text-on-surface">Invalid reset link</p>
        <Link to="/forgot-password" className="text-primary hover:underline text-sm">Request a new one</Link>
      </div>
    </div>;
  return <div className="min-h-screen bg-surface flex flex-col">
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>
      <main className="flex-grow flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <motion.div initial={{
        opacity: 0,
        y: 24,
        scale: 0.97
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1]
      }} className="w-full max-w-[420px] glass-card rounded-2xl p-8 border border-black/5 z-10">
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">lock</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Set New Password</h1>
            <p className="text-on-surface-variant text-sm mt-1">Choose a strong password for your account</p>
          </div>

          {error && <motion.div initial={{
          opacity: 0,
          y: -8
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>{error}
            </motion.div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant px-1">New Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">lock</span>
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" className="w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-xl">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error px-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">lock_reset</span>
                <input {...register('confirmPassword')} type={showPw ? 'text' : 'password'} placeholder="Re-enter password" className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-error px-1">{errors.confirmPassword.message}</p>}
            </div>

            <motion.button type="submit" disabled={isSubmitting} whileTap={{
            scale: 0.98
          }} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {isSubmitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating…</> : 'Update Password'}
            </motion.button>
          </form>
          <p className="mt-5 text-center">
            <Link to="/login" className="text-primary text-sm font-medium hover:underline flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>Back to Sign In
            </Link>
          </p>
        </motion.div>
      </main>
    </div>;
};
export default ResetPasswordPage;