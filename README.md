# VietnamTourism

Nền tảng khám phá và lập kế hoạch du lịch Việt Nam. Frontend React/TypeScript/Vite đang chuyển dần từ Supabase Data API sang Java/Quarkus microservices và PostgreSQL/JPA.

Nguồn yêu cầu: [PROJECT_SPEC.md](PROJECT_SPEC.md), [kế hoạch](IMPLEMENTATION_PLAN.md), [ADR-001](docs/architecture/ADR-001-backend-microservices.md), [AGENTS.md](AGENTS.md).

## Bắt đầu

Cần Node **24.22.3**, npm **11.19.1**, JDK **21** và Docker Engine chạy Linux containers. Maven **3.10.1** được tải và kiểm checksum bởi Wrapper, không cần cài Maven toàn cục.

```powershell
Copy-Item .env.example .env.local
# Điền public URL/anon hoặc publishable key của Supabase project test.
npm ci
npm run configure:local
docker compose --env-file .env.local -p vt-p0-dev up -d --build --wait
# Frontend: http://localhost:3000; gateway: http://localhost:8080
```

Không đặt service-role/server key trong `VITE_*`. [Hướng dẫn môi trường local/staging/production và Auth/Storage](docs/operations/DEVELOPMENT.md).

## Kiểm tra

```powershell
npm run lint
npm run build
npm run check:contract
npm run generate:api
npm run test:unit
npx playwright install chromium
npm run test:ui
npm run test:stack
npm run test:legacy-db
cd services/profile-service
.\mvnw.cmd -B verify
```

Linux/macOS dùng `bash ./mvnw -B verify`. Migration test chạy PostgreSQL thật trong container cách ly và tự dọn container của nó. Không dùng script demo reset cũ để thiết lập dữ liệu đang sử dụng.

## Phát triển và dừng stack

```powershell
npm run dev
# Vite :5173 proxy /api sang gateway :8080 đang chạy.
docker compose --env-file .env.local -p vt-p0-dev down
```

Lệnh down giữ volume dữ liệu. Migration là job riêng chạy trước API; không chỉnh Flyway đã apply hoặc chạy reset demo. Stack test tự tạo/xóa volume trong namespace riêng, dùng Auth fixture; stack dev dùng Supabase thật. [Hướng dẫn service](services/profile-service/README.md), [API v1](docs/api/CONVENTIONS.md), [OpenAPI](docs/api/profile-v1.yaml).

## Dữ liệu và tiến độ

- [Migration guide](migration_guide.md), [kiểm kê legacy](docs/operations/LEGACY_INVENTORY.md), [runbook backup/restore](docs/operations/LEGACY_MIGRATION.md).
- [Bản ghi P0](docs/verification/README.md) ghi riêng phần đã làm, test, giới hạn và việc còn thiếu.
- Đã kiểm luồng browser/gateway/JWT/JPA/PostgreSQL bằng fixture, apply và kiểm RLS hosted. Kiểm Auth hosted bằng hai tài khoản test còn chờ cấu hình local; không coi fixture là nghiệm thu provider thật.
