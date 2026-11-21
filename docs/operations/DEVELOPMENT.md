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

`VITE_*` được nhúng công khai vào bundle, chỉ gồm URL/anon hoặc publishable key và API base. Không đặt service-role, `sb_secret_*`, mật khẩu JDBC/migration hoặc JWT signing secret vào Vite. Compose truyền cấu hình Java riêng; Java không tự đọc env frontend. Khi chạy độc lập chưa cấu hình, persistence mặc định tắt/readiness DOWN. Stack đầy đủ bật persistence sau job migration thành công. Hibernate validate, Flyway không chạy tự động ở replica API.

Repo ban đầu theo dõi `.env` chỉ có URL và anon key công khai. Đã bỏ theo dõi khỏi index, giữ file local và thêm ignore; không tuyên bố xóa khỏi lịch sử Git. Chưa rà soát toàn bộ lịch sử để kết luận có/không server secret, chưa chạy việc viết lại lịch sử.

## Chuẩn bị Supabase Auth/Storage

1. Dùng project test được phép; xác nhận URL và publishable/anon key. Lưu cấu hình server ngoài Git và frontend.
2. Xác minh thuật toán signing hiện hành và lịch xoay khóa. Project test đã xác minh ES256/JWKS; issuer đúng project, audience `authenticated`. Anon key không chứng minh thuật toán của user access token. Không bỏ xác minh chữ ký để chữa cấu hình sai.
3. Local Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/**` (và :5173 nếu dùng Vite). Callback `/auth/callback?next=...` dùng chung xác nhận/recovery. Chỉ dùng wildcard cho local/preview; production dùng đường dẫn được kiểm soát theo [hướng dẫn Supabase](https://supabase.com/docs/guides/auth/redirect-urls). Bật xác nhận email, chuẩn bị hộp thư/SMTP test.
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
npm run configure:local
docker compose --env-file .env.local -p vt-p0-dev up -d --build --wait
npm run lint
npm run build
npm run check:contract
npm run test:unit
npx playwright install chromium
npm run test:ui
npm run test:stack
npm run test:legacy-db
cd services/profile-service
.\mvnw.cmd -B verify
```

Linux/macOS dùng `bash ./mvnw -B verify`. `npm` yêu cầu đúng phiên bản đã khóa. Nếu Docker chưa chạy, mở Docker Desktop và kiểm tra có phần Server trong `docker version`. Test migration dùng container tạm/tmpfs và tự dọn đúng container đó, không xóa volume dự án khác.

`configure:local` tạo password DB ngẫu nhiên nếu thiếu/placeholder, giữ cấu hình sẵn có, không in giá trị. Không đổi password env của volume đã init mà chưa đổi role trong DB. `docker compose ... down` giữ dữ liệu; không thêm --volumes cho stack dev. Sau thay schema: backup, build migrator, chạy job có kiểm soát trước API; không sửa migration đã apply.

`test:stack` dùng namespace/volume riêng, cổng 4300/4301/54321, Auth fixture ký ES256 và API/JPA/PostgreSQL thật. Nó thử A/B/admin, refresh, token sai/hết hạn, recreate/outage/persistence rồi dọn riêng volume test. `test:ui` dùng 4173/54321 và API fixture; không chạy hai suite đồng thời. CI lưu log không credentials; kiểm tra local không thay kết quả GitHub Actions hosted.

Để nghiệm thu provider thật, tạo hai tài khoản test xác nhận email trong Dashboard, lưu `.env.e2e.local` với E2E_EMAIL_A/E2E_PASSWORD_A/E2E_EMAIL_B/E2E_PASSWORD_B. Không gửi credentials qua chat; file bị ignore. Xem bản ghi P0-10 về điều kiện còn thiếu.
