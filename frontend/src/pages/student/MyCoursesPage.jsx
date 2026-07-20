import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const MyCoursesPage = () => {
  const [tab, setTab] = useState('enrolled');
  const {
    data: enrolled,
    isLoading: loadingEnrolled
  } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: () => api.get('/courses/enrolled').then(r => r.data),
    enabled: tab === 'enrolled'
  });
  const {
    data: browse,
    isLoading: loadingBrowse
  } = useQuery({
    queryKey: ['browse-courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
    enabled: tab === 'browse'
  });
  const courses = tab === 'enrolled' ? enrolled?.data || [] : browse?.data || [];
  const isLoading = tab === 'enrolled' ? loadingEnrolled : loadingBrowse;
  const levelColor = {
    beginner: 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300',
    intermediate: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300',
    advanced: 'bg-error/10 text-error'
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">My Courses</h1>
          <p className="text-on-surface-variant text-sm mt-1">Track your learning journey</p>
        </div>
        <button onClick={() => setTab('browse')} className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-lg">explore</span>Browse Courses
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 max-w-xs">
        {['enrolled', 'browse'].map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all
              ${tab === t ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t === 'enrolled' ? 'Enrolled' : 'Discover'}
          </button>)}
      </div>

      {isLoading ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-2xl border border-black/5 h-56 animate-pulse" />)}
        </div> : courses.length === 0 ? <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="py-20 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant block">school</span>
          <p className="font-semibold text-on-surface">
            {tab === 'enrolled' ? "You haven't enrolled in any courses yet" : 'No courses available'}
          </p>
          {tab === 'enrolled' && <button onClick={() => setTab('browse')} className="px-6 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              Browse Courses
            </button>}
        </motion.div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((item, i) => {
        const course = tab === 'enrolled' ? item.courseId || item : item;
        const enrollment = tab === 'enrolled' ? item : null;
        return <motion.div key={item._id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: i * 0.05
        }} className="glass-card rounded-2xl border border-black/5 overflow-hidden hover:shadow-glass-lg transition-all hover:-translate-y-0.5 group">
                {/* Thumbnail */}
                <div className="h-36 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/30 text-6xl">school</span>
                  </div>
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${levelColor[course.level] || 'bg-surface-container text-on-surface-variant'}`}>
                    {course.level}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  {enrollment && <div>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{enrollment.progressPercent || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${enrollment.progressPercent || 0}%`
                }} transition={{
                  duration: 0.8
                }} className="h-full primary-gradient rounded-full" />
                      </div>
                    </div>}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">people</span>
                      {course.enrollmentCount || 0}
                    </div>
                    <Link to={`/student/courses/${course._id}`} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline group-hover:gap-2 transition-all">
                      {enrollment ? 'Continue' : 'Enroll'} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </motion.div>;
      })}
        </div>}
    </div>;
};
export default MyCoursesPage;