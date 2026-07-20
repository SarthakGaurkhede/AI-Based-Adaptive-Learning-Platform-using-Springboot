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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher']),
  agree: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the terms'
    })
  })
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
const getStrength = pw => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-error', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
const RegisterPage = () => {
  const {
    register: registerUser
  } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [pwValue, setPwValue] = useState('');
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'student'
    }
  });
  const strength = getStrength(pwValue);
  const onSubmit = async data => {
    try {
      setApiError('');
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });
      navigate('/student/dashboard');
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
  return <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed-dim">
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <motion.div initial={{
        opacity: 0,
        y: 28,
        scale: 0.97
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1]
      }} className="w-full max-w-[480px] glass-card rounded-2xl p-8 shadow-[0_4px_24px_rgba(99,102,241,0.08)] border border-black/5 z-10">
          {/* Brand */}
          <div className="flex flex-col items-center mb-7">
            <motion.div initial={{
            scale: 0.7,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.1,
            type: 'spring',
            stiffness: 200
          }}>
              <img className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20" src={front} alt="Knowledge Guru" />
            </motion.div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Create your account</h1>
            <p className="text-on-surface-variant text-sm mt-1">Join 50,000+ learners on Knowledge Guru</p>
          </div>

          {apiError && <motion.div initial={{
          opacity: 0,
          y: -8
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>{apiError}
            </motion.div>}

          {/* Role selector */}
          <div className="flex gap-2 mb-5 p-1 bg-surface-container rounded-xl">
            {['student', 'teacher'].map(r => <label key={r} className="flex-1 cursor-pointer">
                <input {...register('role')} type="radio" value={r} className="sr-only peer" />
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg peer-checked:bg-white dark:peer-checked:bg-surface-container-lowest peer-checked:shadow-sm peer-checked:text-primary text-on-surface-variant transition-all text-sm font-medium">
                  <span className="material-symbols-outlined text-lg">{r === 'student' ? 'school' : 'person_book'}</span>
                  {r === 'student' ? 'I\'m a Student' : 'I\'m a Teacher'}
                </div>
              </label>)}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">person</span>
                <input {...register('name')} type="text" placeholder="Alex Johnson" className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
              </div>
              {errors.name && <p className="text-xs text-error px-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">mail</span>
                <input {...register('email')} type="email" placeholder="name@company.com" className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
              </div>
              {errors.email && <p className="text-xs text-error px-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">lock</span>
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" onChange={e => setPwValue(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {/* Strength bar */}
              {pwValue && <div className="space-y-1 px-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-outline-variant'}`} />)}
                  </div>
                  <p className={`text-xs font-medium ${strength >= 3 ? 'text-green-600' : strength === 2 ? 'text-blue-500' : 'text-error'}`}>
                    {strengthLabel[strength]}
                  </p>
                </div>}
              {errors.password && <p className="text-xs text-error px-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">lock_reset</span>
                <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" className="w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-xl text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-error px-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 px-1">
              <input {...register('agree')} id="agree" type="checkbox" className="w-4 h-4 mt-0.5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" />
              <label htmlFor="agree" className="text-sm text-on-surface-variant cursor-pointer select-none leading-snug">
                I agree to the{' '}
                <Link to="/terms" className="text-primary font-medium hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agree && <p className="text-xs text-error px-1">{errors.agree.message}</p>}

            <motion.button type="submit" disabled={isSubmitting} whileTap={{
            scale: 0.98
          }} className="w-full py-3.5 primary-gradient text-white font-medium text-base rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Creating account...</> : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </main>

      <footer className="w-full py-5 flex justify-center gap-6 text-xs text-outline border-t border-black/5">
        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
      </footer>
    </div>;
};
export default RegisterPage;