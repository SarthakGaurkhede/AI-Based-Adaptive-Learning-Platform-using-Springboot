import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
const FeaturesPage = () => <StaticPageLayout title="Features" subtitle="Everything Knowledge Guru does, in one place.">
    <h2>For Students</h2>
    <ul>
      <li>Knowledge gap detection from quiz performance, scored per topic</li>
      <li>Personalized recommendations that update after every quiz</li>
      <li>AI-generated study plans (daily, weekly, monthly)</li>
      <li>AI flashcards and practice quizzes on demand</li>
      <li>AI tutor chat for course-specific questions</li>
      <li>XP, streaks, achievements, and leaderboards</li>
      <li>Knowledge battles — real-time quiz duels with classmates</li>
    </ul>
    <h2>For Teachers</h2>
    <ul>
      <li>AI-assisted course creation — describe a course, get a week-by-week structure with topics</li>
      <li>Manual and AI-generated quizzes with automatic grading</li>
      <li>Class-wide knowledge gap reports, with one-click student notifications</li>
      <li>Student analytics and performance rankings</li>
      <li>CSV export for reporting</li>
    </ul>
    <h2>For Admins</h2>
    <ul>
      <li>Platform-wide analytics and user management</li>
      <li>Course moderation, audit logs, and security event monitoring</li>
      <li>AI usage and cost tracking</li>
    </ul>
  </StaticPageLayout>;
export default FeaturesPage;
