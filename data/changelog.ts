export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.6.0",
    date: "13/05/2026",
    title: "Cải thiện và tối ưu hệ thống",
    changes: [
      "Cập nhật và tối ưu giao diện",
      "Thay đổi nhẹ hệ thống thông báo hiện đại",
      "Cải thiện khả năng truy cập",
    ],
  },
  {
    version: "1.5.0",
    date: "11/05/2026",
    title: "Tối ưu hạ tầng & Hệ thống viết thời gian thực",
    changes: [
      "Tính năng chia sẻ những câu văn hay",
      "Tối ưu hiển thị",
      "Bổ sung chức năng xác nhận trước khi gửi đóng góp",
      "Tăng cường bảo mật và bảo vệ dữ liệu",
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0].version;

