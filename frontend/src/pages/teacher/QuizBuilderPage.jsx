import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const questionSchema = z.object({
  text: z.string().min(3, 'Question text is required'),
  options: z.array(z.object({
    value: z.string().min(1, 'Option cannot be empty')
  })).min(2, 'At least 2 options required'),
  correctIndex: z.coerce.number().min(0),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.coerce.number().min(1)
});
const schema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  topicId: z.string().min(1, 'Select a week/topic'),
  title: z.string().min(3, 'Title required'),
  passPercent: z.coerce.number().min(1).max(100),
  timeLimitMinutes: z.coerce.number().min(1),
  publishNow: z.boolean().optional(),
  isDiagnostic: z.boolean().optional(),
  questions: z.array(questionSchema).min(1, 'Add at least one question')
});
const aiSchema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  topicId: z.string().min(1, 'Select a week/topic'),
  title: z.string().min(3, 'Title required'),
  subject: z.string().min(2),
  topic: z.string().min(2),
  questionCount: z.coerce.number().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  marksPerQuestion: z.coerce.number().min(1),
  publishNow: z.boolean().optional(),
  isDiagnostic: z.boolean().optional()
});
const emptyQuestion = () => ({
  text: '',
  options: [{
    value: ''
  }, {
    value: ''
  }, {
    value: ''
  }, {
    value: ''
  }],
  correctIndex: 0,
  difficulty: 'medium',
  marks: 1
});
const useCoursesAndTopics = courseId => {
  const {
    data: coursesData
  } = useQuery({
    queryKey: ['my-courses-for-quiz'],
    queryFn: () => api.get('/courses?mine=true&limit=100').then(r => r.data)
  });
  const {
    data: topicsData
  } = useQuery({
    queryKey: ['course-topics-for-quiz', courseId],
    queryFn: () => api.get(`/courses/${courseId}/topics`).then(r => r.data),
    enabled: !!courseId
  });
  return {
    courses: coursesData?.data || [],
    topics: topicsData?.data || []
  };
};
const QuizBuilderPage = () => {
  const [mode, setMode] = useState('ai');
  const [aiQuestions, setAiQuestions] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      passPercent: 60,
      timeLimitMinutes: 30,
      publishNow: true,
      questions: [emptyQuestion()]
    }
  });
  const {
    fields: qFields,
    append: appendQ,
    remove: removeQ
  } = useFieldArray({
    control,
    name: 'questions'
  });
  const manualCourseId = watch('courseId');
  const {
    courses: manualCourses,
    topics: manualTopics
  } = useCoursesAndTopics(manualCourseId);
  const {
    register: regAi,
    handleSubmit: handleAi,
    watch: watchAi
  } = useForm({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      questionCount: 10,
      difficulty: 'mixed',
      marksPerQuestion: 1,
      publishNow: true
    }
  });
  const aiCourseId = watchAi('courseId');
  const {
    courses: aiCourses,
    topics: aiTopics
  } = useCoursesAndTopics(aiCourseId);
  const createMut = useMutation({
    mutationFn: data => api.post('/quizzes', {
      courseId: data.courseId,
      topicId: data.topicId,
      title: data.title,
      passPercent: data.passPercent,
      timeLimitMinutes: data.timeLimitMinutes,
      status: data.publishNow ? 'published' : 'draft',
      isDiagnostic: !!data.isDiagnostic,
      questions: data.questions.map(q => ({
        type: 'mcq',
        text: q.text,
        options: q.options.map(o => o.value),
        correctAnswer: q.options[q.correctIndex]?.value,
        difficulty: q.difficulty,
        marks: q.marks
      }))
    })
  });
  const [aiMeta, setAiMeta] = useState(null);
  const aiGenMut = useMutation({
    mutationFn: data => api.post('/ai/quiz/generate', {
      subject: data.subject,
      topic: data.topic,
      questionCount: data.questionCount,
      difficulty: data.difficulty,
      marksPerQuestion: data.marksPerQuestion
    }).then(r => r.data.data),
    onSuccess: (questions, variables) => {
      setAiQuestions(questions);
      setAiMeta(variables);
    }
  });
  const saveAiMut = useMutation({
    mutationFn: () => api.post('/quizzes', {
      courseId: aiMeta.courseId,
      topicId: aiMeta.topicId,
      title: aiMeta.title,
      passPercent: 60,
      timeLimitMinutes: 30,
      status: aiMeta.publishNow ? 'published' : 'draft',
      isDiagnostic: !!aiMeta.isDiagnostic,
      questions: aiQuestions
    })
  });
  return <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">Quiz Builder</h1>
        <p className="text-on-surface-variant text-sm mt-1">Create quizzes manually or generate with AI</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 max-w-xs">
        {['ai', 'manual'].map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${mode === m ? 'bg-white dark:bg-surface-container-low shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-lg">{m === 'ai' ? 'auto_awesome' : 'edit'}</span>
            {m === 'ai' ? 'AI Generator' : 'Manual'}
          </button>)}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'ai' ? <motion.div key="ai" initial={{
        opacity: 0,
        x: -16
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0
      }} className="space-y-4">
            <form onSubmit={handleAi(d => aiGenMut.mutate(d))} className="glass-card rounded-2xl border border-black/5 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                </div>
                <p className="font-semibold text-on-surface">AI Quiz Generator</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Course *</label>
                  <select {...regAi('courseId')} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                    <option value="">Select a course…</option>
                    {aiCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Week / Topic *</label>
                  <select {...regAi('topicId')} disabled={!aiCourseId} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none disabled:opacity-50">
                    <option value="">{aiCourseId ? 'Select a topic…' : 'Select a course first'}</option>
                    {aiTopics.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant">Quiz Title *</label>
                  <input {...regAi('title')} placeholder="e.g. Week 1 Checkpoint Quiz" className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                {[{
              name: 'subject',
              label: 'Subject',
              placeholder: 'e.g. Physics'
            }, {
              name: 'topic',
              label: 'Question Focus',
              placeholder: 'e.g. Quantum Mechanics'
            }].map(f => <div key={f.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">{f.label} *</label>
                    <input {...regAi(f.name)} placeholder={f.placeholder} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>)}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Difficulty</label>
                  <select {...regAi('difficulty')} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                    {['easy', 'medium', 'hard', 'mixed'].map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Questions</label>
                  <input {...regAi('questionCount')} type="number" min={1} max={50} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant sm:col-span-2">
                  <input type="checkbox" {...regAi('publishNow')} className="rounded" />Publish immediately (students can take it right away)
                </label>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant sm:col-span-2">
                  <input type="checkbox" {...regAi('isDiagnostic')} className="rounded" />Make this the course's placement/baseline quiz — students are prompted to take it right after enrolling
                </label>
              </div>

              <motion.button type="submit" disabled={aiGenMut.isPending} whileTap={{
            scale: 0.97
          }} className="w-full py-3 primary-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {aiGenMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Generating…</> : <><span className="material-symbols-outlined text-lg">auto_awesome</span>Generate Questions</>}
              </motion.button>
              {aiGenMut.isError && <p className="text-xs text-error text-center">Failed to generate questions. Please try again.</p>}
            </form>

            {/* Preview generated questions */}
            <AnimatePresence>
              {aiQuestions.length > 0 && <motion.div initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-on-surface">{aiQuestions.length} Questions Generated</p>
                    <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">Review before saving</span>
                  </div>
                  {aiQuestions.slice(0, 5).map((q, i) => <motion.div key={i} initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: i * 0.06
            }} className="glass-card rounded-xl border border-black/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-on-surface-variant">Q{i + 1}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                          ${q.difficulty === 'hard' ? 'bg-error/10 text-error' : q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300' : 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300'}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-on-surface-variant">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface">{q.text}</p>
                      {q.options && <div className="grid grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg ${opt === q.correctAnswer ? 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-300 font-medium' : 'bg-surface-container text-on-surface-variant'}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </div>)}
                        </div>}
                    </motion.div>)}
                  {aiQuestions.length > 5 && <p className="text-xs text-center text-on-surface-variant">+ {aiQuestions.length - 5} more questions</p>}
                  {saveAiMut.isError && <p className="text-xs text-error text-center">Failed to save quiz. Please try again.</p>}
                  {saveAiMut.isSuccess ? <div className="text-center py-3 rounded-xl bg-green-50 dark:bg-green-400/10 text-green-700 dark:text-green-300 text-sm font-medium flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">check_circle</span>Quiz saved!
                    </div> : <button onClick={() => saveAiMut.mutate()} disabled={saveAiMut.isPending} className="w-full py-3 primary-gradient text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                      {saveAiMut.isPending ? <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Saving…</> : 'Save Quiz Draft'}
                    </button>}
                </motion.div>}
            </AnimatePresence>
          </motion.div> : <motion.div key="manual" initial={{
        opacity: 0,
        x: 16
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0
      }}>
            <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
              <div className="glass-card rounded-2xl border border-black/5 p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Course *</label>
                    <select {...register('courseId')} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
                      <option value="">Select a course…</option>
                      {manualCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                    {errors.courseId && <p className="text-xs text-error">{errors.courseId.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Week / Topic *</label>
                    <select {...register('topicId')} disabled={!manualCourseId} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none disabled:opacity-50">
                      <option value="">{manualCourseId ? 'Select a topic…' : 'Select a course first'}</option>
                      {manualTopics.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                    </select>
                    {errors.topicId && <p className="text-xs text-error">{errors.topicId.message}</p>}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface-variant">Quiz Title *</label>
                    <input {...register('title')} placeholder="e.g. Module 1 Quiz" className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Pass %</label>
                    <input {...register('passPercent')} type="number" min={1} max={100} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Time Limit (min)</label>
                    <input {...register('timeLimitMinutes')} type="number" min={1} className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" {...register('publishNow')} className="rounded" />Publish immediately (students can take it right away)
                </label>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" {...register('isDiagnostic')} className="rounded" />Make this the course's placement/baseline quiz — students are prompted to take it right after enrolling
                </label>
              </div>

              {/* Questions builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-on-surface text-sm">Questions</p>
                  <button type="button" onClick={() => appendQ(emptyQuestion())} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>Add Question
                  </button>
                </div>
                {errors.questions?.message && <p className="text-xs text-error">{errors.questions.message}</p>}
                {qFields.map((field, qi) => <div key={field.id} className="glass-card rounded-2xl border border-black/5 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface-variant">Q{qi + 1}</span>
                      {qFields.length > 1 && <button type="button" onClick={() => removeQ(qi)} className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>}
                    </div>
                    <input {...register(`questions.${qi}.text`)} placeholder="Question text" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    {errors.questions?.[qi]?.text && <p className="text-xs text-error">{errors.questions[qi].text.message}</p>}
                    <div className="space-y-1.5">
                      {[0, 1, 2, 3].map(oi => <div key={oi} className="flex items-center gap-2">
                          <input type="radio" {...register(`questions.${qi}.correctIndex`)} value={oi} className="shrink-0" />
                          <input {...register(`questions.${qi}.options.${oi}.value`)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="flex-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>)}
                      <p className="text-[11px] text-on-surface-variant pl-6">Select the radio button next to the correct option</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-on-surface-variant">Difficulty</label>
                        <select {...register(`questions.${qi}.difficulty`)} className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none">
                          {['easy', 'medium', 'hard'].map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-on-surface-variant">Marks</label>
                        <input {...register(`questions.${qi}.marks`)} type="number" min={1} className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none" />
                      </div>
                    </div>
                  </div>)}
              </div>

              {createMut.isError && <p className="text-xs text-error text-center">Failed to create quiz. Please check all fields and try again.</p>}
              {createMut.isSuccess ? <div className="text-center py-3 rounded-xl bg-green-50 dark:bg-green-400/10 text-green-700 dark:text-green-300 text-sm font-medium flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span>Quiz created!
                </div> : <motion.button type="submit" disabled={createMut.isPending} whileTap={{
            scale: 0.97
          }} className="w-full py-3 primary-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-60">
                  {createMut.isPending ? 'Creating…' : 'Create Quiz'}
                </motion.button>}
            </form>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default QuizBuilderPage;
