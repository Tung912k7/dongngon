export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "01/03/2026",
    title: "Cập nhật tính năng mới",
    changes: [
      "Thêm nút \"Xuống dòng\" cho Thơ tự do — tự chọn vị trí xuống dòng khi đóng góp",
      "Tooltip đóng góp mới — nhấn vào câu để xem tác giả, sao chép hoặc xem hồ sơ",
      "Bút danh đồng bộ — đổi tên sẽ tự động cập nhật trên tất cả tác phẩm và đóng góp",
      "Gạch chân đỏ thông báo — tên người dùng sẽ được gạch chân đỏ khi có thông báo chưa đọc",
      "Sửa lỗi popup xóa tác phẩm bị lệch trên trang hồ sơ",
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0].version;
