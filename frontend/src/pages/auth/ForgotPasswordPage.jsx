import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../../services/api.client';
import ThemeToggle from '../../components/ui/ThemeToggle';
const schema = z.object({
  email: z.string().email('Enter a valid email')
});
const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');
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
    await api.post('/auth/forgot-password', {
      email: data.email
    });
    setSentTo(data.email);
    setSent(true);
  };
  return <div className="min-h-screen bg-surface flex flex-col">
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      <main className="flex-grow flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

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
              <span className="material-symbols-outlined text-white text-2xl">lock_reset</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Forgot Password?</h1>
            <p className="text-on-surface-variant text-sm mt-1 text-center">Enter your email and we'll send a reset link</p>
          </div>

          {sent ? <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-400/10 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-500 text-3xl">mark_email_read</span>
              </div>
              <p className="font-semibold text-on-surface">Check your inbox!</p>
              <p className="text-sm text-on-surface-variant">We sent a reset link to <span className="font-medium text-primary">{sentTo}</span></p>
              <p className="text-xs text-outline">Didn't receive it? Check spam or <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button></p>
            </motion.div> : <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant px-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">mail</span>
                  <input {...register('email')} type="email" placeholder="name@company.com" className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
                </div>
                {errors.email && <p className="text-xs text-error px-1">{errors.email.message}</p>}
              </div>

              <motion.button type="submit" disabled={isSubmitting} whileTap={{
            scale: 0.98
          }} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending…</> : 'Send Reset Link'}
              </motion.button>
            </form>}

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            <Link to="/login" className="flex items-center justify-center gap-1 text-primary font-medium hover:underline">
              <span className="material-symbols-outlined text-base">arrow_back</span>Back to Sign In
            </Link>
          </p>
        </motion.div>
      </main>
    </div>;
};
export default ForgotPasswordPage;