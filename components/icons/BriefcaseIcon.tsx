import React from 'react';

const BriefcaseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.09a2.25 2.25 0 0 1-2.25 2.25h-13.5a2.25 2.25 0 0 1-2.25-2.25v-4.09m18-4.91a2.25 2.25 0 0 0-2.25-2.25h-13.5a2.25 2.25 0 0 0-2.25 2.25m18 0-.066.066m-17.868 0L2.25 14.15m15.75-4.91v-4.82a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v4.82" />
  </svg>
);

export default BriefcaseIcon;
