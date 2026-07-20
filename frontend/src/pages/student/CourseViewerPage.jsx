import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';

// Best-effort conversion of common share links into embeddable iframe URLs.
// Falls back to a plain external link card when the URL isn't a recognized pattern.
function toEmbedVideoUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}
function toEmbedSlidesUrl(url) {
  if (!url) return null;
  if (url.includes('docs.google.com/presentation')) {
    return url.replace(/\/(edit|preview)([?#].*)?$/, '/embed');
  }
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com') || url.includes('sharepoint.com')) {
    return url;
  }
  return null;
}
const RESOURCE_ICON = {
  video: 'play_circle',
  ppt: 'slideshow',
  notes: 'description',
  pdf: 'picture_as_pdf',
  link: 'link'
};

// Renders a single resource — embeds what it can, otherwise a clean external-link card.
const ResourceViewer = ({
  resource
}) => {
  if (resource.type === 'notes') {
    return <div className="glass-card rounded-2xl border border-black/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-blue-500">description</span>
          <h3 className="font-semibold text-on-surface">{resource.title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{resource.content}</p>
      </div>;
  }
  if (resource.type === 'video') {
    const embed = toEmbedVideoUrl(resource.url);
    return <div className="glass-card rounded-2xl border border-black/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">play_circle</span>
          <h3 className="font-semibold text-on-surface text-sm">{resource.title}</h3>
        </div>
        {embed ? <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe src={embed} title={resource.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
          </div> : <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-8 rounded-xl bg-surface-container text-primary font-medium hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">open_in_new</span>Watch Video
          </a>}
      </div>;
  }
  if (resource.type === 'ppt') {
    const embed = toEmbedSlidesUrl(resource.url);
    return <div className="glass-card rounded-2xl border border-black/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">slideshow</span>
          <h3 className="font-semibold text-on-surface text-sm">{resource.title}</h3>
        </div>
        {embed ? <div className="aspect-video rounded-xl overflow-hidden">
            <iframe src={embed} title={resource.title} allowFullScreen className="w-full h-full" />
          </div> : <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-8 rounded-xl bg-surface-container text-primary font-medium hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">open_in_new</span>View Slides
          </a>}
      </div>;
  }
  if (resource.type === 'pdf') {
    return <div className="glass-card rounded-2xl border border-black/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error">picture_as_pdf</span>
          <h3 className="font-semibold text-on-surface text-sm">{resource.title}</h3>
        </div>
        <div className="aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden border border-outline-variant/40">
          <iframe src={resource.url} title={resource.title} className="w-full h-full" />
        </div>
        <a href={resource.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">open_in_new</span>Open in new tab
        </a>
      </div>;
  }
  // link
  return <a href={resource.url} target="_blank" rel="noreferrer" className="glass-card rounded-2xl border border-black/5 p-4 flex items-center gap-3 hover:bg-surface-container/50 transition-colors">
      <span className="material-symbols-outlined text-primary">link</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{resource.title}</p>
        <p className="text-xs text-on-surface-variant truncate">{resource.url}</p>
      </div>
      <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
    </a>;
};
const CourseViewerPage = () => {
  const {
    courseId
  } = useParams();
  const qc = useQueryClient();
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [diagnosticBannerDismissed, setDiagnosticBannerDismissed] = useState(false);
  const {
    data: courseData,
    isLoading
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data),
    enabled: !!courseId
  });
  const {
    data: progressData
  } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => api.get(`/courses/${courseId}/progress`).then(r => r.data),
    enabled: !!courseId
  });
  const {
    data: topicsData
  } = useQuery({
    queryKey: ['course-topics', courseId],
    queryFn: () => api.get(`/courses/${courseId}/topics`).then(r => r.data),
    enabled: !!courseId
  });
  const {
    data: quizzesData
  } = useQuery({
    queryKey: ['course-quizzes', courseId],
    queryFn: () => api.get(`/quizzes?courseId=${courseId}`).then(r => r.data),
    enabled: !!courseId
  });
  const enrollMut = useMutation({
    mutationFn: () => api.post(`/courses/${courseId}/enroll`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['course-progress', courseId]
    })
  });
  const course = courseData?.data;
  const progress = progressData?.data;
  const enrolled = !!progress;
  const modules = course?.modules || [];
  const topics = topicsData?.data || [];
  const quizzes = quizzesData?.data || [];
  const activeModule = modules[activeModuleIdx];
  const activeModuleTopics = topics.filter(t => t.moduleId === activeModule?._id).sort((a, b) => a.order - b.order);
  const activeModuleTopicIds = activeModuleTopics.map(t => t._id);
  const activeModuleQuizzes = quizzes.filter(q => activeModuleTopicIds.includes(q.topicId));
  const diagnosticQuiz = quizzes.find(q => q.isDiagnostic);
  const completedModules = progress?.completedModules || [];
  const isModuleLocked = idx => {
    if (idx === 0) return false;
    return !completedModules.includes(modules[idx - 1]?._id);
  };

  // Default to the first topic of the active module whenever the module changes.
  useEffect(() => {
    if (activeModuleTopics.length > 0 && !activeModuleTopicIds.includes(activeTopicId)) {
      setActiveTopicId(activeModuleTopics[0]._id);
    } else if (activeModuleTopics.length === 0) {
      setActiveTopicId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleIdx, topics.length]);
  const activeTopic = activeModuleTopics.find(t => t._id === activeTopicId);
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-surface">
      <div className="animate-pulse text-center space-y-3">
        <div className="w-16 h-16 primary-gradient rounded-2xl mx-auto" />
        <p className="text-on-surface-variant">Loading course…</p>
      </div>
    </div>;
  if (!course) return <div className="flex items-center justify-center h-screen bg-surface">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-5xl text-error block">error</span>
        <p className="text-on-surface font-semibold">Course not found</p>
        <Link to="/student/courses" className="text-primary hover:underline text-sm">Back to courses</Link>
      </div>
    </div>;
  return <div className="flex h-screen bg-surface overflow-hidden">
      {/* Course sidebar */}
      <aside className="w-80 shrink-0 border-r border-black/5 sidebar-bg flex flex-col hidden md:flex">
        {/* Course info */}
        <div className="p-5 border-b border-black/5">
          <Link to="/student/courses" className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary mb-3 transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>All Courses
          </Link>
          <h2 className="font-bold text-on-surface text-sm leading-snug">{course.title}</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
            <span className="capitalize">{course.level}</span>
            <span>·</span>
            <span>{modules.length} modules</span>
          </div>
          {enrolled && <div className="mt-3">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Progress</span>
                <span>{progress?.progressPercent || 0}%</span>
              </div>
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full primary-gradient rounded-full transition-all" style={{
              width: `${progress?.progressPercent || 0}%`
            }} />
              </div>
            </div>}
        </div>

        {/* Module + topic list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {modules.map((mod, i) => {
          const locked = enrolled ? isModuleLocked(i) : i > 0;
          const active = activeModuleIdx === i;
          const modTopics = topics.filter(t => t.moduleId === mod._id).sort((a, b) => a.order - b.order);
          return <div key={mod._id || i}>
                <button onClick={() => !locked && setActiveModuleIdx(i)} disabled={locked} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all
                    ${active ? 'bg-primary/10 text-primary font-semibold' : locked ? 'text-on-surface-variant opacity-50 cursor-not-allowed' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                  <span className={`material-symbols-outlined text-lg shrink-0 ${active ? 'text-primary' : ''}`} style={{
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"
              }}>
                    {locked ? 'lock' : completedModules.includes(mod._id) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="flex-1 truncate">{mod.title}</span>
                  {modTopics.length > 0 && !locked && <span className="material-symbols-outlined text-base shrink-0">{active ? 'expand_more' : 'chevron_right'}</span>}
                </button>
                {active && !locked && modTopics.length > 0 && <div className="ml-6 mt-1 space-y-0.5 border-l border-outline-variant/40 pl-3">
                    {modTopics.map(t => <button key={t._id} onClick={() => setActiveTopicId(t._id)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors
                        ${activeTopicId === t._id ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                        <span className="material-symbols-outlined text-sm shrink-0">{RESOURCE_ICON[t.resources?.[0]?.type] || 'article'}</span>
                        <span className="flex-1 truncate">{t.title}</span>
                        {t.resources?.length > 0 && <span className="text-[10px] text-on-surface-variant shrink-0">{t.resources.length}</span>}
                      </button>)}
                  </div>}
              </div>;
        })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 nav-glass border-b border-black/5 shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-bold text-on-surface truncate">{activeTopic?.title || modules[activeModuleIdx]?.title || course.title}</h1>
          </div>
          {!enrolled ? <motion.button whileTap={{
          scale: 0.97
        }} onClick={() => enrollMut.mutate()} disabled={enrollMut.isPending} className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0">
              {enrollMut.isPending ? 'Enrolling…' : 'Enroll Now'}
            </motion.button> : activeModuleQuizzes.length > 0 ? <div className="flex items-center gap-2 shrink-0">
              {activeModuleQuizzes.map(q => <Link key={q._id} to={`/student/quizzes/${q._id}`} className="flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-lg">quiz</span>{activeModuleQuizzes.length > 1 ? q.title : 'Take Quiz'}
                </Link>)}
            </div> : <span className="text-xs text-on-surface-variant shrink-0">No quiz published for this week yet</span>}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!enrolled ? <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} className="max-w-2xl mx-auto space-y-6">
              {/* Course overview */}
              <div className="glass-card rounded-2xl border border-black/5 p-6 space-y-4">
                <div className="h-48 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/40 text-8xl">school</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">{course.title}</h2>
                <p className="text-on-surface-variant leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap gap-3">
                  {[{
                icon: 'layers',
                text: `${modules.length} modules`
              }, {
                icon: 'school',
                text: course.level
              }, {
                icon: 'people',
                text: `${course.enrollmentCount} students`
              }, {
                icon: 'star',
                text: `${course.rating || 'New'}`
              }].map(b => <span key={b.text} className="flex items-center gap-1.5 text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-base">{b.icon}</span>{b.text}
                    </span>)}
                </div>
                <motion.button whileTap={{
              scale: 0.97
            }} onClick={() => enrollMut.mutate()} disabled={enrollMut.isPending} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {enrollMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Enrolling…</> : <><span className="material-symbols-outlined text-lg">play_circle</span>Enroll & Start Learning</>}
                </motion.button>
              </div>

              {/* Module preview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-on-surface">Course Curriculum</h3>
                {modules.map((mod, i) => {
              const modTopics = topics.filter(t => t.moduleId === mod._id);
              return <div key={i} className="glass-card rounded-xl border border-black/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface flex-1">{mod.title}</p>
                      {i > 0 && <span className="material-symbols-outlined text-outline text-base">lock</span>}
                    </div>
                    {modTopics.length > 0 && <ul className="mt-2 ml-11 space-y-1">
                        {modTopics.map(t => <li key={t._id} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">subdirectory_arrow_right</span>{t.title}
                          </li>)}
                      </ul>}
                  </div>;
            })}
              </div>
            </motion.div> : <div className="max-w-3xl mx-auto space-y-6">
              {/* Diagnostic / placement quiz prompt */}
              {diagnosticQuiz && !diagnosticBannerDismissed && <motion.div initial={{
            opacity: 0,
            y: -8
          }} animate={{
            opacity: 1,
            y: 0
          }} className="glass-card rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">assignment_turned_in</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface text-sm">Take the placement quiz</p>
                    <p className="text-xs text-on-surface-variant">A quick baseline check — we'll use it to personalize your recommendations and highlight knowledge gaps right away.</p>
                  </div>
                  <Link to={`/student/quizzes/${diagnosticQuiz._id}`} className="px-4 py-2 primary-gradient text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
                    Start
                  </Link>
                  <button onClick={() => setDiagnosticBannerDismissed(true)} className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </motion.div>}

              {/* Lesson content */}
              <AnimatePresence mode="wait">
                {!activeTopic ? <motion.div key="empty" initial={{
              opacity: 0,
              y: 16
            }} animate={{
              opacity: 1,
              y: 0
            }} className="glass-card rounded-2xl border border-black/5 p-10 text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">inbox</span>
                    <p className="text-on-surface font-medium">No topics added to this week yet</p>
                    <p className="text-xs text-on-surface-variant">Check back once your teacher publishes lesson content.</p>
                  </motion.div> : <motion.div key={activeTopic._id} initial={{
              opacity: 0,
              y: 16
            }} animate={{
              opacity: 1,
              y: 0
            }} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-on-surface">{activeTopic.title}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                        ${activeTopic.difficulty === 'hard' ? 'bg-error/10 text-error' : activeTopic.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300' : 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300'}`}>
                        {activeTopic.difficulty}
                      </span>
                    </div>
                    {(activeTopic.resources || []).length === 0 ? <div className="glass-card rounded-2xl border border-black/5 p-10 text-center space-y-2">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">video_library</span>
                        <p className="text-on-surface font-medium">No lesson content added yet</p>
                        <p className="text-xs text-on-surface-variant">Your teacher hasn't uploaded videos, slides, or notes for this topic yet.</p>
                      </div> : [...activeTopic.resources].sort((a, b) => a.order - b.order).map(r => <ResourceViewer key={r._id} resource={r} />)}
                  </motion.div>}
              </AnimatePresence>

              {/* AI Tutor CTA */}
              <div className="glass-card rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
                <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface text-sm">Have a question?</p>
                  <p className="text-xs text-on-surface-variant">Ask the AI Tutor — grounded in this course's material</p>
                </div>
                <Link to={`/student/ai-tutor?course=${courseId}`} className="px-4 py-2 primary-gradient text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
                  Ask AI
                </Link>
              </div>
            </div>}
        </div>
      </main>
    </div>;
};
export default CourseViewerPage;
