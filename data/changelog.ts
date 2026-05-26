export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.7.0",
    date: "26/05/2026",
    title: "Tối ưu hóa Sidebar & Sửa lỗi hiển thị",
    changes: [
      "Tự động đồng bộ vị trí đọc bài theo vị trí cuộn trang.",
      "Khắc phục triệt để lỗi Sidebar và tối ưu khoảng cách vị trí.",
      "Thiết kế lại toàn bộ trang web",
    ],
  },
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
];

export const LATEST_VERSION = CHANGELOG[0].version;
