const BLACKLIST = [
  "phản động",
  "kích động",
  "bạo lực",
  "khiêu dâm",
  "đồi trụy",
  "xxx",
  // Add more words as needed
];

export function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLACKLIST.some((word) => lowerText.includes(word));
}
