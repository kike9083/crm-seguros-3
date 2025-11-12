
import React from 'react';

const UserGroupIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.965 0m-11.238 0a3.75 3.75 0 015.965 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default UserGroupIcon;
