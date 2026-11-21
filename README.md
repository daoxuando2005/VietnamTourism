# VietnamTourism

Nền tảng khám phá và lập kế hoạch du lịch Việt Nam. Frontend React/TypeScript/Vite đang chuyển dần từ Supabase Data API sang Java/Quarkus microservices và PostgreSQL/JPA.

Nguồn yêu cầu: [PROJECT_SPEC.md](PROJECT_SPEC.md), [kế hoạch](IMPLEMENTATION_PLAN.md), [ADR-001](docs/architecture/ADR-001-backend-microservices.md), [AGENTS.md](AGENTS.md).

## Bắt đầu

Cần Node **24.22.3**, npm **11.19.1**, JDK **21** và Docker Engine chạy Linux containers. Maven **3.10.1** được tải và kiểm checksum bởi Wrapper, không cần cài Maven toàn cục.

```powershell
Copy-Item .env.example .env.local
# Điền public URL/anon hoặc publishable key của Supabase project test.
npm ci
npm run dev
```

Không đặt service-role/server key trong `VITE_*`. [Hướng dẫn môi trường local/staging/production và Auth/Storage](docs/operations/DEVELOPMENT.md).

## Kiểm tra

```powershell
npm run lint
npm run build
npm run check:contract
npm run test:legacy-db
cd services/profile-service
.\mvnw.cmd -B verify
```

Linux/macOS dùng `bash ./mvnw -B verify`. Migration test chạy PostgreSQL thật trong container cách ly và tự dọn container của nó. Không dùng script demo reset cũ để thiết lập dữ liệu đang sử dụng.

## Khung backend/gateway P0-04

```powershell
docker compose -f infra/gateway/compose.smoke.yaml -p vt-p0-04 build
docker compose -f infra/gateway/compose.smoke.yaml -p vt-p0-04 up -d
# http://localhost:8080/health/live: 200
# /health/ready và /api/v1/profiles/traveler: 503 vì chưa có database P0-05.
docker compose -f infra/gateway/compose.smoke.yaml -p vt-p0-04 down
```

Chạy `npm run test:gateway` sau build để kiểm tự động gateway/request ID/non-root/lỗi dependency. Stack này chỉ gồm gateway và profile-service, không phải stack P0 hoàn chỉnh. [Hướng dẫn service](services/profile-service/README.md), [API v1](docs/api/CONVENTIONS.md), [OpenAPI](docs/api/profile-v1.yaml).

## Dữ liệu và tiến độ

- [Migration guide](migration_guide.md), [kiểm kê legacy](docs/operations/LEGACY_INVENTORY.md), [runbook backup/restore](docs/operations/LEGACY_MIGRATION.md).
- [Bản ghi P0-01…04](docs/verification/README.md) ghi riêng phần đã làm, test, giới hạn và việc còn thiếu.
- Chưa hoàn thành đăng nhập xuyên FE/gateway/Quarkus/JPA/PostgreSQL. Supabase hosted chưa được migrate/xác minh trong đợt này; kết quả CI hosted cần xem trên GitHub Actions sau push.
