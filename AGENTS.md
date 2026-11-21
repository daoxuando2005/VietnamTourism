# Chỉ dẫn thực hiện dự án VietnamTourism

## Nguồn yêu cầu và phạm vi

- Áp dụng cho toàn bộ repository. Trước khi thay đổi mã nguồn, đọc đầy đủ `PROJECT_SPEC.md` và quy định bổ sung tại thư mục đang sửa, nếu có.
- Đọc `IMPLEMENTATION_PLAN.md` để chọn mã công việc, phụ thuộc và điều kiện kết thúc; đọc ADR-001 khi xử lý kiến trúc/backend. Kế hoạch triển khai không thay thế đặc tả sản phẩm.
- `PROJECT_SPEC.md` là đặc tả người dùng duyệt tạm làm cơ sở triển khai ngày 18/11/2026. `PROJECT_RULES.md` là bản tóm tắt, không thay thế đặc tả.
- Chỉ dẫn này áp dụng trong dự án, không thay thế chỉ dẫn cấp cao hơn của môi trường. Yêu cầu mới, rõ ràng của người dùng được ưu tiên; đồng bộ đặc tả khi phạm vi thay đổi.
- Không tự cắt yêu cầu, thêm tính năng ngoài phạm vi, đổi stack hoặc kiến trúc đã duyệt. Các quyết định nhỏ trong phạm vi được tự xử lý và giải thích khi báo cáo.
- Các mục mở rộng trong đặc tả cần được duyệt riêng trước khi thực hiện.

## Trình tự bắt buộc

1. Kiểm tra Git, đọc mã liên quan và xác định mã yêu cầu trong đặc tả.
2. Thực hiện P0 → P1 → P2 → P3 → P4. Có thể chuẩn bị việc độc lập sớm, nhưng không bỏ qua điều kiện kết thúc giai đoạn trước.
3. Chia công việc thành thay đổi kiểm tra được; giữ nguyên thay đổi có sẵn của người dùng.
4. Hoàn thiện cả giao diện, lưu dữ liệu, validation, quyền truy cập và trạng thái dữ liệu liên quan.
5. Chạy kiểm tra phù hợp. Thay đổi quyền phải kiểm tra cả cho phép/từ chối; thay đổi nghiệp vụ phải kiểm tra hành vi chính và lỗi liên quan.
6. Đối chiếu tiêu chí từng mã yêu cầu trước khi báo xong. Nêu rõ phần chưa kiểm chứng và nguyên nhân.
7. Báo cáo gồm mã yêu cầu, kết quả thay đổi, kiểm tra đã chạy, phần còn thiếu và bước tiếp theo.

Cập nhật trạng thái công việc trong `IMPLEMENTATION_PLAN.md` khi triển khai. Chỉ đánh dấu Hoàn thành khi có đầu ra và bằng chứng nghiệm thu; nếu thiếu điều kiện, ghi rõ phần chưa kiểm chứng. Không coi các dòng kế hoạch hoặc scaffold rỗng là chức năng đã xong.

## Kỹ thuật và trải nghiệm

- Theo yêu cầu mới: FE React/TypeScript; BE Java + Quarkus microservice; persistence PostgreSQL bằng JPA/Hibernate ORM theo TECH-03 và `docs/architecture/ADR-001-backend-microservices.md`. Kiến trúc Supabase/Edge Functions làm backend nghiệp vụ đã được thay thế.
- FE đi qua API client → gateway → Quarkus; BE theo REST resource/DTO → application service → repository → database sở hữu riêng. Không cho FE ghi vòng vào bảng nghiệp vụ qua Supabase Data API.
- Mỗi service có migration/tài khoản dữ liệu riêng, không join/ghi database của service khác và không chia sẻ entity JPA. MongoDB chỉ là lựa chọn có điều kiện; dùng MongoDB Client/Panache nếu được chọn, không dùng JPA/Hibernate ORM cho MongoDB.
- Mỗi Quarkus service có Dockerfile/image riêng theo TECH-04; dùng Compose cho phát triển, không gộp nhiều ứng dụng vào một container. Kiểm tra build/run riêng, cấu hình runtime, health/readiness và volume; không nhúng secrets vào image hay để mọi replica đồng thời chạy migration.
- Hợp nhất service cũ/mới an toàn; kiểm tra nơi dùng trước khi loại bỏ mã.
- Dùng component tái sử dụng, DTO/API rõ; sinh TypeScript client/types từ OpenAPI của Quarkus, không lộ entity persistence ra FE.
- Có cache, phân trang và đồng bộ dữ liệu; không tải toàn bộ danh sách tăng trưởng không giới hạn.
- Phân biệt đang tải, rỗng, lỗi, thành công. Không nuốt lỗi rồi trả danh sách rỗng như thành công.
- Đảm bảo mobile first, bàn phím, focus rõ, nhãn biểu mẫu, tương phản và giảm chuyển động.

