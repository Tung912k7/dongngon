# ---

**📜 Kế Hoạch Phát Triển Website Đồng Ngôn**

## **🛠️ Tech Stack Chốt Phương Án**

* **Framework:** Next.js (TypeScript) – Đảm bảo tốc độ và sự đồng nhất.  
* **Backend & Database:** Supabase (PostgreSQL) – Lưu trữ và xử lý logic thời gian thực.  
* **Real-time:** Supabase Realtime – Cập nhật nội dung ngay lập tức mà không cần F5.  
* **Authentication:** Supabase Auth – Quản lý Bút danh và quyền sở hữu.  
* **Deployment:** GitHub \+ Vercel – Tự động hóa hoàn toàn quy trình cập nhật.

## ---

**📅 Roadmap Phát Triển (5 Phases)**

### **Phase 1: Thiết lập & Khởi tạo (Tuần 1\)**

* **Repository:** Tạo Repo trên GitHub và liên kết với dự án Vercel.  
* **Supabase Setup:** Khởi tạo dự án Supabase, thiết lập bảng Works (tác phẩm) và Contributions (câu thơ/văn).  
* **UI Foundation:** Cấu hình Tailwind CSS cho giao diện tối giản, tập trung vào trải nghiệm đọc.

### **Phase 2: Chức năng Cốt lõi \- "Tiếp sức" (Tuần 2\)**

* **Logic 1 câu/ngày:** Viết Server Action kiểm tra thời gian đóng góp cuối cùng của người dùng dựa trên user\_id.  
* **Real-time Feed:** Sử dụng Supabase Realtime để hiển thị các câu thơ mới ngay khi có người vừa gửi.  
* **Editor:** Xây dựng khung nhập liệu hỗ trợ đếm ký tự hoặc câu tùy theo chế độ của bài viết.

### **Phase 3: Quản trị Cộng đồng & Biểu quyết (Tuần 3\)**

* **Hệ thống Vote:** Cho phép người dùng biểu quyết "Kết thúc" tác phẩm.  
* **Auto-Complete:** Khi đủ phiếu bầu, Database Webhook tự động chèn \[Hết\] và chuyển trạng thái bài viết sang "Read-only".  
* **Bộ lọc:** Tích hợp danh sách từ cấm (Blacklist) để đảm bảo nội dung phù hợp với thuần phong mỹ tục.

### **Phase 4: Chế độ Riêng tư & Cá nhân hóa (Tuần 4\)**

* **Private Mode:** Tạo khu vực riêng cho bạn và người yêu, chỉ hai người có quyền đọc và viết.  
* **Nickname System:** Người dùng có thể thay đổi bút danh hiển thị bên cạnh các đóng góp của mình.  
* **Filter & Search:** Lọc tác phẩm theo thể loại thơ (Lục bát, Thất ngôn...) hoặc thời kỳ (Cổ đại \- Hiện đại).

### **Phase 5: Tối ưu & Ra mắt (Tuần 5\)**

* **Performance:** Tối ưu SEO và tốc độ tải trang bằng cơ chế ISR của Next.js (giúp trang web hiện ra tức thì).  
* **Bug Fix:** Kiểm tra các trường hợp xung đột khi nhiều người cùng gửi nội dung một lúc.  
* **Public:** Chính thức đưa vào sử dụng.

## ---

**🏗️ Sơ Đồ Kiến Trúc Hệ Thống**

## ---

**🛡️ Kế Hoạch Bảo Trì & Ổn Định**

1. **Backup:** Dữ liệu được Supabase tự động sao lưu hàng ngày.  
2. **Monitoring:** Sử dụng bảng điều khiển của Vercel để theo dõi lỗi và lưu lượng truy cập.  
3. **Hành động khi có lỗi:** Nếu code mới bị lỗi, thực hiện lệnh **Revert** trên GitHub để website quay lại phiên bản ổn định nhất trong 30 giây.

---

