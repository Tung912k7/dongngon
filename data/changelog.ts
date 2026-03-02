export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.2.0",
    date: "02/03/2026",
    title: "Cải tiến quản lý tác phẩm & cá nhân hóa",
    changes: [
      "Thêm mô tả cho tác phẩm — giờ đây bạn có thể thêm mô tả chi tiết, hiển thị ngay trên Pop-up xem trước tác phẩm",
      "Nâng cấp quyền riêng tư — cho phép chuyển đổi trạng thái tác phẩm từ \"Riêng tư\" sang \"Cộng đồng\"",
      "Ô nhập ngày sinh thông minh — tích hợp lịch chọn và tự động định dạng DD/MM/YYYY chuẩn Việt Nam",
      "Cải tiến bộ lọc nội dung — cho phép viết ngày tháng năm (Dạng nhật ký) mà không bắt buộc dấu câu kết thúc",
    ],
  },
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
