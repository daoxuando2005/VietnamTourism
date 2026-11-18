# VietnamTourism — Quy tắc dự án

Phương án được người dùng duyệt tạm ngày 18/11/2026 làm cơ sở triển khai.

- Đọc [đặc tả đầy đủ](PROJECT_SPEC.md) trước khi triển khai; đây là nguồn yêu cầu sản phẩm chính.
- Agent phải theo [AGENTS.md](AGENTS.md) khi thay đổi repository và báo cáo nghiệm thu.
- File này chỉ tóm tắt, không thay thế đặc tả hoặc xác nhận chức năng đã hoàn thành.

## Công nghệ và cấu trúc

- React, TypeScript, Tailwind CSS, React Router, Supabase.
- Mobile first, responsive, component tái sử dụng, khả năng tiếp cận.
- Luồng mục tiêu: trang/component → hook → service → repository → Supabase.
- Chuẩn hóa service, types, cache, phân trang, xử lý lỗi theo từng module.

## Phạm vi sản phẩm

1. Trang chủ.
2. Khám phá địa điểm.
3. Chi tiết địa điểm.
4. Bản đồ thực.
5. Tìm kiếm.
6. Xác thực tài khoản.
7. Hồ sơ cá nhân.
8. Yêu thích và bộ sưu tập.
9. Đánh giá.
10. Cộng đồng.
11. Lịch trình nhiều ngày.
12. Quản trị.

Tiếng Việt mặc định. Tiếng Anh, AI, cá nhân hóa, thông báo nâng cao, ngoại tuyến, đặt tour/thanh toán cần duyệt riêng.

## Quy tắc không được bỏ qua

- Theo P0 → P1 → P2 → P3 → P4 trong đặc tả.
- Kiểm tra quyền ở database/máy chủ; giao diện không phải ranh giới bảo mật.
- Dữ liệu riêng mặc định không công khai; không tự phát hoạt động yêu thích lên feed.
- Lưu bền vững, đồng bộ các trang; không dùng mock/placeholder thay chức năng hoặc số liệu thật.
- Không chạy script xóa/tạo lại bảng trên dữ liệu đang dùng; migration có phiên bản, seed phát triển riêng.
- Không đưa khóa server, mật khẩu, token riêng vào frontend/commit.
- Đối chiếu mã yêu cầu và DONE-01 đến DONE-09 trước khi báo xong; nêu rõ phần chưa kiểm chứng.
