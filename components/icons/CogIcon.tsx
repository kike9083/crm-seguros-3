
import React from 'react';

const CogIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.364 6.364l-1.06-1.06M21.75 4.25l-1.06 1.06M4.25 4.25l1.06 1.06M19.64 19.64l-1.06-1.06M12 21v-1.5M12 3V4.5M12 12a2.25 2.25 0 01-2.25-2.25 2.25 2.25 0 012.25-2.25 2.25 2.25 0 012.25 2.25A2.25 2.25 0 0112 12z" />
  </svg>
);

export default CogIcon;
