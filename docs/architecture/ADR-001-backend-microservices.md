# ADR-001 — Java/Quarkus microservice và lựa chọn dữ liệu

- Ngày: 19/11/2026 (Asia/Saigon).
- Cập nhật: 20/11/2026, bổ sung yêu cầu đóng gói Docker độc lập từng service.
- Yêu cầu đã chốt bởi người dùng: Java, Quarkus, microservice, JPA/Hibernate, frontend React.
- Đóng gói đã chốt: Dockerfile/image riêng cho từng service; Docker Compose cho môi trường phát triển và tích hợp.
- Khuyến nghị trong tài liệu: PostgreSQL làm database nghiệp vụ chính; Supabase Auth/Storage; MongoDB tùy nhu cầu cụ thể, chưa bắt buộc triển khai.
- Thay thế phương án backend nghiệp vụ Supabase/Edge Functions tại đặc tả v1.1. Không xác nhận mã Java, dịch vụ hoặc database đã được triển khai.
- Phạm vi sản phẩm và nghiệm thu vẫn theo [PROJECT_SPEC.md](../../PROJECT_SPEC.md).

## 1. Stack mục tiêu

| Lớp | Lựa chọn |
| --- | --- |
| FE | React + TypeScript + Vite; Tailwind, React Router, TanStack Query |
| BE | Java + Quarkus, Maven, Quarkus REST/Jackson, Bean Validation, OpenAPI |
| Persistence quan hệ | Jakarta Persistence/JPA + Hibernate ORM, repository pattern qua PanacheRepository hoặc EntityManager, PostgreSQL JDBC |
| Migration | Flyway riêng cho từng service; tài khoản migration tách tài khoản runtime |
| Identity | Khuyến nghị giữ Supabase Auth; Quarkus xác thực access token và phân quyền nghiệp vụ |
| Tệp | Khuyến nghị Supabase Storage, upload có kiểm tra và URL/quyền truy cập phù hợp |
| Môi trường đầu | Các service container độc lập, Docker Compose cho phát triển, chạy JVM trước |

Chốt và khóa JDK/Quarkus BOM ổn định tương thích khi tạo backend; dùng Maven Wrapper và CI cùng toolchain. Không cài phiên bản ngẫu nhiên hoặc dùng chế độ tự sửa schema Hibernate trong production. Không trộn Hibernate Reactive vào persistence JPA/JDBC nếu chưa có quyết định thay đổi rõ.

## 2. Phân chia service khuyến nghị

| Service | Dữ liệu sở hữu | Kho dữ liệu khuyến nghị |
| --- | --- | --- |
| profile-service | Hồ sơ công khai/riêng tư, trạng thái tài khoản và quyền ứng dụng | PostgreSQL riêng theo service |
| destination-service | Tỉnh/thành, tên thay thế, địa điểm, danh mục, metadata ảnh, trạng thái xuất bản | PostgreSQL + PostGIS; unaccent/pg_trgm cho tìm kiếm |
| review-service | Đánh giá, ảnh đánh giá, hữu ích, báo cáo đánh giá, thống kê điểm | PostgreSQL riêng theo service |
| trip-service | Yêu thích, bộ sưu tập, chuyến đi/ngày/địa điểm, dự toán, quyền chia sẻ | PostgreSQL riêng theo service |
| community-service | Bài viết, bình luận, quan hệ theo dõi, lượt thích và trạng thái kiểm duyệt | PostgreSQL trước; cân nhắc MongoDB cho mô hình đọc feed sau |

- Gateway/reverse proxy là cửa vào API, không sở hữu database nghiệp vụ và không thay quyền tại service.
- Giao diện admin gọi service sở hữu nội dung để quản lý; không tạo một service admin có quyền đọc/ghi mọi database.
- Mỗi service sở hữu báo cáo/kiểm duyệt và audit của miền mình. Màn hình tổng hợp có thể ghép kết quả API; không tạo database dùng chung để bỏ qua ranh giới.
- Tìm kiếm địa điểm do destination-service xử lý; tìm bài/người gọi API service tương ứng. Chưa cần một search engine hoặc search-service độc lập.
- Supabase Auth quản lý danh tính/phiên/mật khẩu; profile-service quản lý hồ sơ/quyền ứng dụng, tham chiếu subject ID và không lưu thêm bản mật khẩu.
- Ảnh ở Storage, metadata gắn với service sở hữu nội dung; quy trình upload/xóa phải được thiết kế cùng quyền sở hữu.

