import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
const ContactPage = () => <StaticPageLayout title="Contact Us" subtitle="Questions, feedback, or a bug to report — we'd like to hear it.">
    <p>The fastest way to reach us is by email:</p>
    <p><a href="mailto:support@knowledgeguru.app" className="text-primary hover:underline font-medium">support@knowledgeguru.app</a></p>
    <h2>What to include</h2>
    <ul>
      <li>Your account email and role (student / teacher)</li>
      <li>What you expected to happen, and what happened instead</li>
      <li>A screenshot, if it's a visual or display issue</li>
    </ul>
    <p>We aim to respond within 1–2 business days.</p>
  </StaticPageLayout>;
export default ContactPage;
