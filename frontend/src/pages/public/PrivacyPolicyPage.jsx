import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
const PrivacyPolicyPage = () => <StaticPageLayout title="Privacy Policy" subtitle="Last updated: 2026">
    <p>This Privacy Policy explains what information Knowledge Guru ("we", "us") collects, how we use it, and the choices you have.</p>
    <h2>Information we collect</h2>
    <ul>
      <li><strong>Account information:</strong> name, email address, and role (student or teacher).</li>
      <li><strong>Learning activity:</strong> quiz attempts and scores, course enrollment and progress, flashcard reviews, and AI tutor conversations, used to detect knowledge gaps and generate recommendations.</li>
      <li><strong>Usage data:</strong> basic technical logs (timestamps, request paths) used for security and debugging.</li>
    </ul>
    <h2>How we use it</h2>
    <p>We use your data to operate the platform: tracking your progress, generating personalized recommendations and study plans, computing rankings and achievements, and letting your teacher see class-wide performance. We do not sell your personal data.</p>
    <h2>AI processing</h2>
    <p>Some features (course generation, quiz generation, the AI tutor, flashcards, study plans) send relevant text to a third-party AI provider (Google Gemini) to generate content. We do not send your password or payment information to any AI provider.</p>
    <h2>Data retention</h2>
    <p>We retain your account and learning data for as long as your account is active. You can request deletion of your account and associated data by contacting us.</p>
    <h2>Your choices</h2>
    <p>You can update your profile information at any time from Settings, and you can request a copy or deletion of your data by reaching out via our <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
    <h2>Contact</h2>
    <p>Questions about this policy? Email <a href="mailto:privacy@knowledgeguru.app" className="text-primary hover:underline">privacy@knowledgeguru.app</a>.</p>
  </StaticPageLayout>;
export default PrivacyPolicyPage;
