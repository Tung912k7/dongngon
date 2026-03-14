export type WikiArticle = {
  id: string;
  title: string;
  summary: string;
  content: string[];
};

export type WikiSection = {
  id: string;
  title: string;
  description: string;
  articles: WikiArticle[];
};

export const WIKI_SECTIONS: WikiSection[] = [
  {
    id: "bat-dau-nhanh",
    title: "Bắt đầu nhanh",
    description: "Những bước ngắn giúp bạn hiểu cách dùng Đồng Ngôn trong lần đầu.",
    articles: [
      {
        id: "tao-tai-khoan",
        title: "Đăng ký và hoàn thiện hồ sơ",
        summary: "Tạo tài khoản, chọn bút danh và kiểm tra cài đặt hồ sơ cơ bản.",
        content: [
          "Mở trang đăng ký và hoàn tất xác thực Email.",
          "Đặt bút danh rõ ràng để người khác dễ nhận biết khi đóng góp.",
          "Vào phần Cài đặt để bổ sung mô tả ngắn cho hồ sơ của bạn.",
        ],
      },
      {
        id: "tim-va-doc",
        title: "Tìm và đọc tác phẩm",
        summary: "Dùng tìm kiếm và bộ lọc trong Kho tàng để chọn tác phẩm phù hợp.",
        content: [
          "Dùng ô tìm kiếm ở đầu trang để lọc theo từ khóa.",
          "Trong Kho tàng, kết hợp bộ lọc thể loại và trạng thái để thu hẹp kết quả.",
          "Mở trang chi tiết tác phẩm để xem toàn bộ tiến trình đóng góp.",
        ],
      },
    ],
  },
  {
    id: "dong-gop",
    title: "Đóng góp và tương tác",
    description: "Hướng dẫn viết dòng mới, giữ đúng tinh thần cộng tác và bình chọn.",
    articles: [
      {
        id: "viet-dong-dau",
        title: "Viết đóng góp đầu tiên",
        summary: "Cách gửi nội dung hợp lệ và theo đúng quy tắc của tác phẩm.",
        content: [
          "Mở một tác phẩm còn đang hoạt động để gửi nội dung.",
          "Kiểm tra quy tắc số chữ hoặc nhịp điệu trước khi bấm gửi.",
          "Nếu hệ thống báo lỗi, chỉnh lại nội dung theo gợi ý rồi gửi lại.",
        ],
      },
      {
        id: "binh-chon",
        title: "Bình chọn đóng góp",
        summary: "Cách bình chọn giúp tác phẩm tiến tới phiên bản hoàn chỉnh.",
        content: [
          "Đọc các đóng góp gần nhất để hiểu mạch nội dung.",
          "Bình chọn những dòng phù hợp về ý và nhịp.",
          "Theo dõi thông báo để biết khi tác phẩm có cập nhật mới.",
        ],
      },
    ],
  },
  {
    id: "tai-khoan",
    title: "Tài khoản và cài đặt",
    description: "Quản lý thông tin tài khoản, riêng tư và các tùy chọn hiển thị.",
    articles: [
      {
        id: "quan-ly-ho-so",
        title: "Quản lý hồ sơ",
        summary: "Chỉnh bút danh, ảnh đại diện và thông tin mô tả cá nhân.",
        content: [
          "Vào Cài đặt > Hồ sơ cá nhân để cập nhật thông tin.",
          "Bút danh cần tuân thủ quy tắc cộng đồng và không trùng lặp.",
          "Lưu thay đổi và tải lại hồ sơ để kiểm tra hiển thị.",
        ],
      },
      {
        id: "bao-mat",
        title: "Bảo mật tài khoản",
        summary: "Đổi mật khẩu và các lưu ý an toàn khi sử dụng tài khoản.",
        content: [
          "Sử dụng mật khẩu mạnh và không dùng lại ở nhiều nơi.",
          "Nếu quên mật khẩu, dùng chức năng khôi phục ở trang đăng nhập.",
          "Đăng xuất khi dùng thiết bị công cộng để bảo vệ dữ liệu cá nhân.",
        ],
      },
    ],
  },
];
