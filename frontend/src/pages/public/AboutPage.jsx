import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
const AboutPage = () => <StaticPageLayout title="About Knowledge Guru" subtitle="Adaptive learning, built around your actual knowledge gaps.">
    <p>Knowledge Guru is an adaptive learning platform that helps students find and close their knowledge gaps, and helps teachers see exactly where their class is struggling — instead of guessing.</p>
    <h2>What we do differently</h2>
    <p>Most course platforms track whether you finished a video. We track whether you actually understood the material — by analyzing quiz performance at the topic level, surfacing weak spots automatically, and generating personalized study plans and recommendations that update as you learn.</p>
    <h2>Who it's for</h2>
    <ul>
      <li><strong>Students</strong> get a clear, prioritized view of what to study next, AI-generated flashcards and quizzes, and progress tracking that goes deeper than a completion percentage.</li>
      <li><strong>Teachers</strong> get class-wide gap reports, AI-assisted course and quiz creation, and the ability to notify students who need to revisit a topic — all in one place.</li>
    </ul>
    <p>We're a small team building the tool we wish existed when we were both teaching and studying.</p>
  </StaticPageLayout>;
export default AboutPage;
