import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import front from '../../images/front.png';
const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional()
});
const LoginPage = () => {
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');
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
      setApiError('');
      await login(data.email, data.password);
      navigate('/student/dashboard');
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Invalid email or password');
    }
  };
  return <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        {/* Login Card */}
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
      }} className="w-full max-w-[440px] glass-card rounded-2xl p-8 shadow-[0_4px_24px_rgba(99,102,241,0.08)] border border-black/5 z-10">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <motion.div initial={{
            scale: 0.7,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.1,
            duration: 0.4,
            type: 'spring',
            stiffness: 200
          }}>
              <img className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20" src={front} alt="Knowledge Guru" />
            </motion.div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Knowledge Guru</h1>
            <p className="text-on-surface-variant text-sm mt-1">Where Ambition Meets Mastery</p>
          </div>

          {/* Error */}
          {apiError && <motion.div initial={{
          opacity: 0,
          y: -8
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {apiError}
            </motion.div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-on-surface-variant px-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl transition-colors group-focus-within:text-primary">mail</span>
                <input {...register('email')} id="email" type="email" placeholder="name@company.com" className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
              </div>
              {errors.email && <p className="text-xs text-error px-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-xs font-semibold text-on-surface-variant">Password</label>
                <Link to="/forgot-password" className="text-primary text-xs font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl transition-colors group-focus-within:text-primary">lock</span>
                <input {...register('password')} id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error px-1">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 px-1">
              <input {...register('remember')} id="remember" type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer select-none">Remember me for 30 days</label>
            </div>

            {/* Submit */}
            <div className="space-y-3 pt-1">
              <motion.button type="submit" disabled={isSubmitting} whileTap={{
              scale: 0.98
            }} className="w-full py-3.5 primary-gradient text-white font-medium text-base rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </> : 'Sign In'}
              </motion.button>

              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-outline-variant" />
                <span className="absolute bg-surface-container-lowest dark:bg-surface-container px-3 text-xs text-outline uppercase tracking-wider">or</span>
              </div>

              <motion.button type="button" whileTap={{
              scale: 0.98
            }} className="w-full py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant text-on-surface text-base rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline ml-1">Register</Link>
            </p>
          </div>
        </motion.div>

        {/* Decorative illustration — desktop only */}
        <div className="hidden lg:block absolute left-12 bottom-12 w-56 h-56 opacity-10 dark:opacity-5 pointer-events-none">
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-primary to-secondary" />
        </div>
      </main>

      <footer className="w-full py-5 flex justify-center items-center gap-6 text-xs text-outline border-t border-black/5">
        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
      </footer>
    </div>;
};
export default LoginPage;