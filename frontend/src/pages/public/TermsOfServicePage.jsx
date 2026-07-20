import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
const TermsOfServicePage = () => <StaticPageLayout title="Terms of Service" subtitle="Last updated: 2026">
    <p>By creating an account and using Knowledge Guru, you agree to these terms.</p>
    <h2>Your account</h2>
    <p>You're responsible for keeping your login credentials secure and for the activity that happens under your account. Provide accurate information when registering.</p>
    <h2>Acceptable use</h2>
    <ul>
      <li>Don't share quiz answers or content in a way that undermines academic integrity at your institution.</li>
      <li>Don't attempt to access another user's account or data without authorization.</li>
      <li>Don't use the platform to upload or generate harmful, abusive, or illegal content.</li>
    </ul>
    <h2>AI-generated content</h2>
    <p>Courses, quizzes, flashcards, notes, and study plans generated with AI features are provided as a starting point. Teachers are responsible for reviewing AI-generated course and quiz content before publishing it to students.</p>
    <h2>Availability</h2>
    <p>We aim to keep Knowledge Guru available and reliable, but we don't guarantee uninterrupted access. Features that depend on third-party AI providers may be temporarily degraded if that provider has an outage.</p>
    <h2>Changes</h2>
    <p>We may update these terms as the platform evolves. Continued use after a change means you accept the updated terms.</p>
    <h2>Contact</h2>
    <p>Questions about these terms? Email <a href="mailto:support@knowledgeguru.app" className="text-primary hover:underline">support@knowledgeguru.app</a>.</p>
  </StaticPageLayout>;
export default TermsOfServicePage;
