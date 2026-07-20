import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api.client';
const SettingsPage = () => {
  const {
    user,
    refreshUser
  } = useAuth();
  const {
    theme,
    toggleTheme,
    isDark
  } = useTheme();
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const {
    register,
    handleSubmit,
    formState: {
      isSubmitting
    }
  } = useForm({
    defaultValues: {
      name: user?.name || ''
    }
  });
  const updateMut = useMutation({
    mutationFn: data => api.patch('/users/me', data),
    onSuccess: () => {
      refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });
  const sections = [{
    id: 'profile',
    label: 'Profile',
    icon: 'person'
  }, {
    id: 'appearance',
    label: 'Appearance',
    icon: 'palette'
  }, {
    id: 'notifications',
    label: 'Notifications',
    icon: 'notifications'
  }, {
    id: 'privacy',
    label: 'Privacy',
    icon: 'lock'
  }, {
    id: 'security',
    label: 'Security',
    icon: 'security'
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="md:col-span-1">
          <nav className="glass-card rounded-2xl border border-black/5 p-2 space-y-1">
            {sections.map(s => <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                  ${activeSection === s.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
                {s.label}
              </button>)}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeSection === 'profile' && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} className="glass-card rounded-2xl border border-black/5 p-6 space-y-5">
              <h2 className="font-semibold text-on-surface">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <button className="text-sm font-medium text-primary hover:underline">Change avatar</button>
                  <p className="text-xs text-on-surface-variant mt-0.5">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(d => updateMut.mutate(d))} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Full Name</label>
                  <input {...register('name')} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Email Address</label>
                  <input value={user?.email} disabled className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface-variant opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-on-surface-variant">Email cannot be changed</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Role</label>
                  <input value={user?.role} disabled className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface-variant capitalize opacity-60 cursor-not-allowed" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <motion.button type="submit" disabled={isSubmitting || updateMut.isPending} whileTap={{
                scale: 0.97
              }} className="px-6 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                    {updateMut.isPending ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                  {saved && <motion.p initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">check_circle</span>Saved!
                    </motion.p>}
                </div>
              </form>
            </motion.div>}

          {activeSection === 'appearance' && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} className="glass-card rounded-2xl border border-black/5 p-6 space-y-5">
              <h2 className="font-semibold text-on-surface">Appearance</h2>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Theme</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{
                value: 'light',
                label: 'Light',
                icon: 'light_mode',
                preview: 'bg-white border-slate-200'
              }, {
                value: 'dark',
                label: 'Dark',
                icon: 'dark_mode',
                preview: 'bg-slate-900 border-slate-700'
              }].map(t => <button key={t.value} onClick={() => theme !== t.value && toggleTheme()} className={`p-4 rounded-2xl border-2 transition-all text-left ${theme === t.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}>
                      <div className={`h-16 rounded-xl mb-3 ${t.preview} border flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant">{t.icon}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-on-surface">{t.label}</span>
                        {theme === t.value && <span className="material-symbols-outlined text-primary text-lg" style={{
                    fontVariationSettings: "'FILL' 1"
                  }}>check_circle</span>}
                      </div>
                    </button>)}
                </div>
              </div>
            </motion.div>}

          {activeSection === 'notifications' && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} className="glass-card rounded-2xl border border-black/5 p-6 space-y-5">
              <h2 className="font-semibold text-on-surface">Notification Preferences</h2>
              <div className="space-y-3">
                {[{
              label: 'Performance alerts',
              sub: 'When your score improves or drops',
              key: 'performance'
            }, {
              label: 'Study plan reminders',
              sub: 'Daily plan notifications',
              key: 'study_plan'
            }, {
              label: 'Quiz reminders',
              sub: 'Upcoming quiz notifications',
              key: 'quiz'
            }, {
              label: 'Rank updates',
              sub: 'When your rank changes',
              key: 'rank'
            }, {
              label: 'Knowledge gap alerts',
              sub: 'New gaps detected',
              key: 'warning'
            }, {
              label: 'Announcements',
              sub: 'Platform and course announcements',
              key: 'announcement'
            }].map(n => <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-container">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{n.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{n.sub}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>)}
              </div>
              <button className="px-6 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                Save Preferences
              </button>
            </motion.div>}

          {(activeSection === 'privacy' || activeSection === 'security') && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} className="glass-card rounded-2xl border border-black/5 p-6 space-y-5">
              <h2 className="font-semibold text-on-surface capitalize">{activeSection}</h2>
              <div className="py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl block mb-3 text-primary">
                  {activeSection === 'privacy' ? 'lock' : 'security'}
                </span>
                <p className="font-semibold text-on-surface">{activeSection === 'privacy' ? 'Privacy Controls' : 'Security Settings'}</p>
                <p className="text-sm mt-1">Advanced {activeSection} settings coming soon</p>
              </div>
            </motion.div>}
        </div>
      </div>
    </div>;
};
export default SettingsPage;