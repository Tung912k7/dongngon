// components/hdsd/HelpCenterIconMap.tsx
// Maps icon names to styled SVG icons for Help Center sections.
// Icons use thin-stroke outline style matching the design reference.

import React from 'react';

interface HelpCenterIconMapProps {
  icon?: string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, (size: number) => React.ReactElement> = {
  // Account icon — person silhouette
  account: (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
    </svg>
  ),

  // Create icon — pencil
  create: (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),

  // Collaborate icon — multiple people
  collaborate: (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M2 20c0-3.5 3-6.5 7-6.5" />
      <path d="M22 20c0-3.5-3-6.5-7-6.5" />
      <path d="M9 13.5c1.5 0 4.5 1 4.5 6.5" />
    </svg>
  ),

  // Stats icon — bookshelf
  stats: (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V5" />
      <path d="M8 19V5" />
      <path d="M12 19V8" />
      <path d="M16 19l-2-14" />
      <path d="M2 19h20" />
    </svg>
  ),

  // Content icon — shield / document
  content: (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-5z" />
    </svg>
  ),

  // Settings icon — gear with cog teeth
  settings: (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  // Fallback question icon
  question: (size) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
};

const HelpCenterIconMap: React.FC<HelpCenterIconMapProps> = ({
  icon = 'question',
  size = 36,
  className,
}) => {
  const renderIcon = iconMap[icon] || iconMap['question'];

  return (
    <span
      className={className}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {renderIcon(size)}
    </span>
  );
};

export default HelpCenterIconMap;
