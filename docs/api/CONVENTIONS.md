# API v1 và ranh giới dịch vụ — P0-03

Ngày chốt: 21/11/2026 (Asia/Saigon). Hợp đồng đầu tiên: [profile-v1.yaml](profile-v1.yaml). Runtime P0-04 chỉ triển khai GET hồ sơ công khai; chưa có database P0-05 nên trả 503, không trả dữ liệu mẫu. OpenAPI sinh từ Java tại `/q/openapi?format=JSON` dùng đối chiếu với hợp đồng đã duyệt. Chỉ mở tài liệu runtime trên mạng phát triển/nội bộ.

## Định danh, đường dẫn, thời gian và tiền

- URL nghiệp vụ bắt đầu `/api/v1`; JSON camelCase. ID hồ sơ là UUID trùng subject đã xác minh của Supabase Auth, không thay ID khi đổi username. Username chữ thường `[a-z0-9_]{3,40}`; dữ liệu cũ không đạt phải có bảng đối chiếu/xử lý ở P0-05/P0-06 trước import.
- ID địa điểm/tỉnh cũ là text ổn định; không ép thành UUID làm mất quan hệ. Slug là đường dẫn hiển thị, chữ thường không dấu, không phải khóa liên kết. Service sở hữu giữ alias/chuyển hướng khi đổi slug; không cấp lại slug cũ cho đối tượng khác.
- Timestamp RFC 3339 UTC có `Z`, lưu `timestamptz`; ngày du lịch/sinh nhật là `YYYY-MM-DD` không chuyển theo múi giờ. Gateway được phép ghi offset `+00:00` tương đương UTC.
- Chi phí VND là số nguyên không âm trong miền số nguyên an toàn JavaScript (tối đa 9,007,199,254,740,991); trường `currency` cố định `VND`. Không dùng số thực cho tiền. Trường tùy chọn phải công bố rõ null/absent trong schema.

## Danh sách và truy vấn (áp dụng khi thêm endpoint danh sách)

- `page` bắt đầu 1, `pageSize` mặc định 20, tối đa 100. Trả `{items, page, pageSize, totalItems, totalPages}`; `totalPages=0` khi rỗng. Không tự lấy vô hạn hoặc trả trang khác với trang yêu cầu.
- `sort` chỉ nhận enum được ghi trong OpenAPI endpoint; ví dụ `createdAt:desc`, luôn thêm ID làm khóa phụ để thứ tự ổn định. Filter chỉ nhận trường cho phép; query không hợp lệ trả 400. Từ khóa `q` tối đa 200 ký tự, trim; bind parameter SQL, escape wildcard theo ý nghĩa tìm kiếm. Không đưa tên cột do client cung cấp trực tiếp vào SQL.
- Với feed/cursor ở P3, công bố hợp đồng cursor riêng và opaque cursor; không âm thầm đổi ý nghĩa `page`.

## Lỗi, request ID và thay đổi tương thích

`{code, message, requestId, timestamp, errors:[{field,message}]}`; client dựa vào `code`, thông điệp tiếng Việt có thể thay đổi. Không trả SQL, stack trace, token hay thông tin liên hệ trong lỗi/log. Lỗi dependency không được đổi thành 200/rỗng/404.

| HTTP | Ý nghĩa |
| --- | --- |
| 400 | Input/filter/sort không hợp lệ |
| 401 | Thiếu/token sai/hết hạn trên API bắt buộc đăng nhập |
| 403 | Danh tính hợp lệ nhưng thiếu quyền; tài khoản bị khóa |
| 404 | Không tồn tại hoặc cần che sự tồn tại với người không được đọc |
| 405/413 | Method không hỗ trợ/body quá lớn |
| 409 | Username trùng, xung đột phiên bản/idempotency |
| 429 | Rate limit; client backoff |
| 500 | Lỗi nội bộ chưa phân loại |
| 503 | Dependency mất kết nối/timeout/chưa được cấu hình |

Gateway tạo `X-Request-ID` mới cho mỗi request từ bên ngoài, truyền nguyên vào service và response. Service chấp nhận ID nội bộ dạng UUID/32 hex; ID không hợp lệ được thay mới. Log method/status/thời gian/request ID, không log Authorization, body hay query cá nhân. Gateway giới hạn body 1 MiB, connect 2s, read/send 5s; service giới hạn transaction/statement 5s, acquisition 3s. Không tự retry mutation.

Thêm trường response tùy chọn là tương thích khi consumer bỏ qua trường lạ; vẫn cập nhật schema và test. Xóa/đổi tên/đổi type, đổi quyền, ý nghĩa trường hay mã thành công cần version mới hoặc lộ trình deprecation. Version spec và changelog đi cùng mã; CI kiểm tra schema trước merge. Khi endpoint ghi được thêm: optimistic version/ETag với cập nhật, unique constraint và `Idempotency-Key` có phạm vi subject/route cho tạo quan trọng; không tuyên bố đã triển khai ở P0-03.

## Quyền, chủ sở hữu và hợp đồng liên service

| Chủ thể | Quyền |
| --- | --- |
| Khách | Đọc hồ sơ ACTIVE và nội dung công khai |
| Thành viên A/B | Thêm quyền đọc/sửa dữ liệu của mình sau JWT đã xác minh; không dựa vào `userId` trong body/header |
| Admin | Vai trò/trạng thái do profile-service quản lý, được cấp bằng quy trình quản trị tin cậy; metadata tự sửa không cấp quyền |
| Tài khoản bị khóa | Không ghi/đọc dữ liệu cá nhân qua API; hồ sơ công khai bị ẩn |
| Service | Danh tính máy riêng, scope/audience riêng; không tự nhận vai trò người dùng chỉ bằng header |

P0-06 xác minh signature/algorithm/issuer/audience/expiry/subject và nguồn role/trạng thái. P0-04 chưa cung cấp route riêng tư hoặc ghi nên không có đường cấp quyền tạm. Route dự kiến `GET /api/v1/me/profile` (thông tin chủ sở hữu) và bootstrap idempotent sẽ chỉ được thêm vào OpenAPI runtime cùng kiểm thử P0-06/P0-07. Admin không tự có quyền xem liên hệ cá nhân nếu không có nghiệp vụ được duyệt.

Service sở hữu DB/entity/repository riêng. API tổng hợp dùng batch tối đa 100 ID, scope dữ liệu công khai hoặc quyền người dùng được ủy quyền; không nối JDBC/SQL chéo. Hiện chưa có caller liên service trong P0-04; khi thêm phải triển khai xác thực máy (JWT machine identity/credential riêng, không reuse service-role Supabase làm mật khẩu API), timeout và kiểm thử cho phép/từ chối trước khi mở route. Backend lưu role chỉ được chỉnh bởi nguồn tin cậy, không nhận role từ user metadata. Không tạo shared entity hoặc broker trong phạm vi này.

Hồ sơ công khai tuyệt đối không có phone/birth date/email/role. Hồ sơ không tồn tại/bị ẩn cùng trả 404; DB hỏng trả 503. Các miền nội dung sau phải lọc trạng thái xuất bản/kiểm duyệt tại API sở hữu, kể cả khi caller có cache cũ. Thu hồi chia sẻ phải kiểm tra tại lần đọc, không chỉ dựa vào cache.

## Nguồn

- [Quarkus OpenAPI](https://quarkus.io/guides/openapi-swaggerui).
- [Supabase JWT](https://supabase.com/docs/guides/auth/jwts).
- [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3).
