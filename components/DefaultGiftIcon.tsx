import React from 'react';

export const DefaultGiftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
    {/* Bow Left */}
    <path d="M100 45 C100 45 70 10 50 30 C30 50 100 65 100 65" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2"/>
    {/* Bow Right */}
    <path d="M100 45 C100 45 130 10 150 30 C170 50 100 65 100 65" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2"/>
    
    {/* Top Left - Red */}
    <rect x="45" y="65" width="55" height="50" rx="4" fill="#F87171" />
    {/* Top Right - Orange */}
    <rect x="100" y="65" width="55" height="50" rx="4" fill="#FBBF24" />
    
    {/* Bottom Left - Yellow */}
    <rect x="45" y="115" width="55" height="50" rx="4" fill="#FCD34D" />
    {/* Bottom Right - Green */}
    <rect x="100" y="115" width="55" height="50" rx="4" fill="#34D399" />
  </svg>
);
