# Môi trường phát triển — P0-01

Ngày kiểm tra: 21/11/2026 (Asia/Saigon). Repo làm việc là thư mục chứa `PROJECT_SPEC.md`, không phải thư mục cha có hai bản frontend.

## Toolchain đã khóa

| Công cụ | Phiên bản/cấu hình | Bằng chứng |
| --- | --- | --- |
| Node | 24.22.3 LTS | `.nvmrc`, `engines`, CI; bản portable kiểm SHA256 chính thức |
| npm | 11.19.1 | `packageManager`, `engines`, CI; `npm ci` theo lockfile |
| Java | JDK 21, local 21.0.8 | compiler release + Maven Enforcer `[21,22)`, CI Temurin 21 |
| Maven | 3.10.1 | Wrapper 3.3.4, distribution URL + SHA256; kiểm đối chiếu SHA512 kho Maven |
| Quarkus | 3.40.1.2 LTS | BOM và plugin cùng phiên bản trong POM |
| Docker Engine | local 29.4.2 Linux containers | `docker version`, build/run image |
| Compose | local 5.1.3 | Compose Specification, `docker compose config` |
| PostgreSQL test | 17.12 Alpine | image test được khóa tag; chạy test thật, không H2 |
| Gateway | nginx-unprivileged 1.28.2 Alpine | image riêng, user 101 |

Không cần Maven/psql toàn cục: dùng Wrapper và PostgreSQL container. Máy có Node 26.1.0; lần kiểm tra dùng Node 24 portable trong `.tools/` để khớp CI, không đổi cài đặt toàn máy. JDK patch/runtime image cần được cập nhật định kỳ qua thay đổi kiểm thử; Java major/BOM/Wrapper được khóa ở đây. Tham chiếu [Quarkus LTS](https://quarkus.io/releases/), [Maven](https://maven.apache.org/docs/history.html), [Node releases](https://nodejs.org/en/about/previous-releases).

## Local, staging và production

| Môi trường | Cấu hình và dữ liệu |
| --- | --- |
| Local | `.env.local` từ `.env.example`, project Supabase test; Docker database cách ly. Không commit `.env*` thật |
| Staging | Supabase project test riêng, JWT signing config thật, tài khoản khách/A/B/admin test; env từ secret store của CI/host; domain/callback staging riêng |
| Production | Credentials/database/Storage riêng, TLS, backup/restore đã nghiệm thu, chỉ migrate theo runbook trong phạm vi được cho phép; không dùng demo seed |

`VITE_*` được nhúng công khai vào bundle, chỉ gồm URL/anon hoặc publishable key và API base. Không đặt service-role, `sb_secret_*`, mật khẩu JDBC/migration hoặc JWT signing secret vào Vite. Các biến Java trong `.env.example` phải truyền vào môi trường process/Compose; Java không tự đọc `.env` frontend. `PROFILE_PERSISTENCE_ENABLED=false` là cấu hình P0-04 an toàn, readiness DOWN và đọc hồ sơ 503 cho đến P0-05. Không bật Hibernate auto-create/update; Flyway không chạy tự động ở mọi replica.

Repo ban đầu theo dõi `.env` chỉ có URL và anon key công khai. Đã bỏ theo dõi khỏi index, giữ file local và thêm ignore; không tuyên bố xóa khỏi lịch sử Git. Chưa rà soát toàn bộ lịch sử để kết luận có/không server secret, chưa chạy việc viết lại lịch sử.

## Chuẩn bị Supabase Auth/Storage

1. Dùng project test được phép; xác nhận URL và publishable/anon key. Lưu cấu hình server ngoài Git và frontend.
2. Xác minh thuật toán signing hiện hành và lịch xoay khóa. Issuer phải đúng project, audience `authenticated`; JWKS chỉ dùng khi thuật toán/project thực sự hỗ trợ. Anon key không chứng minh thuật toán của user access token. P0-06 mới nối xác thực vào Quarkus.
3. Khai báo Site URL và danh sách redirect chính xác cho local/staging/production, gồm callback xác nhận email và đặt lại mật khẩu theo route được triển khai P0-07. Bật xác nhận email; chuẩn bị hộp thư test hoặc SMTP test, không tắt xác nhận để giả lập thành công.
4. Chuẩn bị người dùng A/B và nguồn cấp admin tin cậy; không dùng user metadata làm quyền. Không dùng ID profile demo làm tài khoản Auth.
5. Storage: quyết định bucket avatar/cover/ảnh review theo quyền; dữ liệu riêng dùng bucket private. Chỉ tạo bucket/policy/upload khi luồng đó được triển khai, có kiểm tra loại/dung lượng/chủ sở hữu; P0-01 không tự tạo bucket public.

## Chạy và kiểm tra

```powershell
node --version
npm --version
java -version
docker version
docker compose version
Copy-Item .env.example .env.local
# Điền URL/key public của project test vào .env.local, không gửi secrets qua chat.
npm ci
npm run lint
npm run build
npm run check:contract
npm run test:legacy-db
cd services/profile-service
.\mvnw.cmd -B verify
```

Linux/macOS dùng `bash ./mvnw -B verify`. `npm` yêu cầu đúng phiên bản đã khóa. Nếu Docker chưa chạy, mở Docker Desktop và kiểm tra có phần Server trong `docker version`. Test migration dùng container tạm/tmpfs và tự dọn đúng container đó, không xóa volume dự án khác.

CI nền đã được cấu hình trong `.github/workflows/ci.yml`; kiểm tra local không phải bằng chứng CI hosted xanh. Xem kết quả chạy thực tế trên GitHub Actions sau push. CI JWT/PostgreSQL của profile/contract/E2E đầy đủ tiếp tục ở P0-09.
