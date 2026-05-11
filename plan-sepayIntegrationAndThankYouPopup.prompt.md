## Plan: Tích hợp Sepay và hiển thị pop-up cảm ơn

TL;DR - Tích hợp Sepay qua backend (Next.js API route hoặc backend riêng), dùng môi trường Sandbox để thử nghiệm. Sau khi giao dịch thành công, backend xác thực và lưu `payments` record vào DB (Supabase), frontend hiển thị modal cảm ơn (centered). Số tiền do người dùng nhập.

**Steps**
1. Thiết kế DB (Supabase):
   - Tạo bảng `payments` với các cột: `id (uuid)`, `user_id`, `amount`, `currency`, `status` (pending/succeeded/failed), `sepay_transaction_id`, `metadata` (json), `created_at`, `updated_at`.
   - *depends on DB access* — nếu bạn dùng Supabase, tạo migration/sql tương ứng.

2. Backend endpoints (Next.js API routes hoặc backend service):
   - `POST /api/sepay/create` — nhận yêu cầu thanh toán (amount, user id, metadata), tạo giao dịch tạm thời ở DB (status = pending), gọi Sepay API để nhận URL thanh toán / token trả về cho client.
   - `POST /api/sepay/webhook` — endpoint nhận webhook từ Sepay; verify signature, cập nhật `payments` record (status), xử lý idempotency.
   - `GET /api/sepay/verify` (tuỳ chọn) — endpoint để client gọi kiểm tra trạng thái giao dịch sau redirect nếu cần.
   - Bảo mật: keys lưu trong server env (`SEPAY_KEY`, `SEPAY_SECRET`), không expose lên client.

3. Frontend (Next.js + React):
   - Tạo component `PaymentForm` hoặc `SepayButton` nơi người dùng nhập số tiền và nhấn thanh toán.
   - Khi submit: gọi `POST /api/sepay/create` để lấy trả về `checkoutUrl` hoặc `checkoutToken` → redirect người dùng tới Sepay hoặc mở Sepay popup theo flow của Sepay.
   - Sau thanh toán hoàn tất (redirect về site hoặc webhook xử lý): frontend gọi `GET /api/sepay/verify` hoặc lắng nghe webhook trạng thái qua backend -> frontend sẽ hiển thị `ThankYouModal` (centered modal nhỏ gọn) khi backend báo giao dịch `succeeded`.

4. UX: Thank-you popup
   - Implement `components/ThankYouModal.tsx` (reusable): title, short message, transaction summary (amount, id), nút đóng và nút xem hoá đơn/đến nơi khác.
   - Hiển thị modal ngay khi backend xác nhận `succeeded` (nếu flow redirect: detect query param `tx_id` và call verify endpoint; nếu SPA + websocket: push event).

5. Testing & Verification
   - Dùng Sepay Sandbox keys để mô phỏng giao dịch thành công/không thành công.
   - Thử gọi webhook local (ngrok) hoặc Sepay-sandbox webhook simulator; kiểm tra idempotency và cập nhật DB.
   - Kiểm tra UI: modal hiển thị trên mobile/desktop, các trường hiển thị hợp lý, keyboard & accessibility.

**Relevant files (proposed)**
- `pages/api/sepay/create.ts` — tạo giao dịch, gọi Sepay API
- `pages/api/sepay/webhook.ts` — nhận và verify webhook
- `components/PaymentForm.tsx` — form/flow khởi tạo thanh toán
- `components/ThankYouModal.tsx` — modal cảm ơn
- Supabase SQL: `supabase/create_payments_table.sql`

**Verification**
1. Môi trường Sandbox: tạo giao dịch test, xác nhận webhook cập nhật DB `payments.status = 'succeeded'`.
2. Simulate redirect flow: client được redirect về site, `GET /api/sepay/verify?tx_id=...` trả success → hiển thị `ThankYouModal`.
3. Webhook verification: thử gửi webhook giả với signature sai → phải bỏ qua.
4. Accessibility: modal focus trap, Esc đóng, buttons >= 44px on mobile.

**Decisions / Assumptions**
- Backend xử lý thanh toán (bạn đã chọn `Backend API (recommended)`).
- Dùng Sepay Sandbox ban đầu (bạn đã chọn `Sandbox / Test`).
- Sau khi thanh toán: lưu giao dịch vào DB và hiển thị modal cảm ơn.
- Số tiền do người dùng nhập (free text/number), cần validate server-side.

**Further Considerations**
1. Webhook security: verify signature, implement idempotency using `sepay_transaction_id`.
2. Refunds / disputes: nếu cần, thiết kế endpoints và front-end UX.
3. Receipts: có cần gửi email hoá đơn không? Nếu có, thêm step gửi email sau webhook success.
4. Logging & monitoring: log webhook events and failures to help debugging.