## Dữ liệu và bảo mật

- Kiểm tra chủ sở hữu/vai trò ở database hoặc máy chủ. Ẩn nút hay chặn route không thay thế RLS.
- Không tin `user_id` hoặc vai trò client tự khai báo; đối chiếu danh tính đã xác thực.
- JWT HTTP không tự đưa danh tính vào kết nối JPA/JDBC. Kiểm tra quyền/chủ sở hữu tại service, role database ít quyền và policy Storage/Data API cho phần còn truy cập trực tiếp.
- Không dùng policy ghi `USING (true)` hay `WITH CHECK (true)` thay kiểm tra quyền.
- Không công khai thông tin liên hệ, bộ sưu tập hoặc lịch trình riêng tư khi chủ sở hữu chưa chọn chia sẻ. Không tự công khai hoạt động yêu thích lên feed.
- Kiểm tra ảnh tải lên về loại tệp, dung lượng và quyền sở hữu tại ranh giới lưu trữ/máy chủ thích hợp.
- Không chạy script xóa/tạo lại bảng trên dữ liệu đang sử dụng. Dùng migration có phiên bản, cách xác minh và khôi phục phù hợp.
- Tách seed phát triển; không trình bày số liệu/đánh giá/hoạt động mẫu như dữ liệu thật.
- Không đưa khóa server/service-role, mật khẩu, token riêng vào frontend, tài liệu hoặc commit. File môi trường mẫu chỉ chứa placeholder.
- Kiểm tra quyền với khách, A, B và admin; bao gồm gọi API trực tiếp và tự nâng quyền.

## Điều kiện báo hoàn thành

- Không dùng placeholder, mock hoặc nút không có xử lý thay chức năng thật.
- Dữ liệu cần lưu phải còn sau tải lại trang; các trang liên quan cập nhật đồng bộ.
- Build/lint đạt chưa đủ: phải đạt tiêu chí nghiệp vụ/phân quyền tương ứng.
- Thiếu môi trường để kiểm tra: ghi rõ lệnh/kịch bản chưa chạy, lý do và cách kiểm chứng; không mô tả là đã đạt.
- Thay đổi chỉ có tài liệu: kiểm tra diff, liên kết nội bộ, tính nhất quán; không cần chạy lại ứng dụng nếu mã/cấu hình không đổi.
- Không tuyên bố toàn dự án hoàn thành khi thiếu DONE-01 đến DONE-09 trong đặc tả.

## Git và phát hành

- Chỉ stage file thuộc tác vụ; không đưa file môi trường, dependency cài đặt hoặc build output vào commit.
- Theo yêu cầu người dùng: sau mỗi đầu việc đã kiểm chứng, commit mã/cấu hình/tài liệu và bản ghi nghiệm thu tương ứng. Phần còn chờ điều kiện phải ghi rõ, không mô tả trong commit như đã nghiệm thu đầy đủ.
- Không force push, ghi đè lịch sử hoặc xóa dữ liệu để giải quyết xung đột.
- Commit/push/deploy theo phạm vi người dùng cho phép. Push kế hoạch/mã không đồng nghĩa với cho phép migrate hay deploy production.
