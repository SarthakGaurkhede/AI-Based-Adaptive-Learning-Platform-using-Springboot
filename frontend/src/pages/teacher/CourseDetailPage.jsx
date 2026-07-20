import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const statusColors = {
  published: 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300',
  draft: 'bg-surface-container text-on-surface-variant',
  archived: 'bg-error/10 text-error'
};
const difficultyColors = {
  easy: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  hard: 'text-error'
};
const RESOURCE_META = {
  video: {
    icon: 'play_circle',
    label: 'Video',
    color: 'text-red-500'
  },
  ppt: {
    icon: 'slideshow',
    label: 'Slides',
    color: 'text-orange-500'
  },
  notes: {
    icon: 'description',
    label: 'Notes',
    color: 'text-blue-500'
  },
  pdf: {
    icon: 'picture_as_pdf',
    label: 'PDF',
    color: 'text-error'
  },
  link: {
    icon: 'link',
    label: 'Link',
    color: 'text-primary'
  }
};
const emptyResourceForm = () => ({
  type: 'video',
  title: '',
  url: '',
  content: ''
});

// A single topic row: shows its resources and lets the teacher add/remove
// videos, slide decks, notes, PDFs, or links.
const TopicRow = ({
  courseId,
  topic,
  onRemoveTopic,
  invalidate
}) => {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState(emptyResourceForm());
  const [showForm, setShowForm] = useState(false);
  const addResourceMut = useMutation({
    mutationFn: payload => api.post(`/courses/${courseId}/topics/${topic._id}/resources`, payload),
    onSuccess: () => {
      setForm(emptyResourceForm());
      setShowForm(false);
      invalidate();
    }
  });
  const removeResourceMut = useMutation({
    mutationFn: resourceId => api.delete(`/courses/${courseId}/topics/${topic._id}/resources/${resourceId}`),
    onSuccess: invalidate
  });
  const resources = topic.resources || [];
  const submitResource = () => {
    if (!form.title.trim()) return;
    if (form.type === 'notes' && !form.content.trim()) return;
    if (form.type !== 'notes' && !form.url.trim()) return;
    addResourceMut.mutate(form);
  };
  return <li className="rounded-xl border border-outline-variant/40 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-container/40">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2 text-sm text-on-surface-variant flex-1 min-w-0 text-left">
          <span className="material-symbols-outlined text-lg shrink-0">{expanded ? 'expand_more' : 'chevron_right'}</span>
          <span className={`material-symbols-outlined text-sm shrink-0 ${difficultyColors[topic.difficulty] || ''}`}>circle</span>
          <span className="truncate">{topic.title}</span>
          {resources.length > 0 && <span className="text-[11px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full shrink-0">{resources.length}</span>}
        </button>
        <button onClick={() => onRemoveTopic(topic._id)} className="text-on-surface-variant hover:text-error transition-colors shrink-0">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <AnimatePresence>
        {expanded && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="overflow-hidden">
            <div className="p-3 space-y-2 bg-surface">
              {resources.length === 0 && !showForm && <p className="text-xs text-on-surface-variant">No content yet — add a video, slides, or notes for this topic.</p>}
              {resources.map(r => {
            const meta = RESOURCE_META[r.type] || RESOURCE_META.link;
            return <div key={r._id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container/50">
                    <span className={`material-symbols-outlined text-lg shrink-0 ${meta.color}`}>{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-on-surface truncate">{r.title}</p>
                      {r.type !== 'notes' ? <a href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline truncate block">{r.url}</a> : <p className="text-[11px] text-on-surface-variant truncate">{r.content}</p>}
                    </div>
                    <button onClick={() => removeResourceMut.mutate(r._id)} className="text-on-surface-variant hover:text-error transition-colors shrink-0">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>;
          })}

              {showForm ? <div className="space-y-2 p-3 rounded-lg border border-dashed border-outline-variant">
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(RESOURCE_META).map(([type, meta]) => <button key={type} type="button" onClick={() => setForm(f => ({
                ...f,
                type
              }))} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors
                        ${form.type === type ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                        <span className="material-symbols-outlined text-sm">{meta.icon}</span>{meta.label}
                      </button>)}
                  </div>
                  <input value={form.title} onChange={e => setForm(f => ({
              ...f,
              title: e.target.value
            }))} placeholder={`${RESOURCE_META[form.type].label} title`} className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {form.type === 'notes' ? <textarea value={form.content} onChange={e => setForm(f => ({
              ...f,
              content: e.target.value
            }))} rows={4} placeholder="Write the lesson notes here…" className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" /> : <input value={form.url} onChange={e => setForm(f => ({
              ...f,
              url: e.target.value
            }))} placeholder={form.type === 'video' ? 'YouTube/Vimeo link or video URL' : form.type === 'ppt' ? 'Google Slides / PowerPoint Online link' : form.type === 'pdf' ? 'PDF link' : 'https://…'} className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />}
                  {addResourceMut.isError && <p className="text-[11px] text-error">Failed to add — check the fields and try again.</p>}
                  <div className="flex gap-2">
                    <button onClick={submitResource} disabled={addResourceMut.isPending} className="px-3 py-1.5 primary-gradient text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-60">
                      {addResourceMut.isPending ? 'Adding…' : 'Add'}
                    </button>
                    <button onClick={() => {
                setShowForm(false);
                setForm(emptyResourceForm());
              }} className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container">
                      Cancel
                    </button>
                  </div>
                </div> : <button onClick={() => setShowForm(true)} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span>Add Video / Slides / Notes
                </button>}
            </div>
          </motion.div>}
      </AnimatePresence>
    </li>;
};
const CourseDetailPage = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newTopic, setNewTopic] = useState({});
  const {
    data: courseData,
    isLoading
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data)
  });
  const {
    data: topicsData
  } = useQuery({
    queryKey: ['course-topics', id],
    queryFn: () => api.get(`/courses/${id}/topics`).then(r => r.data)
  });
  const course = courseData?.data;
  const topics = topicsData?.data || [];
  const invalidate = () => {
    qc.invalidateQueries({
      queryKey: ['course', id]
    });
    qc.invalidateQueries({
      queryKey: ['course-topics', id]
    });
  };
  const updateCourseMut = useMutation({
    mutationFn: updates => api.patch(`/courses/${id}`, updates),
    onSuccess: invalidate
  });
  const addWeekMut = useMutation({
    mutationFn: title => api.post(`/courses/${id}/modules`, {
      title
    }),
    onSuccess: () => {
      setNewWeekTitle('');
      invalidate();
    }
  });
  const removeWeekMut = useMutation({
    mutationFn: moduleId => api.delete(`/courses/${id}/modules/${moduleId}`),
    onSuccess: invalidate
  });
  const addTopicMut = useMutation({
    mutationFn: ({
      moduleId,
      title,
      difficulty
    }) => api.post(`/courses/${id}/topics`, {
      moduleId,
      title,
      difficulty
    }),
    onSuccess: (_, {
      moduleId
    }) => {
      setNewTopic(prev => ({
        ...prev,
        [moduleId]: ''
      }));
      invalidate();
    }
  });
  const removeTopicMut = useMutation({
    mutationFn: topicId => api.delete(`/courses/${id}/topics/${topicId}`),
    onSuccess: invalidate
  });
  if (isLoading) return <div className="p-8 max-w-4xl mx-auto space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-surface-container animate-pulse" />)}
    </div>;
  if (!course) return <div className="flex items-center justify-center h-[70vh]">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-5xl text-error block">error</span>
        <p className="text-on-surface font-semibold">Course not found</p>
        <Link to="/teacher/courses" className="text-primary hover:underline text-sm">Back to Course Management</Link>
      </div>
    </div>;
  const totalResources = topics.reduce((s, t) => s + (t.resources?.length || 0), 0);
  return <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <button onClick={() => navigate('/teacher/courses')} className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary mb-1 transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>All Courses
          </button>
          <h1 className="text-2xl font-bold text-on-surface">{course.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[course.status] || ''}`}>{course.status}</span>
            <span className="text-xs text-on-surface-variant capitalize">{course.level} · {course.category}</span>
            <span className="text-xs text-on-surface-variant">{course.enrollmentCount || 0} students enrolled</span>
            <span className="text-xs text-on-surface-variant">{topics.length} topics · {totalResources} resources</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {course.status === 'draft' && <button onClick={() => updateCourseMut.mutate({
          status: 'published'
        })} disabled={updateCourseMut.isPending} className="px-4 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              Publish Course
            </button>}
          {course.status === 'published' && <button onClick={() => updateCourseMut.mutate({
          status: 'archived'
        })} disabled={updateCourseMut.isPending} className="px-4 py-2.5 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition-colors">
              Archive
            </button>}
        </div>
      </motion.div>

      <p className="text-sm text-on-surface-variant leading-relaxed glass-card rounded-2xl border border-black/5 p-4">{course.description}</p>

      {/* Weeks / modules */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface">Weeks</h2>
        {(course.modules || []).length === 0 && <p className="text-sm text-on-surface-variant">No weeks yet — add one below to start building the curriculum.</p>}
        {(course.modules || []).map((mod, i) => {
        const modTopics = topics.filter(t => t.moduleId === mod._id);
        return <motion.div key={mod._id} initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: i * 0.04
        }} className="glass-card rounded-2xl border border-black/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="font-semibold text-on-surface text-sm">{mod.title}</p>
                </div>
                <button onClick={() => removeWeekMut.mutate(mod._id)} className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>

              {modTopics.length > 0 && <ul className="space-y-2 pl-9">
                  {modTopics.map(t => <TopicRow key={t._id} courseId={id} topic={t} onRemoveTopic={topicId => removeTopicMut.mutate(topicId)} invalidate={invalidate} />)}
                </ul>}

              <div className="flex items-center gap-2 pl-9">
                <input value={newTopic[mod._id] || ''} onChange={e => setNewTopic(prev => ({
              ...prev,
              [mod._id]: e.target.value
            }))} onKeyDown={e => {
              if (e.key === 'Enter' && newTopic[mod._id]?.trim()) {
                addTopicMut.mutate({
                  moduleId: mod._id,
                  title: newTopic[mod._id].trim(),
                  difficulty: 'medium'
                });
              }
            }} placeholder="Add a topic and press Enter" className="flex-1 px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <button onClick={() => newTopic[mod._id]?.trim() && addTopicMut.mutate({
              moduleId: mod._id,
              title: newTopic[mod._id].trim(),
              difficulty: 'medium'
            })} disabled={addTopicMut.isPending} className="text-xs font-medium text-primary hover:underline shrink-0">Add</button>
              </div>
            </motion.div>;
      })}

        {/* Add week */}
        <div className="glass-card rounded-2xl border border-dashed border-outline-variant p-4 flex items-center gap-2">
          <input value={newWeekTitle} onChange={e => setNewWeekTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && newWeekTitle.trim() && addWeekMut.mutate(newWeekTitle.trim())} placeholder={`Week ${(course.modules || []).length + 1} title`} className="flex-1 px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <button onClick={() => newWeekTitle.trim() && addWeekMut.mutate(newWeekTitle.trim())} disabled={addWeekMut.isPending} className="flex items-center gap-1.5 px-4 py-2 primary-gradient text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0">
            <span className="material-symbols-outlined text-lg">add</span>Add Week
          </button>
        </div>
      </div>
    </div>;
};
export default CourseDetailPage;