## 3. Có nên dùng cả PostgreSQL, MongoDB, Supabase?

Supabase là nền tảng có PostgreSQL, Auth, Storage và các dịch vụ khác; không phải một hệ database độc lập ngang hàng PostgreSQL/MongoDB.

Khuyến nghị bản đầu:

1. Dùng PostgreSQL cho năm service nghiệp vụ. Dữ liệu quan hệ, chống trùng, tính điểm, quyền riêng tư và transaction là nhu cầu chính.
2. Giữ Supabase cho Auth/Storage để tận dụng tích hợp hiện có. Có thể chọn Supabase làm nơi hosting PostgreSQL; khi đó không lưu thêm một bản dữ liệu nghiệp vụ tương tự ở PostgreSQL bên ngoài.
3. MongoDB chưa là dependency bắt buộc. Mô hình bài viết hoặc việc dùng microservice tự nó chưa chứng minh cần thêm database.

Điều kiện cân nhắc MongoDB:

- Có tài liệu/feed đọc tổng hợp với cấu trúc và truy vấn thực tế phù hợp, có đo lường và lợi ích so với phương án PostgreSQL hiện tại.
- Xác định rõ MongoDB là nguồn gốc dữ liệu nào hoặc chỉ là mô hình đọc. Khuyến nghị trường hợp bổ sung đầu tiên là mô hình đọc feed từ dữ liệu nguồn của service.
- Có kế hoạch đồng bộ, replay/rebuild, index, backup, kiểm duyệt và xóa dữ liệu; chấp nhận/đo được độ trễ đồng bộ.
- Nếu dùng MongoDB, sử dụng Quarkus MongoDB Client/Panache (`PanacheMongoRepository`), không ánh xạ bằng JPA/Hibernate ORM. Không coi Panache cho MongoDB và Panache Hibernate là cùng một persistence engine.

Không tạo MongoDB chỉ để có thêm công nghệ hoặc ghi cùng một thay đổi vào PostgreSQL và MongoDB bằng hai request rồi giả định chúng nguyên tử.

## 4. Sở hữu và kết nối dữ liệu

- Mỗi service có database logic, credentials, migration và backup ownership riêng. Trong phát triển có thể dùng cùng PostgreSQL instance với database/tài khoản riêng để tiết kiệm tài nguyên; không bắt buộc mỗi service một máy.
- Nếu hạ tầng chỉ cung cấp một database, có thể dùng schema riêng cùng grants/role riêng làm bước đầu; không cấp quyền chéo. Phải ghi rõ mức cách ly và điều kiện tách database sau này.
- Không join chéo hoặc tạo khóa ngoại giữa database/schema của các service. Chỉ truyền ID/DTO qua API/sự kiện; service sở hữu xác minh tồn tại/quyền liên quan theo hợp đồng.
- Không chia sẻ JPA entity, repository hoặc persistence context giữa service. Có thể chia sẻ hợp đồng API/tiện ích kỹ thuật không làm phụ thuộc dữ liệu.
- Kết nối quan hệ: Quarkus → JDBC pool → PostgreSQL; không dùng Supabase REST client thay JPA. Database do Supabase hosting vẫn kết nối theo PostgreSQL/JDBC.
- Chọn direct connection hoặc session pooler phù hợp mạng và runtime; kiểm thử giới hạn connection, prepared statement, TLS và Flyway. Không mặc định transaction pooler tương thích toàn bộ đặc tính JDBC/Hibernate.
- Giới hạn transaction trong database của service sở hữu. `@Transactional` không tự bao phủ REST call sang service khác hoặc hai database khác công nghệ.
- Khi cần đồng bộ sự kiện, dùng outbox cùng transaction nguồn và consumer idempotent, retry/replay; lựa chọn broker/cơ chế vận chuyển được chốt khi triển khai luồng đó, không bắt buộc cài ngay.
- Nội dung bị ẩn/thu hồi quyền chia sẻ phải bị chặn ngay tại API có thẩm quyền. Mô hình đọc trễ không được phát lại nội dung riêng/đã ẩn; kiểm tra quyền tại lúc đọc và thiết kế lan truyền sự kiện rõ.

## 5. Auth, quyền và Storage

