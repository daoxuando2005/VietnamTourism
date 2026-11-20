# VietnamTourism — Đặc tả hoàn thiện dự án

- Phiên bản: 1.4.
- Ngày chốt cơ sở triển khai: 18/11/2026, múi giờ Asia/Saigon.
- Ngày cập nhật lựa chọn công nghệ: 19/11/2026, múi giờ Asia/Saigon.
- Ngày cập nhật đóng gói Docker: 20/11/2026, múi giờ Asia/Saigon.
- Ngày lập kế hoạch triển khai: 20/11/2026; đầu việc, phụ thuộc, trạng thái và nghiệm thu theo [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
- Cập nhật theo người dùng: backend Java + Quarkus, microservice, JPA/Hibernate; frontend React. Phương án backend Supabase/Edge Functions tại v1.1 đã được thay thế.
- Trạng thái: người dùng duyệt tạm phương án và yêu cầu đưa kế hoạch lên Git; đây là yêu cầu cần thực hiện, không phải xác nhận tính năng đã hoàn thành.
- Repository: https://github.com/daoxuando2005/VietnamTourism.
- Mốc mã nguồn khảo sát: `4398844` — Complete social feed and profile module.

## 1. Mục tiêu và phạm vi

VietnamTourism là nền tảng khám phá và tự lên kế hoạch du lịch Việt Nam. Ưu tiên người Việt đi tự túc, nhóm bạn và gia đình. Giao diện mặc định tiếng Việt; tiếng Anh thuộc phần mở rộng.

Hành trình chính: tìm cảm hứng → khám phá địa điểm → xem bản đồ → lưu yêu thích → lập lịch trình → chia sẻ trải nghiệm.

Giá trị cốt lõi:

- Thông tin đủ để quyết định chuyến đi: mùa phù hợp, thời gian tham quan, chi phí tham khảo, cách di chuyển.
- Bản đồ gắn trực tiếp với danh sách và bộ lọc.
- Lịch trình nhiều ngày tạo từ địa điểm đã khám phá hoặc đã lưu.
- Đánh giá có thời điểm trải nghiệm, ảnh và thông tin hữu ích.
- Nội dung có nguồn, ngày cập nhật, cơ chế báo thông tin sai.

Phạm vi gồm 12 phân hệ và các yêu cầu nền tảng, dữ liệu, giao diện, vận hành dưới đây. Đặt tour, thanh toán và AI chưa thuộc bản hoàn thiện đầu tiên.

## 2. Hiện trạng đã khảo sát

| Hạng mục | Ghi nhận tại mốc khảo sát |
| --- | --- |
| Stack | React, TypeScript, Tailwind, React Router, Supabase |
| Cấu trúc | Đã có pages, components, services, repositories, hooks, types |
| Khám phá | Có danh sách, lọc, chi tiết, gọi Supabase |
| Đánh giá/yêu thích | Có luồng ghi, cần hoàn thiện quyền và nghiệp vụ |
| Tìm kiếm tổng | Trang mới có thông báo chờ tích hợp |
| Sửa hồ sơ | Form chưa lưu dữ liệu |
| Cộng đồng | Feed hoạt động đánh giá/yêu thích; nút theo dõi chưa có xử lý |
| Bản đồ | Dữ liệu mẫu và hình SVG minh họa |
| Quản trị | Dashboard khung, route chưa kiểm tra vai trò admin |
| Trang chủ | Một số nội dung và số liệu viết cố định |
| Database | Script có DROP TABLE; nhiều policy ghi dùng điều kiện luôn đúng |
| Kiểm tra | Build/lint đạt; bundle chính khoảng 562,72 kB sau minify, cảnh báo trên 500 kB |

Chưa kiểm thử với Supabase đang triển khai, chưa xác minh policy thực tế trên đó và chưa chạy SQL lên dịch vụ. Chưa có bộ kiểm thử nghiệp vụ/phân quyền đầy đủ. `migration_guide.md` mô tả quyền sở hữu chặt hơn script SQL; P0 phải xử lý và đồng bộ tài liệu này.

## 3. Yêu cầu theo phân hệ

### HOME-01 — Trang chủ

- Ảnh du lịch chủ đạo, tìm kiếm, khám phá theo vùng/chủ đề, địa điểm nổi bật, lịch trình gợi ý, trải nghiệm cộng đồng.
- Thống kê lấy từ dữ liệu thật; ẩn khi chưa đủ dữ liệu. Liên kết/card phải có dữ liệu tồn tại.
- Nghiệm thu: tìm kiếm mở đúng kết quả; card mở đúng chi tiết; không dùng số mẫu như số thực tế; trạng thái lỗi/rỗng phù hợp.

### DISC-01 — Khám phá địa điểm

- Lọc tỉnh/thành, vùng du lịch, loại trải nghiệm, ngân sách, mùa phù hợp; sắp xếp theo đánh giá hoặc mới cập nhật; phân trang.
- Từ khóa, bộ lọc, sắp xếp và trang nằm trên URL để chia sẻ và khôi phục khi quay lại.
- Nghiệm thu: kết hợp bộ lọc cho kết quả đúng; mở URL hoặc Back khôi phục trạng thái; lỗi khác với không có kết quả.

### DEST-01 — Chi tiết địa điểm

- Bộ ảnh, mô tả, địa chỉ, tọa độ, giờ mở cửa, giá tham khảo, thời gian tham quan, mùa phù hợp, cách đến, lưu ý, địa điểm gần đó.
- Thông tin có nguồn/ngày cập nhật; trường thiếu dữ liệu phải thể hiện trung thực.
- Có lưu, thêm vào lịch trình, chia sẻ, đánh giá và báo thông tin sai.
- Nghiệm thu: slug hợp lệ mở đúng nơi; slug không tồn tại có trạng thái phù hợp; lỗi mạng không bị trình bày như địa điểm không tồn tại.

### MAP-01 — Bản đồ

- Marker theo tọa độ thật, gom nhóm khi thu nhỏ; chọn marker mở đúng địa điểm.
- Đồng bộ bản đồ, danh sách, bộ lọc. Điện thoại chuyển được giữa bản đồ/danh sách; có điều khiển bàn phím và lối xem danh sách thay thế.
- Nghiệm thu: marker khớp dữ liệu; lọc cập nhật hai chế độ; mở đúng chi tiết; lỗi tải có thông báo.
- Chọn/ghi lại nhà cung cấp khi triển khai theo dữ liệu, điều khoản và chi phí; không tự đăng ký dịch vụ trả phí.

### SEARCH-01 — Tìm kiếm

- Tìm địa điểm/tỉnh trước; bổ sung bài viết/người dùng khi hoàn thiện các module đó trong P3.
- Hỗ trợ tiếng Việt có/không dấu, tên cũ/mới, gợi ý, phân trang, trạng thái không có kết quả.
- Đồng bộ URL; giảm truy vấn thừa khi gõ, không để kết quả cũ ghi đè truy vấn mới.
- Nghiệm thu: từ khóa có/không dấu tìm được cùng địa điểm; tên cũ trỏ đúng dữ liệu mới; ký tự đặc biệt không phá truy vấn.

### AUTH-01 — Tài khoản

- Đăng ký, xác nhận email, đăng nhập/đăng xuất, quên/đặt lại mật khẩu.
- Đồng bộ theo phiên xác thực; đăng ký chờ xác nhận không bị coi là đăng nhập nếu chưa có phiên hợp lệ.
- Khôi phục phiên; đăng nhập xong trở về trang và query/bộ lọc đang xem. Điểm quay lại phải thuộc ứng dụng.
- Xử lý username trùng, dữ liệu không hợp lệ, đăng nhập sai, phiên hết hạn.
- Nghiệm thu: các luồng thành công/thất bại có phản hồi; tải lại giữ phiên hợp lệ; đăng xuất không để dữ liệu người cũ lộ sang tài khoản mới.

### PROFILE-01 — Hồ sơ

- Lưu tên hiển thị, giới thiệu, ảnh đại diện/ảnh bìa; có cài đặt riêng tư.
- Hồ sơ công khai chỉ chứa thông tin công khai, đánh giá, bộ sưu tập/lịch trình được phép công khai.
- Tách thông tin liên hệ/riêng tư khỏi dữ liệu công khai; không đọc tất cả cột từ một nguồn công khai chứa dữ liệu riêng tư.
- Nghiệm thu: lưu rồi tải lại vẫn đúng; tên/ảnh tác giả đồng bộ; A không sửa hồ sơ B; khách xem được hồ sơ công khai.

### SAVE-01 — Yêu thích và bộ sưu tập

- Lưu/bỏ lưu đồng bộ giữa danh sách, chi tiết, hồ sơ và trang đã lưu.
- Tạo bộ sưu tập đặt tên như “Đà Lạt cuối tuần”, thêm/bỏ địa điểm.
- Mặc định riêng tư; chủ sở hữu chọn công khai khi muốn.
- Nghiệm thu: bấm nhanh không trùng bản ghi; tải lại giữ dữ liệu; thao tác lỗi khôi phục trạng thái phù hợp; không tự công khai hoạt động yêu thích lên feed.

### REVIEW-01 — Đánh giá

- Chấm 1–5 sao, nội dung, ngày trải nghiệm, ảnh; sửa/xóa đánh giá của mình.
- Một người có một đánh giá hiện hành cho mỗi địa điểm; cập nhật bản cũ thay vì tạo thêm để tăng điểm.
- Có đánh dấu hữu ích và báo cáo; chống lượt hữu ích trùng từ cùng người dùng.
- Điểm/số lượt tính từ đánh giá hợp lệ đang hiển thị; chưa có đánh giá hiển thị rõ “Chưa có đánh giá”.
- Nghiệm thu: tạo/sửa/xóa/ẩn cập nhật thống kê liên quan; người khác không sửa được; đầu vào không hợp lệ bị chặn cả khi gọi API trực tiếp.

### SOCIAL-01 — Cộng đồng

- Hoàn thiện feed, bài chia sẻ gắn địa điểm, ảnh, bình luận, theo dõi người dùng; có phân trang và kiểm duyệt.
- Không tự công khai hoạt động yêu thích hoặc để chúng làm loãng feed. Bộ đếm theo dõi lấy từ quan hệ thật.
- Nghiệm thu: bài viết/bình luận/theo dõi lưu thật, còn sau tải lại, đúng quyền; nội dung bị ẩn không còn ở các nơi công khai.

### TRIP-01 — Lịch trình

- Tạo chuyến đi có tên/ngày đi; thêm địa điểm từ khám phá hoặc đã lưu vào từng ngày.
- Đổi thứ tự, ghi chú, chi phí dự kiến; tổng hợp dự toán rõ bằng VND trong bản đầu.
- Mặc định riêng tư; có xem trước, liên kết chia sẻ chỉ xem, bản in và thu hồi quyền chia sẻ.
- Ví dụ nghiệm thu: tạo “Đà Nẵng 3 ngày”, thêm địa điểm từng ngày, đổi thứ tự, nhập chi phí; tải lại giữ nguyên; người nhận liên kết xem đúng dữ liệu và không được sửa.
- Liên kết cũ không xem tiếp được khi chủ sở hữu ngừng chia sẻ. Không trình bày dự toán như giá cam kết hay thứ tự thủ công như tuyến đã tối ưu tự động.

### ADMIN-01 — Quản trị

- Quản lý địa điểm, ảnh, nội dung nổi bật, trạng thái xuất bản; xử lý báo thông tin sai/vi phạm, ẩn/khôi phục nội dung, trạng thái tài khoản.
- Dashboard dùng số thật; nhật ký ghi người thực hiện, thời gian, đối tượng, hành động.
- Kiểm tra vai trò ở database/máy chủ ngoài route; người dùng không tự cấp admin.
- Nghiệm thu: khách/người dùng thường bị chặn cả API trực tiếp; admin làm đúng quyền; nội dung ẩn biến mất khỏi tìm kiếm, feed, hồ sơ công khai.

## 4. Nghiệp vụ chung

| Mã | Quy tắc |
| --- | --- |
| BIZ-01 | Khách xem nội dung công khai; ghi yêu cầu đăng nhập, trừ luồng xác thực được thiết kế riêng. |
| BIZ-02 | Chủ sở hữu/vai trò được cho phép mới thay đổi dữ liệu; kiểm tra tại database/máy chủ. |
| BIZ-03 | Database chống trùng đánh giá hiện hành, yêu thích và quan hệ theo dõi. |
| BIZ-04 | Bộ sưu tập, lịch trình, liên hệ mặc định riêng tư; không tự công khai hoạt động yêu thích. |
| BIZ-05 | Ảnh được kiểm tra loại tệp, dung lượng, quyền sở hữu; kiểm thử policy lưu trữ. |
| BIZ-06 | Nội dung bị ẩn không lộ qua tìm kiếm, feed, thống kê đánh giá, hồ sơ công khai. |
| BIZ-07 | Thông tin dễ thay đổi có nguồn/ngày cập nhật; giá tham khảo không phải cam kết. |
| BIZ-08 | Lỗi truy vấn có thông báo/thử lại, không chuyển thành kết quả rỗng hoặc không tồn tại. |
| BIZ-09 | Số liệu công khai có nguồn thật; demo chỉ ở chế độ phát triển có phân biệt rõ. |

## 5. Dữ liệu

### DATA-01 — Tỉnh/thành và tên thay thế

- Chuyển 63 đơn vị cũ sang 34 tỉnh/thành sau sắp xếp theo nguồn chính thức cuối tài liệu; xác minh lại khi thực hiện migration.
- Giữ ánh xạ tên/slug cũ để tìm kiếm/chuyển hướng, không làm mất quan hệ địa điểm. Giữ tên du lịch quen thuộc độc lập với đơn vị hành chính chứa nó.
- Phân biệt vùng du lịch với đơn vị hành chính; có định danh ổn định, tên thay thế, nguồn và phiên bản/ngày hiệu lực phù hợp.
- Nghiệm thu: danh mục hiện hành đầy đủ; liên kết cũ có đích hợp lệ; không địa điểm nào mất tỉnh/thành vì chuyển đổi.

### DATA-02 — Nội dung khởi đầu

- Khoảng 30–50 địa điểm đầy đủ, bao phủ cả ba miền, có các trường DEST-01, tọa độ, nguồn/ngày cập nhật và ảnh đúng nơi.
- Tỉnh chưa có địa điểm hiển thị rỗng đúng; không bịa nội dung/đánh giá để lấp chỗ.
- Theo dõi nguồn/quyền sử dụng ảnh; không dùng ảnh cảnh quan ngẫu nhiên như ảnh xác thực của địa điểm.

### DATA-03 — Nhóm dữ liệu

| Nhóm | Thành phần |
| --- | --- |
| Địa lý/địa điểm | Tỉnh/thành, tên thay thế, địa điểm, ảnh, danh mục, nguồn, thông tin thực tế |
| Tài khoản | Hồ sơ công khai, thông tin riêng tư, vai trò, trạng thái |
| Trải nghiệm | Đánh giá, ảnh, lượt hữu ích, trạng thái kiểm duyệt |
| Cá nhân | Yêu thích, bộ sưu tập, địa điểm trong bộ sưu tập, quyền công khai |
| Lịch trình | Chuyến đi, ngày, địa điểm từng ngày, thứ tự, ghi chú, chi phí, quyền chia sẻ |
| Cộng đồng | Bài viết, ảnh, bình luận, lượt thích, theo dõi, hoạt động công khai |
| Vận hành | Báo cáo vi phạm/thông tin sai, thông báo cần cho luồng chính, nhật ký quản trị |

Chốt tên bảng/cột trong migration từng giai đoạn; không tạo bảng chưa dùng để đánh dấu hoàn thành. Hệ thống thông báo nâng cao chưa thuộc phạm vi.

## 6. Giao diện và trải nghiệm

### UX-01 — Thiết kế

- Phong cách tạp chí du lịch hiện đại, ảnh đúng địa điểm, chữ dễ đọc, thao tác rõ.
- Giữ xanh ngọc, nền trắng ngà, nhấn vàng ấm; thống nhất token màu/chữ/khoảng cách/nút/form/card; font đủ dấu tiếng Việt.
- Điều hướng: Khám phá – Bản đồ – Lịch trình – Cộng đồng; tài khoản/mục đã lưu truy cập thuận tiện.
- Card có ảnh, tên, vị trí, loại trải nghiệm, điểm hoặc trạng thái chưa có đánh giá, nút lưu.

### UX-02 — Responsive và tiếp cận

- Mobile first; kiểm tra 375, 768, 1024, 1440 px; không tràn ngang ngoài thành phần có chủ đích.
- Thanh điều hướng dưới không che nội dung/nút, chú ý vùng an toàn điện thoại.
- Nhãn form, lỗi gần trường, phản hồi thao tác, bàn phím, focus rõ, tên truy cập cho nút icon; không chỉ dựa vào màu/hover.
- Chữ thường tương phản tối thiểu 4,5:1, vùng chạm chính khoảng 44×44 px; ảnh có mô tả và kích thước dự trữ, tải tối ưu.
- Tôn trọng `prefers-reduced-motion`.
- Nghiệm thu: luồng chính dùng được bằng bàn phím, trên các kích thước đã nêu, khi giảm chuyển động.

### UX-03 — Trạng thái

- Mỗi trang/tính năng có đang tải, rỗng, lỗi, thành công khi phù hợp.
- Giữ nội dung nhập khi gửi lỗi; ngăn gửi lặp; chỉ báo thành công sau xác nhận.
- Cập nhật lạc quan có khôi phục khi lỗi; đồng bộ dữ liệu giữa các trang sau thao tác.

## 7. Kiến trúc, bảo mật và vận hành

### TECH-01 — Stack và lớp dữ liệu

- FE giữ React/TypeScript/Vite/Tailwind/React Router. BE theo yêu cầu mới: Java + Quarkus, microservice, JPA/Hibernate ORM cho dữ liệu quan hệ.
- Luồng FE: trang/component → hook → API client → gateway → Quarkus service. Luồng BE: REST resource/DTO → application service → repository → database do service sở hữu.
- Hợp nhất service cũ/mới, chuẩn hóa model/mapper; bỏ lớp thừa sau khi xác minh nơi dùng.
- Bổ sung cache, phân trang, đồng bộ; tránh truy vấn thừa/tải toàn bộ danh sách không giới hạn.
- Sinh TypeScript client/types từ OpenAPI của BE; không đưa entity JPA trực tiếp thành hợp đồng API. Dependency mới phục vụ yêu cầu cụ thể; giữ lockfile FE và Quarkus BOM/Maven nhất quán.

### TECH-02 — Môi trường và migration

- Có `.env.example` với placeholder, kiểm tra biến khi khởi động, hướng dẫn cài đặt; tách cấu hình phát triển/production, seed mẫu/dữ liệu thật.
- Rà soát `.env` đang được Git theo dõi; không mặc định coi khóa client công khai là bí mật. Khóa server/service-role và token riêng không vào frontend/commit.
- Thay script DROP/tạo lại bằng migration có phiên bản không phá dữ liệu đang dùng; có truy vết, xác minh, cách khôi phục phù hợp.
- Kiểm tra trên database phát triển; push kế hoạch/mã không cho phép tự chạy migration production.
- Cập nhật README/migration guide thành hướng dẫn thật, dùng đường dẫn tương đối trong repo.

### TECH-03 — Công nghệ và ranh giới microservice

Yêu cầu mới ngày 19/11/2026 thay thế kiến trúc backend tại v1.1. Chi tiết, phương án phân bổ database và lộ trình chuyển đổi ở [ADR-001](docs/architecture/ADR-001-backend-microservices.md). Java/Quarkus/microservice/JPA-Hibernate/React là yêu cầu người dùng; phân bổ PostgreSQL, MongoDB và Supabase là khuyến nghị kiến trúc được phân biệt rõ trong ADR.

| Thành phần | Lựa chọn |
| --- | --- |
| FE | React + TypeScript + Vite, Tailwind, React Router, TanStack Query |
| BE | Java + Quarkus, các service độc lập, REST/JSON và OpenAPI |
| Persistence quan hệ | Jakarta Persistence (JPA) + Hibernate ORM, repository pattern/Panache, PostgreSQL JDBC, Flyway |
| Database chính được khuyến nghị | PostgreSQL theo quyền sở hữu từng service; PostGIS cho địa điểm, unaccent/pg_trgm cho tìm kiếm |
| Supabase được khuyến nghị | Auth và Storage; PostgreSQL hosting là lựa chọn hạ tầng nếu cần, không phải loại database thứ ba |
| MongoDB | Chưa bắt buộc; cân nhắc cho mô hình đọc feed/tài liệu khi có nhu cầu và đo lường; dùng MongoDB Client/Panache, không dùng JPA/Hibernate ORM |
| Hợp đồng và kiểu | OpenAPI của từng service, TypeScript client/types sinh từ API |

- FE gọi API nghiệp vụ Quarkus. Auth SDK và tải ảnh có kiểm soát là ngoại lệ được thiết kế rõ, không cho phép bỏ qua API nghiệp vụ để ghi bảng trực tiếp.
- Mỗi service sở hữu database/schema, tài khoản runtime, migration và transaction của mình. Không join bảng, dùng entity hoặc ghi trực tiếp database service khác.
- Quarkus xác thực JWT và kiểm tra quyền/chủ sở hữu; kết nối JDBC không tự nhận danh tính Supabase `auth.uid()` từ JWT HTTP.
- Giữ yêu cầu UX, địa lý/tìm kiếm và OPS-01; kiểm thử dấu tiếng Việt, tên thay thế và metadata của FE như trước. PostGIS không cung cấp ảnh nền hay tuyến đường giao thông.
- Không triển khai MongoDB, broker hoặc thay đổi dữ liệu production chỉ vì cập nhật quyết định kiến trúc.

### TECH-04 — Đóng gói độc lập bằng Docker

- Theo yêu cầu ngày 20/11/2026, mỗi Quarkus service phải có Dockerfile, build target/context rõ, image và cấu hình runtime riêng; không gộp nhiều ứng dụng nghiệp vụ vào một container.
- React và gateway có image/container riêng khi chạy stack đầy đủ. PostgreSQL chạy tách ứng dụng, dùng volume bền vững; database/schema/tài khoản vẫn tuân thủ quyền sở hữu service tại TECH-03.
- Docker Compose quản lý môi trường phát triển và tích hợp. Chỉ public cổng FE/gateway cần thiết; service gọi nhau bằng tên DNS nội bộ, không dùng `localhost` để gọi container khác.
- Dùng multi-stage build với Maven Wrapper cho Quarkus; chạy JVM trước, runtime chứa đầy đủ artifact cần thiết nhưng không chứa bộ công cụ build. Image runtime chạy non-root và không chứa secrets hay `.env` thật.
- Có `.dockerignore`, cấu hình môi trường mẫu, health/readiness, timeout/retry kết nối phụ thuộc, giới hạn tài nguyên phù hợp và log ra stdout/stderr.
- Image release có tag theo service/commit hoặc phiên bản, có thể xác định lại artifact để rollback; không dùng `latest` làm định danh duy nhất. Build/test service riêng khi thay đổi, tính cả dependency kỹ thuật liên quan.
- Migration chạy qua bước/job có kiểm soát của service; không để mọi replica tự đồng thời thay schema. Rollback ứng dụng phải xét tương thích migration, không tự rollback/xóa dữ liệu.
- Supabase Auth/Storage managed được dùng như dịch vụ bên ngoài; không tự dựng toàn bộ Supabase bằng Compose. MongoDB chỉ có trong cấu hình khi được chọn theo ADR-001.
- Nghiệm thu: dựng stack phát triển từ hướng dẫn; build và thay image một service mà không rebuild ứng dụng khác; dữ liệu còn sau khi tạo lại container ứng dụng; kiểm tra mạng nội bộ, quyền runtime, readiness và xử lý lỗi phụ thuộc.
- Chi tiết tại mục 6.1 của [ADR-001](docs/architecture/ADR-001-backend-microservices.md). Hiện mới là yêu cầu kiến trúc, chưa có Dockerfile/Compose triển khai vì backend chưa được tạo.

### SEC-01 — Phân quyền

- Mỗi Quarkus service xác thực JWT, kiểm tra chủ sở hữu/vai trò và dùng tài khoản database ít quyền. Vai trò admin không lấy từ metadata người dùng tự sửa được.
- JWT HTTP không tự thiết lập `auth.uid()` trong kết nối JPA/JDBC. RLS là lớp bổ sung được thiết kế/kiểm thử riêng; Auth/Storage hoặc Data API còn phơi ra vẫn phải có policy đúng và không cho đi vòng API nghiệp vụ.
- Không thay quyền bằng ẩn nút/ProtectedRoute; tách hoặc giới hạn thông tin riêng khỏi nguồn đọc công khai.
- Rà soát trigger, quyền thực thi, hàm `SECURITY DEFINER`, phạm vi thực thi; không tạo đường vòng vượt quyền.
- Database có ràng buộc rating, chống trùng, khóa ngoại, đầu vào thiết yếu.
- Kiểm tra cho phép/từ chối với khách/A/B/admin, API trực tiếp, giả mạo chủ sở hữu, tự nâng quyền.

### OPS-01 — Phát hành

- Tối ưu tải/bundle theo đo lường, không chỉ tăng ngưỡng để giấu cảnh báo.
- Trang công khai có title, description, ảnh chia sẻ, sitemap, liên kết hợp lệ. Xác minh trình thu thập/chia sẻ đọc được metadata, không chỉ đổi title sau khi ứng dụng chạy.
- CI kiểm tra FE và từng Quarkus service; kiểm thử hành vi, hợp đồng API, quyền và lỗi giữa service. Có health check, log/request ID xuyên service và cách triển khai độc lập.
- Tài liệu thiết lập database, môi trường, build, triển khai, migration, khôi phục; thông tin truy cập dùng placeholder.

## 8. Thứ tự thực hiện

P0 → P1 → P2 → P3 → P4 là trình tự mặc định bắt buộc. Hoàn thành cần bằng chứng nghiệm thu, không chỉ có file/giao diện.

Đầu việc thực thi nằm trong [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): 42 công việc có mã, đầu ra, phụ thuộc và trạng thái. Đọc kế hoạch trước khi nhận việc; các bảng dưới là mốc tổng quát, không thay bảng theo dõi. Công việc đầu tiên khi triển khai là P0-01.

| Giai đoạn | Phạm vi | Điều kiện kết thúc |
| --- | --- | --- |
| P0 — Nền tảng | TECH-01/02/03/04, SEC-01, khung Quarkus/gateway, Docker/Compose, JWT, profile-service/AUTH-01, ownership database/migration và hạ tầng kiểm thử | Chặn ghi trái quyền/đường vòng Data API; phiên đúng; chạy stack container phát triển tái lập, có luồng React → API → JPA → PostgreSQL và migration kiểm tra được |
| P1 — Khám phá | HOME-01, DISC-01, DEST-01, MAP-01, tìm địa điểm/tỉnh, DATA-01/02, UX, lưu cơ bản SAVE-01 | Tìm → xem → lưu với dữ liệu thật; tên cũ/mới và URL đúng |
| P2 — Tài khoản/trải nghiệm | PROFILE-01, SAVE-01 đầy đủ, REVIEW-01, tải ảnh, báo cáo, ADMIN-01 nội dung | Lưu bền vững, riêng tư và kiểm duyệt đúng; thống kê đồng bộ |
| P3 — Lịch trình/cộng đồng | TRIP-01, SOCIAL-01, tìm bài/người, trang chủ lịch trình/trải nghiệm đầy đủ | Chuyến đi xuyên suốt; chia sẻ, bài viết, bình luận, theo dõi đúng quyền |
| P4 — Phát hành | OPS-01, kiểm thử xuyên suốt, UX, tiêu chí còn lại | Các kiểm tra đạt, tài liệu vận hành đủ, không còn thiếu nghiệm thu |

Việc chuẩn bị nội dung/tài liệu độc lập được làm sớm. Phần trang chủ phụ thuộc module sau phải hoàn thiện trước P4; chỉ hiển thị dữ liệu dùng được ở từng giai đoạn, không dùng card giả.

## 9. Kiểm chứng và điều kiện hoàn thành

Kiểm tra theo hành vi/rủi ro:

- Unit/integration: tìm kiếm, tính điểm/chi phí, ràng buộc, mapper/logic có nhánh cần xác minh.
- API/database/quyền Storage: ma trận khách/A/B/admin; đọc/ghi/xóa, công khai/riêng tư, service account; cả trường hợp bị từ chối và truy cập vòng qua Data API/JDBC.
- Microservice: hợp đồng API, timeout/retry, lỗi service phụ thuộc và dữ liệu đọc tổng hợp; kiểm thử outbox/idempotency/replay nếu thêm luồng sự kiện.
- Xuyên suốt: xác thực, tìm kiếm, lưu, đánh giá, sửa hồ sơ, lịch trình, chia sẻ, quản trị.
- UI: responsive, bàn phím, form, trạng thái dữ liệu, giảm chuyển động.
- Vận hành: clean install, build, lint, kiểm thử, migration phát triển, đường dẫn trực tiếp, metadata.

| Mã | Điều kiện toàn dự án |
| --- | --- |
| DONE-01 | Mọi thao tác hiển thị hoạt động thật, không có nút trống/placeholder thay tính năng. |
| DONE-02 | Dữ liệu còn sau tải lại, các trang liên quan đồng bộ. |
| DONE-03 | A không đọc riêng/sửa dữ liệu B; khách/người dùng thường không có quyền admin, cả API trực tiếp. |
| DONE-04 | Có kiểm thử xác thực, tìm kiếm, yêu thích, đánh giá, lịch trình, quản trị. |
| DONE-05 | Build, lint, kiểm thử nghiệp vụ/phân quyền đạt trong môi trường ghi rõ. |
| DONE-06 | Không trình bày dữ liệu mẫu như người dùng, hoạt động, đánh giá, số liệu thật. |
| DONE-07 | Trang công khai có metadata/ảnh chia sẻ/sitemap/liên kết đúng, đạt UX-01/02/03. |
| DONE-08 | Có hướng dẫn database, môi trường, triển khai, migration, khôi phục. |
| DONE-09 | Mục chưa kiểm chứng có lý do/cách kiểm chứng; không tuyên bố xong khi thiếu tiêu chí bắt buộc. |

Báo cáo tác vụ phải nêu mã yêu cầu, thay đổi, lệnh/kịch bản và kết quả kiểm tra, phần chưa đạt, lý do, bước tiếp theo. Không đánh dấu toàn dự án xong chỉ vì build/lint đạt.

## 10. Mở rộng cần duyệt riêng

- Tiếng Anh và quy trình dịch.
- Cá nhân hóa, thông báo nâng cao, ngoại tuyến.
- Trợ lý AI, tạo/tối ưu lịch trình tự động.
- Đặt tour/đặt chỗ, thanh toán, tích hợp đối tác.

Đây không phải điều kiện hoàn thành P0–P4. Mỗi mục cần đặc tả riêng về dữ liệu, quyền, chi phí, lỗi, nghiệm thu trước khi triển khai.

## 11. Quản lý tài liệu và thay đổi

- `PROJECT_SPEC.md`: đặc tả đầy đủ, giữ mã yêu cầu ổn định khi chỉnh nội dung.
- `IMPLEMENTATION_PLAN.md`: công việc P0–P4, phụ thuộc, trạng thái, đầu ra và bằng chứng kiểm tra; không tự thay thế yêu cầu sản phẩm/kiến trúc.
- `AGENTS.md`: chỉ dẫn agent thực hiện/kiểm tra/báo cáo theo đặc tả.
- `PROJECT_RULES.md`: tóm tắt, dẫn về đặc tả; không duy trì yêu cầu mâu thuẫn.
- Người dùng đổi phạm vi: cập nhật phiên bản/ngày, nội dung và tiêu chí bị ảnh hưởng; không tự bỏ yêu cầu.
- Commit tài liệu/mã không nghĩa là chức năng đã triển khai, database đã migrate hoặc production đã phát hành.

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 1.0 | 18/11/2026 | Ghi phương án duyệt tạm; mã yêu cầu, trình tự, tiêu chí và chỉ dẫn cho các lần triển khai tiếp theo. |
| 1.1 | 19/11/2026 | Chọn FE React/TypeScript/Vite, BE Supabase/Edge Functions TypeScript, database PostgreSQL; làm rõ cache, địa lý, tìm kiếm và ranh giới xử lý tại TECH-03. |
| 1.2 | 19/11/2026 | Theo yêu cầu người dùng: thay backend bằng Java/Quarkus microservice và JPA/Hibernate, giữ React. Thay TECH-03 và đồng bộ quy định; ADR-001 đề xuất PostgreSQL chính, Supabase Auth/Storage, MongoDB tùy nhu cầu. Backend tại v1.1 đã được thay thế. |
| 1.3 | 20/11/2026 | Bổ sung Docker đóng gói độc lập từng service, Compose phát triển, quy tắc image/runtime/migration và tiêu chí kiểm chứng tại TECH-04, ADR-001 mục 6.1. |
| 1.4 | 20/11/2026 | Thêm IMPLEMENTATION_PLAN với 42 công việc P0–P4, chuyển dữ liệu/API cũ, ma trận yêu cầu, kiểm thử, điều kiện nghiệm thu và ước lượng theo năng lực giả định. |

## 12. Nguồn tham chiếu

- [Repository gốc](https://github.com/daoxuando2005/VietnamTourism).
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [ADR-001: Java/Quarkus microservice và dữ liệu](docs/architecture/ADR-001-backend-microservices.md).
- [Quarkus Hibernate ORM/Panache](https://quarkus.io/guides/hibernate-orm-panache), [MongoDB Panache](https://quarkus.io/guides/mongodb-panache), [JWT](https://quarkus.io/guides/security-jwt), [Flyway](https://quarkus.io/guides/flyway).
- [Quarkus container image](https://quarkus.io/guides/container-image), [Docker Compose](https://docs.docker.com/compose/intro/features-uses/), [multi-stage build](https://docs.docker.com/build/building/multi-stage/).
- [Supabase: PostgreSQL](https://supabase.com/docs/guides/database/overview), [kết nối database](https://supabase.com/docs/guides/database/connecting-to-postgres), [JWT](https://supabase.com/docs/guides/auth/jwts), [PostGIS](https://supabase.com/docs/guides/database/extensions/postgis).
- [TanStack Query: quản lý dữ liệu phía React](https://tanstack.com/query/latest/docs/framework/react/overview).
- [PostgreSQL: pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html), [unaccent](https://www.postgresql.org/docs/current/unaccent.html) — đối chiếu tài liệu theo phiên bản database thực tế khi triển khai.
- [Cổng thông tin Chính phủ: Nghị quyết sắp xếp đơn vị hành chính cấp tỉnh](https://baochinhphu.vn/nghi-quyet-cua-quoc-hoi-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-102250612191145158.htm) — cơ sở 34 tỉnh/thành; xác minh lại khi làm DATA-01.
