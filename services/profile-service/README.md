# profile-service

Java 21 / Quarkus 3.40.1.2, Maven Wrapper 3.10.1. Chạy độc lập từ thư mục này:

```powershell
.\mvnw.cmd -B verify
java -jar target/quarkus-app/quarkus-run.jar
```

Linux dùng `bash ./mvnw -B verify`. Tách các lớp `api`/DTO → `application` → `repository`/JPA; không chia sẻ entity hoặc DB với service khác. Service lắng nghe cổng 8081; `/q/openapi?format=JSON` mô tả route runtime. Không công khai `/q/*` qua gateway.

P0-04 cung cấp `GET /api/v1/profiles/{username}`, lỗi/request ID và health. Không trả mock profile. Mặc định persistence tắt: liveness UP, readiness DOWN, truy vấn profile hợp lệ trả 503 có cấu trúc. Username sai trả 400 trước khi truy vấn DB. Schema/migration/DB roles thực sự và integration test JPA với PostgreSQL là P0-05. Không bật `PROFILE_PERSISTENCE_ENABLED` khi chưa chuẩn bị schema; Hibernate validate và Flyway không tự chạy migration lúc startup.

P0-05/06 đã thêm JPA/Flyway/PostgreSQL, JWT ES256/JWKS, owner GET/POST bootstrap và admin access; 24 test với PostgreSQL/JWT đạt. Header tự khai user ID/role không cấp quyền. Public profile chỉ lấy tài khoản ACTIVE, không chứa phone/birth date/email/role. API sửa hồ sơ đầy đủ ở P2.

Dockerfile multi-stage build bằng Wrapper, runtime JRE/non-root 10001, copy toàn bộ `quarkus-app`. `.dockerignore` loại `.env` và build output khỏi context. Từ repo root có thể build riêng:

```text
docker build -t vietnamtourism/profile-service:p0-04 services/profile-service
docker build -t vietnamtourism/gateway:p0-04 infra/gateway
docker compose -f infra/gateway/compose.smoke.yaml -p vt-p0-04 build
npm run test:gateway
```

Stack đầy đủ ở compose.yaml tại root; target migrator chạy Flyway bằng role riêng trước API. Gateway timeout connect 2s/read 5s, không thay kiểm JWT/quyền tại service. [Bản ghi kiểm chứng](../../docs/verification/README.md) phân biệt khung, DB/JWT, container và provider thật.
