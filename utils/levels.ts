export interface LevelInfo {
  name: string;
  minPoints: number;
  maxPoints: number; // Điểm cần để đạt cấp kế tiếp
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const LEVELS: LevelInfo[] = [
  {
    name: "Vỡ lòng",
    minPoints: 0,
    maxPoints: 50,
    bgClass: "bg-stone-500/5",
    textClass: "text-stone-600",
    borderClass: "border-stone-500/10",
  },
  {
    name: "Học sinh",
    minPoints: 50,
    maxPoints: 200,
    bgClass: "bg-blue-500/5",
    textClass: "text-blue-600",
    borderClass: "border-blue-500/10",
  },
  {
    name: "Sinh viên",
    minPoints: 200,
    maxPoints: 500,
    bgClass: "bg-teal-500/5",
    textClass: "text-teal-600",
    borderClass: "border-teal-500/10",
  },
  {
    name: "Thám hoa",
    minPoints: 500,
    maxPoints: 1000,
    bgClass: "bg-[#eae6e1]/60",
    textClass: "text-[#1c1b1a]/70",
    borderClass: "border-[#eae6e1]",
  },
  {
    name: "Bảng nhãn",
    minPoints: 1000,
    maxPoints: 2500,
    bgClass: "bg-[#134e4a]/5",
    textClass: "text-[#134e4a]",
    borderClass: "border-[#134e4a]/10",
  },
  {
    name: "Trạng nguyên",
    minPoints: 2500,
    maxPoints: Infinity,
    bgClass: "bg-[#d4af37]/10",
    textClass: "text-[#d4af37]",
    borderClass: "border-[#d4af37]/20",
  },
];

export function getLevelInfo(points: number): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  progressPercent: number;
} {
  const currentLevel =
    LEVELS.find((lvl) => points >= lvl.minPoints && points < lvl.maxPoints) ||
    LEVELS[LEVELS.length - 1];

  const currentLevelIndex = LEVELS.indexOf(currentLevel);
  const nextLevel = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1] : null;

  let progressPercent = 0;
  if (!nextLevel) {
    progressPercent = 100;
  } else {
    const range = currentLevel.maxPoints - currentLevel.minPoints;
    const gained = points - currentLevel.minPoints;
    progressPercent = Math.min(100, Math.max(0, (gained / range) * 100));
  }

  return { currentLevel, nextLevel, progressPercent };
}
