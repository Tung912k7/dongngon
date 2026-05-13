export function formatDate(date: string | Date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getTimeUntilNextVN0() {
  const now = new Date();
  // Chuyển thời gian hiện tại sang múi giờ VN để tính toán
  const vnNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  
  const nextVN0 = new Date(vnNow);
  nextVN0.setDate(vnNow.getDate() + 1);
  nextVN0.setHours(0, 0, 0, 0);
  
  const diff = nextVN0.getTime() - vnNow.getTime();
  return Math.max(0, diff);
}

export function formatCountdown(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