1. React dùng Supabase Auth lấy access token và gửi Bearer token đến Quarkus API.
2. Mỗi Quarkus service kiểm chữ ký, thuật toán cho phép, issuer, audience và hạn token; dùng subject đã xác minh làm danh tính. Gateway kiểm tra không thay thế bước này.
3. Khi project dùng khóa ký bất đối xứng, có thể xác thực bằng JWKS từ Supabase với Quarkus SmallRye JWT. Kiểm tra cấu hình khóa thực tế, cơ chế xoay khóa và cache; không giả định project dùng HS256 cũng có public JWKS phù hợp.
4. Không lấy quyền admin từ metadata người dùng tự sửa. Bản đầu tra nguồn quyền/trạng thái có thẩm quyền; nếu cache hoặc dùng claim thì phải có chiến lược hết hạn/thu hồi, đặc biệt khi khóa tài khoản hoặc hạ quyền.
5. JWT HTTP không tự đưa `auth.uid()` vào JDBC connection. Service phải kiểm tra chủ sở hữu và query scope; database account không phải superuser và không có quyền sang dữ liệu service khác. Nếu bổ sung RLS qua context database, phải quản lý theo transaction, reset an toàn với pool và kiểm thử tránh rò danh tính.
6. Bảng nghiệp vụ không cho FE ghi trực tiếp qua Data API. Thu hồi grants/exposure phù hợp; chỉ tắt Data API toàn project sau khi xác minh không còn phần được phép sử dụng. Không dựa vào FE đã đổi code để cho rằng đường vòng cũ đã đóng.
7. Storage có policy riêng. Upload trực tiếp chỉ dùng quyền người dùng hoặc URL có phạm vi/thời hạn do backend cấp; backend kiểm tra quyền, loại/dung lượng thực tế và việc hoàn tất upload trước khi xuất bản ảnh. Signed URL không thay kiểm tra nội dung tệp.
8. Không đưa credentials JDBC, khóa service-role hoặc khóa ký bí mật vào FE. Dùng kênh xác thực cho gọi giữa service, không tin header user ID tùy ý.

## 6. Lộ trình thay backend hiện có

- P0: tạo khung gateway/Quarkus, database ownership, Flyway, JWT, profile-service, OpenAPI, cấu hình phát triển và bộ kiểm thử quyền. Có một luồng React → Quarkus → JPA → PostgreSQL chạy được trước.
- P1: destination-service và phần lưu cơ bản của trip-service; chuyển API khám phá, bản đồ, tìm kiếm, yêu thích từ truy vấn Supabase trực tiếp sang Quarkus.
- P2: review-service, hồ sơ đầy đủ, upload và quản trị; chuyển thống kê/trigger feed cũ sang cơ chế liên service có hợp đồng rõ.
- P3: lịch trình đầy đủ, community-service; đánh giá lại nhu cầu MongoDB bằng trường hợp sử dụng/đo lường, không tự thêm nếu chưa được chọn.
- P4: CI từng service, contract/integration test, backup/restore, health/readiness, log/request ID xuyên service, timeout và hành vi khi service phụ thuộc lỗi.

Chuyển từng miền có kiểm chứng, giữ ánh xạ ID/slug và đối chiếu dữ liệu. Mỗi miền có một nơi được phép ghi trong thời điểm chuyển đổi; tránh hai backend cùng ghi nguồn gốc. Có cách quay lại phù hợp trước khi cắt API cũ, không chạy script xóa bảng để bắt đầu lại.

### 6.1. Docker cho từng service

Mục tiêu là mỗi ứng dụng có vòng đời build, chạy và cập nhật riêng. Đây là quy định để thực hiện ở P0 và khi thêm từng service, chưa phải xác nhận các file đóng gói đã có.

| Thành phần | Đơn vị đóng gói |
| --- | --- |
| profile-service | Một Dockerfile/build target và image riêng |
| destination-service | Một Dockerfile/build target và image riêng |
| review-service | Một Dockerfile/build target và image riêng |
| trip-service | Một Dockerfile/build target và image riêng |
| community-service | Một Dockerfile/build target và image riêng |
| FE React | Một image phục vụ bản build tĩnh; tách khỏi ứng dụng Java |
| Gateway | Một image riêng với cấu hình route của môi trường |
| PostgreSQL phát triển | Container hạ tầng riêng cùng volume bền vững; ownership database/tài khoản theo mục 4 |

