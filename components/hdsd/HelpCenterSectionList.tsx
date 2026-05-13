// components/hdsd/HelpCenterSectionList.tsx
// Displays a 3-column responsive grid of Help Center section cards.

import React from 'react';
import { HelpCenterSection } from '@/types/helpCenter';
import HelpCenterSectionCard from './HelpCenterSectionCard';

interface HelpCenterSectionListProps {
  sections: (HelpCenterSection & { articleCount?: number })[];
  onSelectSection?: (section: HelpCenterSection) => void;
}

const HelpCenterSectionList: React.FC<HelpCenterSectionListProps> = ({
  sections,
  onSelectSection,
}) => {
  if (!sections.length) {
    return (
      <div className="text-neutral-400 text-center py-12 text-base">
        Không tìm thấy chủ đề phù hợp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {sections.map((section) => (
        <HelpCenterSectionCard
          key={section.id}
          section={section}
          onClick={() => onSelectSection?.(section)}
        />
      ))}
    </div>
  );
};

export default HelpCenterSectionList;

