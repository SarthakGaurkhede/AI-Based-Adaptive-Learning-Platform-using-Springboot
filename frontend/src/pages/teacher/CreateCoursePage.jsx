import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api.client';
const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Add a brief description'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(2, 'Category is required'),
  visibility: z.enum(['public', 'private']),
  tags: z.string().optional(),
  weeks: z.array(z.object({
    title: z.string().min(1, 'Week title is required'),
    topics: z.array(z.object({
      title: z.string().min(1, 'Topic title is required'),
      difficulty: z.enum(['easy', 'medium', 'hard'])
    })).optional()
  })).optional()
});
const aiSchema = z.object({
  courseName: z.string().min(3),
  targetAudience: z.string().min(3),
  durationWeeks: z.coerce.number().min(1).max(52),
  learningObjectives: z.string().min(10),
  level: z.enum(['beginner', 'intermediate', 'advanced'])
});
const emptyTopic = () => ({
  title: '',
  difficulty: 'medium'
});
const WeekTopicsEditor = ({
  control,
  register,
  weekIndex
}) => {
  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control,
    name: `weeks.${weekIndex}.topics`
  });
  return <div className="pl-8 space-y-1.5">
      {fields.map((field, ti) => <div key={field.id} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">subdirectory_arrow_right</span>
          <input {...register(`weeks.${weekIndex}.topics.${ti}.title`)} placeholder={`Topic ${ti + 1} title`} className="flex-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <select {...register(`weeks.${weekIndex}.topics.${ti}.difficulty`)} className="px-2 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button type="button" onClick={() => remove(ti)} className="text-on-surface-variant hover:text-error transition-colors shrink-0">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>)}
      <button type="button" onClick={() => append(emptyTopic())} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">add</span>Add Topic
      </button>
    </div>;
};
const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  const [aiDraft, setAiDraft] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 'beginner',
      visibility: 'public',
      weeks: [{
        title: 'Week 1',
        topics: []
      }]
    }
  });
  const {
    fields: weekFields,
    append: appendWeek,
    remove: removeWeek
  } = useFieldArray({
    control,
    name: 'weeks'
  });
  const {
    register: regAi,
    handleSubmit: handleAi,
    formState: {
      errors: aiErrors
    }
  } = useForm({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      durationWeeks: 4,
      level: 'beginner'
    }
  });

  // Creates the course, then creates its topics (if any), then navigates to the course editor.
  const saveCourseWithStructure = async ({
    title,
    description,
    level,
    category,
    visibility,
    tags = [],
    weeks = [],
    aiGenerated = false
  }) => {
    const res = await api.post('/courses', {
      title,
      description,
      level,
      category,
      visibility,
      tags,
      aiGenerated,
      modules: weeks.map((w, i) => ({
        title: w.title,
        order: i
      }))
    });
    const course = res.data.data;
    // Create topics under their matching week, in order, so ids line up.
    for (let i = 0; i < weeks.length; i++) {
      const moduleId = course.modules[i]?._id;
      const topics = weeks[i].topics || [];
      for (const topic of topics) {
        if (!moduleId || !topic.title) continue;
        // eslint-disable-next-line no-await-in-loop
        await api.post(`/courses/${course._id}/topics`, {
          moduleId,
          title: topic.title,
          difficulty: topic.difficulty || 'medium'
        });
      }
    }
    return course;
  };
  const createMut = useMutation({
    mutationFn: data => saveCourseWithStructure(data),
    onSuccess: course => navigate(`/teacher/courses/${course._id}`)
  });
  const aiGenMut = useMutation({
    mutationFn: data => api.post('/ai/course/generate', data).then(r => r.data.data),
    onSuccess: draft => setAiDraft(draft)
  });
  const saveAiDraftMut = useMutation({
    mutationFn: () => saveCourseWithStructure({
      title: aiDraft.title,
      description: aiDraft.description,
      level: aiDraft.level,
      category: aiDraft.category || 'General',
      visibility: 'public',
      tags: [],
      weeks: aiDraft.weeks,
      aiGenerated: true
    }),
    onSuccess: course => navigate(`/teacher/courses/${course._id}`)
  });
  const onManualSubmit = data => {
    const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    createMut.mutate({
      ...data,
      tags,
      weeks: data.weeks || []
    });
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Create Course</h1>
        <p className="text-on-surface-variant text-sm mt-1">Build manually or let AI generate a draft for you</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 max-w-xs">
        {['manual', 'ai'].map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${mode === m ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-lg">{m === 'ai' ? 'auto_awesome' : 'edit'}</span>
            {m === 'manual' ? 'Manual' : 'AI Generator'}
          </button>)}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'manual' ? <motion.div key="manual" initial={{
        opacity: 0,
        x: -16
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: 16
      }}>
            <form onSubmit={handleSubmit(onManualSubmit)} className="glass-card rounded-2xl border border-black/5 p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">Course Title *</label>
                <input {...register('title')} placeholder="e.g. Machine Learning Fundamentals" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">Description *</label>
                <textarea {...register('description')} rows={4} placeholder="What will students learn in this course?" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Level *</label>
                  <select {...register('level')} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Category *</label>
                  <input {...register('category')} placeholder="e.g. Data Science, Python" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  {errors.category && <p className="text-xs text-error">{errors.category.message}</p>}
                </div>

                {/* Visibility */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Visibility</label>
                  <select {...register('visibility')} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                    <option value="public">Public — visible to all</option>
                    <option value="private">Private — invite only</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Tags (comma separated)</label>
                  <input {...register('tags')} placeholder="python, ml, beginner" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>

              {/* Weeks */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/50">
                <div className="flex items-center justify-between pt-3">
                  <label className="text-xs font-semibold text-on-surface-variant">Course Weeks</label>
                  <button type="button" onClick={() => appendWeek({
                  title: `Week ${weekFields.length + 1}`,
                  topics: []
                })} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>Add Week
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">Add a week for each block of the course, and optionally list its topics now — you can always add more (plus videos, slides, and notes) after creating the course.</p>
                <div className="space-y-3">
                  {weekFields.map((field, i) => <div key={field.id} className="space-y-2 bg-surface-container/50 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 shrink-0 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <input {...register(`weeks.${i}.title`)} placeholder={`Week ${i + 1} title`} className="flex-1 px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        {weekFields.length > 1 && <button type="button" onClick={() => removeWeek(i)} className="text-on-surface-variant hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>}
                      </div>
                      <WeekTopicsEditor control={control} register={register} weekIndex={i} />
                    </div>)}
                </div>
                {errors.weeks && <p className="text-xs text-error">Every week needs a title</p>}
              </div>

              <motion.button type="submit" disabled={isSubmitting || createMut.isPending} whileTap={{
            scale: 0.98
          }} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {createMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Creating…</> : <><span className="material-symbols-outlined text-lg">add_circle</span>Create Course (Save as Draft)</>}
              </motion.button>
              {createMut.isError && <p className="text-xs text-error text-center">Failed to create course. Please try again.</p>}
            </form>
          </motion.div> : <motion.div key="ai" initial={{
        opacity: 0,
        x: 16
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: -16
      }} className="space-y-4">
            <form onSubmit={handleAi(d => aiGenMut.mutate(d))} className="glass-card rounded-2xl border border-black/5 p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">AI Course Generator</p>
                  <p className="text-xs text-on-surface-variant">Gemini will draft a full course structure for review</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">Course Name *</label>
                <input {...regAi('courseName')} placeholder="e.g. Advanced React with TypeScript" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                {aiErrors.courseName && <p className="text-xs text-error">{aiErrors.courseName.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Target Audience *</label>
                  <input {...regAi('targetAudience')} placeholder="e.g. Junior developers" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Duration (weeks)</label>
                  <input {...regAi('durationWeeks')} type="number" min={1} max={52} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Level</label>
                  <select {...regAi('level')} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">Learning Objectives *</label>
                <textarea {...regAi('learningObjectives')} rows={3} placeholder="By end of course, students will be able to…" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                {aiErrors.learningObjectives && <p className="text-xs text-error">{aiErrors.learningObjectives.message}</p>}
              </div>

              <motion.button type="submit" disabled={aiGenMut.isPending} whileTap={{
            scale: 0.98
          }} className="w-full py-3.5 primary-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {aiGenMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Generating with AI…</> : <><span className="material-symbols-outlined text-lg">auto_awesome</span>Generate Course Draft</>}
              </motion.button>
            </form>

            {/* AI Draft output */}
            <AnimatePresence>
              {aiDraft && <motion.div initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} className="glass-card rounded-2xl border border-primary/20 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">auto_awesome</span>
                      <p className="font-semibold text-on-surface">AI Generated Draft</p>
                    </div>
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full">Review before publishing</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-on-surface">{aiDraft.title}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{aiDraft.description}</p>
                    {aiDraft.category && <span className="inline-block text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full mt-1">{aiDraft.category}</span>}
                  </div>
                  <div className="bg-surface-container rounded-xl p-4 max-h-80 overflow-y-auto space-y-3">
                    {aiDraft.weeks.map((w, i) => <div key={i}>
                        <p className="text-sm font-semibold text-on-surface">{w.title}</p>
                        <ul className="mt-1 space-y-0.5">
                          {(w.topics || []).map((t, j) => <li key={j} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-primary/60">circle</span>
                              {t.title}
                            </li>)}
                        </ul>
                      </div>)}
                  </div>
                  {saveAiDraftMut.isError && <p className="text-xs text-error">Failed to save course. Please try again.</p>}
                  <div className="flex gap-3">
                    <button onClick={() => saveAiDraftMut.mutate()} disabled={saveAiDraftMut.isPending} className="flex-1 py-2.5 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                      {saveAiDraftMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Saving…</> : 'Save as Draft Course'}
                    </button>
                    <button onClick={() => setAiDraft(null)} className="px-4 py-2.5 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition-colors">
                      Regenerate
                    </button>
                  </div>
                </motion.div>}
            </AnimatePresence>
            {aiGenMut.isError && <p className="text-xs text-error text-center">Failed to generate course draft. Please try again.</p>}
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default CreateCoursePage;