- Mỗi service đặt Dockerfile cùng mã service, ví dụ `services/profile-service/Dockerfile`, và có build context/`.dockerignore` rõ; các đường dẫn này là cấu trúc dự kiến khi tạo backend. Compose ở gốc mô tả build/image, cấu hình, mạng và volume.
- Quarkus dùng multi-stage build: Maven Wrapper và JDK ở bước build; runtime chỉ giữ Java runtime cùng artifact cần thiết. Với fast-jar, phải copy đầy đủ thư mục `quarkus-app` theo cấu trúc build, không chỉ một file runner jar.
- Runtime non-root; không đưa `.env`, token, credentials, cache build hoặc công cụ build vào image. Cấu hình/secrets được truyền khi chạy; giá trị Vite được nhúng vào FE phải là thông tin công khai.
- Cổng trong từng container có thể giống nhau. Dùng DNS nội bộ theo tên service và chỉ publish cổng host cần thiết; cổng debug/database chỉ bật theo cấu hình phát triển có chủ đích.
- Có health/readiness và quy trình khởi động phù hợp; `depends_on` hoặc trạng thái healthy lúc đầu không thay timeout/retry và xử lý mất kết nối trong quá trình chạy. Không giả định Docker tự khởi động lại container chỉ vì health check thất bại.
- Tách volume dữ liệu khỏi ứng dụng. Tạo lại/nâng image service không được mất database; volume không thay backup. Không dùng lệnh xóa volume để khắc phục lỗi khởi động khi chưa có chỉ dẫn rõ.
- Tag image theo service và commit/version, lưu artifact dùng phát hành để cập nhật/rollback độc lập. Chạy migration có kiểm soát với một actor/job; đảm bảo tương thích schema khi cùng lúc có phiên bản cũ/mới.
- Compose trước hết phục vụ phát triển/tích hợp; nếu dùng production một máy phải bổ sung cấu hình vận hành, secrets, backup, TLS và tài nguyên phù hợp. Không coi Compose tự có failover nhiều máy hoặc triển khai không gián đoạn.
- Supabase Auth/Storage managed không cần container local trong bản đầu; không thêm MongoDB hoặc broker vào Compose khi chưa có quyết định dùng.
- Kiểm tra khi triển khai: cấu hình Compose hợp lệ, clean build, smoke test luồng React → Quarkus → PostgreSQL, readiness, mất/kết nối lại dependency, dữ liệu sau tạo lại container ứng dụng, thay riêng image một service và không lộ secrets.

## 7. Kiểm chứng quyết định

- Từng service build/test/triển khai độc lập và có migration riêng; FE types khớp OpenAPI.
- Kiểm thử khách/A/B/admin, JWT không hợp lệ/hết hạn, quyền sở hữu và đường vòng qua Data API/Storage.
- Tài khoản runtime của A-service không truy cập được database B-service; không có entity/SQL join dùng chung giữa service.
- Kiểm thử JPA với PostgreSQL thật ở môi trường phát triển/test, Flyway và PostGIS khi liên quan; không coi database giả thay thế là đủ.
- Có kiểm thử hợp đồng, lỗi phụ thuộc, timeout và các nhánh phục hồi. Nếu có event/MongoDB, kiểm thử trùng/thứ tự/retry/rebuild và ẩn nội dung.
- Kiểm tra tài liệu không đồng nghĩa các tiêu chí runtime ở trên đã đạt.

## 8. Nguồn chính thức

- [Quarkus Hibernate ORM với Panache](https://quarkus.io/guides/hibernate-orm-panache).
- [Quarkus MongoDB với Panache](https://quarkus.io/guides/mongodb-panache).
- [Quarkus SmallRye JWT](https://quarkus.io/guides/security-jwt), [Flyway](https://quarkus.io/guides/flyway).
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database/overview), [kết nối database](https://supabase.com/docs/guides/database/connecting-to-postgres).
- [Supabase JWT/JWKS](https://supabase.com/docs/guides/auth/jwts), [bảo vệ Data API](https://supabase.com/docs/guides/api/securing-your-api).
- [Quarkus container image](https://quarkus.io/guides/container-image), [Docker Compose](https://docs.docker.com/compose/intro/features-uses/), [Docker multi-stage build](https://docs.docker.com/build/building/multi-stage/).
