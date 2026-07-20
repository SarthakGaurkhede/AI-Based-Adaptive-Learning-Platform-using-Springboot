import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './AppLayout';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000
    }
  }
});

// ── Public ─────────────────────────────────────────────────────
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/public/TermsOfServicePage'));
// ── Auth ───────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
// ── Student ────────────────────────────────────────────────────
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyCoursesPage = lazy(() => import('./pages/student/MyCoursesPage'));
const CourseViewerPage = lazy(() => import('./pages/student/CourseViewerPage'));
const KnowledgeGapsPage = lazy(() => import('./pages/student/KnowledgeGapsPage'));
const AiTutorPage = lazy(() => import('./pages/student/AiTutorPage'));
const QuizPage = lazy(() => import('./pages/student/QuizPage'));
const QuizResultsPage = lazy(() => import('./pages/student/QuizResultsPage'));
const RecommendationsPage = lazy(() => import('./pages/student/RecommendationsPage'));
const StudyPlanPage = lazy(() => import('./pages/student/StudyPlanPage'));
const FlashcardsPage = lazy(() => import('./pages/student/FlashcardsPage'));
const AiNotesPage = lazy(() => import('./pages/student/AiNotesPage'));
const AiQuizGeneratorPage = lazy(() => import('./pages/student/AiQuizGeneratorPage'));
const LeaderboardPage = lazy(() => import('./pages/student/LeaderboardPage'));
const AchievementsPage = lazy(() => import('./pages/student/AchievementsPage'));
const RankHistoryPage = lazy(() => import('./pages/student/RankHistoryPage'));
const StudentComparisonPage = lazy(() => import('./pages/student/StudentComparisonPage'));
const KnowledgeBattlePage = lazy(() => import('./pages/student/KnowledgeBattlePage'));
const HallOfFamePage = lazy(() => import('./pages/student/HallOfFamePage'));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'));
const ProgressAnalyticsPage = lazy(() => import('./pages/student/ProgressAnalyticsPage'));
const StudentProfilePage = lazy(() => import('./pages/student/StudentProfilePage'));
// ── Teacher ────────────────────────────────────────────────────
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const CreateCoursePage = lazy(() => import('./pages/teacher/CreateCoursePage'));
const CourseDetailPage = lazy(() => import('./pages/teacher/CourseDetailPage'));
const CourseManagementPage = lazy(() => import('./pages/teacher/CourseManagementPage'));
const QuizBuilderPage = lazy(() => import('./pages/teacher/QuizBuilderPage'));
const TeacherStudentAnalyticsPage = lazy(() => import('./pages/teacher/TeacherStudentAnalyticsPage'));
const AiGapReportsPage = lazy(() => import('./pages/teacher/AiGapReportsPage'));
const StudentRankingsPage = lazy(() => import('./pages/teacher/StudentRankingsPage'));
const TeacherProfilePage = lazy(() => import('./pages/teacher/TeacherProfilePage'));
// ── Admin ──────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const CourseModerationPage = lazy(() => import('./pages/admin/CourseModerationPage'));
const PlatformAnalyticsPage = lazy(() => import('./pages/admin/PlatformAnalyticsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const SecurityCenterPage = lazy(() => import('./pages/admin/SecurityCenterPage'));
const AiCostDashboard = lazy(() => import('./pages/admin/AiCostDashboard'));
const SearchAnalyticsPage = lazy(() => import('./pages/admin/SearchAnalyticsPage'));
const SystemMonitoringPage = lazy(() => import('./pages/admin/SystemMonitoringPage'));
// ── Shared ─────────────────────────────────────────────────────
const SettingsPage = lazy(() => import('./pages/shared/SettingsPage'));
const PageLoader = () => <div className="flex items-center justify-center h-screen bg-surface">
    <div className="text-center space-y-4">
      <div className="w-14 h-14 primary-gradient rounded-2xl mx-auto flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
        <span className="material-symbols-outlined text-white text-3xl" style={{
        fontVariationSettings: "'FILL' 1"
      }}>school</span>
      </div>
      <div className="flex gap-1 justify-center">
        {[0, 0.15, 0.3].map(d => <div key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{
        animationDelay: `${d}s`
      }} />)}
      </div>
    </div>
  </div>;
const RequireAuth = ({
  children,
  roles
}) => {
  const {
    isAuthenticated,
    isLoading,
    user
  } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{
    from: location
  }} replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};
const RequireGuest = ({
  children
}) => {
  const {
    isAuthenticated,
    isLoading,
    user
  } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) {
    if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return <>{children}</>;
};
const AppRoutes = () => <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />
      <Route path="/forgot-password" element={<RequireGuest><ForgotPasswordPage /></RequireGuest>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* ── Student (16 + gamification 7) ── */}
      <Route element={<RequireAuth roles={['student']}><AppLayout /></RequireAuth>}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<MyCoursesPage />} />
        <Route path="/student/courses/:courseId" element={<CourseViewerPage />} />
        <Route path="/student/knowledge-gaps" element={<KnowledgeGapsPage />} />
        <Route path="/student/recommendations" element={<RecommendationsPage />} />
        <Route path="/student/study-plan" element={<StudyPlanPage />} />
        <Route path="/student/flashcards" element={<FlashcardsPage />} />
        <Route path="/student/ai-notes" element={<AiNotesPage />} />
        <Route path="/student/ai-quiz-generator" element={<AiQuizGeneratorPage />} />
        <Route path="/student/ai-tutor" element={<AiTutorPage />} />
        <Route path="/student/quizzes/:quizId" element={<QuizPage />} />
        <Route path="/student/quizzes/:quizId/results/:attemptId" element={<QuizResultsPage />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route path="/student/analytics" element={<ProgressAnalyticsPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/student/settings" element={<SettingsPage />} />
        {/* Gamification */}
        <Route path="/student/leaderboards" element={<LeaderboardPage />} />
        <Route path="/student/achievements" element={<AchievementsPage />} />
        <Route path="/student/rank-history" element={<RankHistoryPage />} />
        <Route path="/student/compare" element={<StudentComparisonPage />} />
        <Route path="/student/knowledge-battle" element={<KnowledgeBattlePage />} />
        <Route path="/student/hall-of-fame" element={<HallOfFamePage />} />
      </Route>

      {/* ── Teacher (8 + rankings) ── */}
      <Route element={<RequireAuth roles={['teacher']}><AppLayout /></RequireAuth>}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<CourseManagementPage />} />
        <Route path="/teacher/create-course" element={<CreateCoursePage />} />
        <Route path="/teacher/courses/:id" element={<CourseDetailPage />} />
        <Route path="/teacher/quiz-builder" element={<QuizBuilderPage />} />
        <Route path="/teacher/students" element={<TeacherStudentAnalyticsPage />} />
        <Route path="/teacher/reports" element={<AiGapReportsPage />} />
        <Route path="/teacher/rankings" element={<StudentRankingsPage />} />
        <Route path="/teacher/profile" element={<TeacherProfilePage />} />
        <Route path="/teacher/settings" element={<SettingsPage />} />
      </Route>

      {/* ── Admin (10) ── */}
      <Route element={<RequireAuth roles={['admin']}><AppLayout /></RequireAuth>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/courses" element={<CourseModerationPage />} />
        <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/admin/security" element={<SecurityCenterPage />} />
        <Route path="/admin/ai-usage" element={<AiCostDashboard />} />
        <Route path="/admin/search-analytics" element={<SearchAnalyticsPage />} />
        <Route path="/admin/monitoring" element={<SystemMonitoringPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>;
const App = () => <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>;
export default App;