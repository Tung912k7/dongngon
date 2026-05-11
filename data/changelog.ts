export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.5.0",
    date: "11/05/2026",
    title: "Tối ưu hạ tầng & Hệ thống viết thời gian thực",
    changes: [
      "Tối ưu khung hiển thị văn bản",
      "Bổ sung chức năng xác nhận trước khi gửi đóng góp",
      "Tăng cường bảo mật",
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0].version;
