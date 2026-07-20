import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
const StaticPageLayout = ({
  title,
  subtitle,
  children
}) => {
  return <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-16">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">{title}</h1>
          {subtitle && <p className="text-on-surface-variant mb-8">{subtitle}</p>}
          <div className="prose-content space-y-5 text-on-surface-variant leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-on-surface [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
            {children}
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline text-sm mt-10">
            <span className="material-symbols-outlined text-base">arrow_back</span>Back to Home
          </Link>
        </motion.div>
      </main>
    </div>;
};
export default StaticPageLayout;
