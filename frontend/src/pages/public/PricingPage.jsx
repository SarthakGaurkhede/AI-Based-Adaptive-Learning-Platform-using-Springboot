import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
const PricingPage = () => <StaticPageLayout title="Pricing" subtitle="Simple, for now.">
    <p>Knowledge Guru is currently free to use for students and teachers while we're building out the platform. Create an account and get started — no credit card required.</p>
    <p>If you're a school or institution interested in bringing Knowledge Guru to your students, <Link to="/contact" className="text-primary hover:underline">get in touch</Link> and we'll talk through what you need.</p>
  </StaticPageLayout>;
export default PricingPage;
