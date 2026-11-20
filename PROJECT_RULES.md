# VietnamTourism — Quy tắc dự án

Phương án được người dùng duyệt tạm ngày 18/11/2026 làm cơ sở triển khai.

- Đọc [đặc tả đầy đủ](PROJECT_SPEC.md) trước khi triển khai; đây là nguồn yêu cầu sản phẩm chính.
- Thực hiện theo [kế hoạch triển khai](IMPLEMENTATION_PLAN.md): 42 công việc P0–P4, phụ thuộc và nghiệm thu; bắt đầu P0-01, cập nhật trạng thái theo bằng chứng thực tế.
- Agent phải theo [AGENTS.md](AGENTS.md) khi thay đổi repository và báo cáo nghiệm thu.
- File này chỉ tóm tắt, không thay thế đặc tả hoặc xác nhận chức năng đã hoàn thành.

## Công nghệ và cấu trúc

- FE: React, TypeScript, Vite, Tailwind CSS, React Router; TanStack Query cho cache và đồng bộ dữ liệu.
- BE: Java + Quarkus theo microservice; JPA/Hibernate ORM, PostgreSQL JDBC, Flyway, REST/JSON, OpenAPI. Thay thế phương án Edge Functions làm backend nghiệp vụ.
- Docker: Dockerfile/image riêng cho từng service; React và gateway đóng gói riêng. Docker Compose cho phát triển/tích hợp; cấu hình, health/readiness, migration và volume theo TECH-04 (20/11/2026).
- Database: khuyến nghị PostgreSQL theo từng service; PostGIS cho địa lý, unaccent/pg_trgm và tên thay thế cho tìm kiếm. MongoDB chỉ cân nhắc cho mô hình đọc feed/tài liệu khi có nhu cầu, dùng MongoDB Client/Panache.
- Supabase: khuyến nghị cho Auth/Storage; nếu dùng hosting database thì vẫn là PostgreSQL. Không coi Supabase là một loại database thứ ba.
- Quyết định công nghệ ngày 19/11/2026 và ranh giới FE/BE/database nằm tại TECH-03 trong đặc tả.
- Mobile first, responsive, component tái sử dụng, khả năng tiếp cận.
- Luồng mục tiêu: FE → gateway → Quarkus REST resource → application service → repository → database riêng. FE types sinh từ OpenAPI.
- Chi tiết phân chia service, sở hữu dữ liệu và chuyển đổi tại [ADR-001](docs/architecture/ADR-001-backend-microservices.md).
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
