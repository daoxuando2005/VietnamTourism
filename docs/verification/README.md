# Bản ghi triển khai P0

Cập nhật 21/11/2026 (Asia/Saigon). Mỗi bản ghi nêu thay đổi, test, phần chưa làm và bước tiếp theo. Đây là nền tảng P0, không phải tuyên bố hoàn thành sản phẩm P1…P4.

| Nhiệm vụ | Trạng thái | Kiểm chứng đã có | Bản ghi |
| --- | --- | --- | --- |
| P0-01 | Hoàn thành thiết lập local | Toolchain/checksum, clean FE install/build/lint, audit 0 | [Chi tiết](P0-01.md) |
| P0-02 | Hoàn thành migration quyền test | Local backup/restore và ownership probe hosted đạt; project ban đầu rỗng, không seed demo | [Chi tiết](P0-02.md) |
| P0-03 | Hoàn thành hợp đồng ban đầu | OpenAPI schema, public field boundary; runtime đối chiếu trong P0-04 đạt | [Chi tiết](P0-03.md) |
| P0-04 | Hoàn thành khung/build/test/gateway | Quarkus 10/10; clean Linux images; gateway/runtime contract/non-root/dependency recovery đạt | [Chi tiết](P0-04.md) |
| P0-05 | Hoàn thành local | PostgreSQL/Flyway/JPA, runtime/migration roles và isolation | [Chi tiết](P0-05.md) |
| P0-06 | Hoàn thành API local | Tổng 24 Java tests, ES256/JWKS, owner/admin/bootstrap | [Chi tiết](P0-06.md) |
| P0-07 | Hoàn thành FE local | 13 unit + 5 UI tests, types, refresh/cache/callback | [Chi tiết](P0-07.md) |
| P0-08 | Hoàn thành local | Image/Compose/volume, recreate/outage, non-root/read-only | [Chi tiết](P0-08.md) |
| P0-09 | Chờ hosted CI kết thúc | Bộ kiểm local đạt, workflow đã push | [Chi tiết](P0-09.md) |
| P0-10 | Đạt fixture integration và cutover; chờ Auth thật | 3 browser tests API/JPA thật, hosted RLS probe; thiếu hai tài khoản test | [Chi tiết](P0-10.md) |

Supabase đã hoạt động sau Resume, kết nối plugin và kiểm kê bằng owner. P0-02 đã apply trên project test rỗng, kiểm RLS/ownership và advisor đạt; xem [bổ sung hosted](P0-02.md). Việc này chưa thay nghiệm thu toàn P0 với email/JWT/FE/JPA xuyên hệ thống.

**Chưa đóng toàn P0:** thiếu hai tài khoản hosted đã xác nhận email trong file local để kiểm provider/email thật. Supabase đã Resume/healthy, không còn lỗi DNS. Fixture không thay nghiệm thu này; CI hosted được ghi riêng sau khi quan sát kết thúc.

## Cách chạy lại

```powershell
npm ci
npm run lint
npm run build
npm run check:contract
npm run generate:api
npm run test:unit
npx playwright install chromium
npm run test:ui
npm run test:legacy-db
npm run test:stack
cd services/profile-service
.\mvnw.cmd -B verify
cd ../..
docker compose -f infra/gateway/compose.smoke.yaml -p vt-p0-04 build
npm run test:gateway
```

Cần đúng toolchain ở [DEVELOPMENT.md](../operations/DEVELOPMENT.md) và Docker Engine đang chạy. Smoke dùng cổng localhost 8080; không chạy đồng thời với stack khác chiếm cổng này. Test chỉ dọn container/network của chính nó; không dùng lệnh xóa volume.

## Bằng chứng

- [Toolchain](evidence/P0-01-toolchain.txt), [FE lint](evidence/P0-frontend-lint.txt), [FE build](evidence/P0-frontend-build.txt), [npm audit](evidence/P0-npm-audit.json).
- [Migration/PostgreSQL/restore](evidence/P0-02-legacy-db.txt), [probe Supabase chỉ đọc](evidence/P0-02-public-probe.json).
- [OpenAPI](evidence/P0-03-contract.txt), [Quarkus verify](evidence/P0-04-maven.txt), [container build summary](evidence/P0-04-container-build.txt), [image IDs](evidence/P0-04-images.txt), [gateway smoke](evidence/P0-04-gateway.txt).

FE còn cảnh báo bundle chính khoảng 595 kB, tối ưu P4. Test UI và stack dùng chung cổng fixture 54321 nên chạy tuần tự. Test stack chỉ dọn namespace/volume ngẫu nhiên của chính nó, giữ dữ liệu dev.

Commit đã tạo: 473dc91 P0-01…04; d2da681 P0-05; a3ecc96 P0-02 hosted; cf67e9d P0-06; f71df62 P0-07; a1f2714 P0-08; 7a7ca41 P0-09. Bản ghi P0-10 và cập nhật CI ở commit tiếp theo. Env/password/token, dependency và build output không đưa vào Git.
