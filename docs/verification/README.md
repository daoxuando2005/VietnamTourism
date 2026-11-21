# Bản ghi triển khai P0-01…04

Cập nhật 21/11/2026 (Asia/Saigon), nguồn trước thay đổi `ff76724`. Mỗi bản ghi nêu yêu cầu, thay đổi, lệnh/kết quả, phần chưa làm và bước tiếp theo. Mã và bằng chứng được lưu cùng commit chứa bản ghi này theo yêu cầu người dùng; kết quả nêu ở đây là kiểm chứng local, chưa xác minh CI hosted hoặc deploy.

| Nhiệm vụ | Trạng thái | Kiểm chứng đã có | Bản ghi |
| --- | --- | --- | --- |
| P0-01 | Hoàn thành thiết lập local | Toolchain/checksum, clean FE install/build/lint, audit 0 | [Chi tiết](P0-01.md) |
| P0-02 | **Chờ điều kiện** để đóng đầy đủ | Migration/ownership/privacy/trigger/idempotency/backup-restore trên PostgreSQL local đạt; chưa hosted | [Chi tiết](P0-02.md) |
| P0-03 | Hoàn thành hợp đồng ban đầu | OpenAPI schema, public field boundary; runtime đối chiếu trong P0-04 đạt | [Chi tiết](P0-03.md) |
| P0-04 | Hoàn thành khung/build/test/gateway | Quarkus 10/10; clean Linux images; gateway/runtime contract/non-root/dependency recovery đạt | [Chi tiết](P0-04.md) |

**Chưa được coi cả bốn nhiệm vụ đã nghiệm thu đầy đủ trên môi trường thật.** Supabase URL cấu hình hiện tại không phân giải DNS (`ENOTFOUND`), chưa có owner inventory/test branch để migrate hosted. Phần chuẩn bị hợp đồng/khung độc lập P0-03/04 không bỏ điều kiện đóng P0-02 hoặc điều kiện kết thúc P0.

Đã hoàn tất kiểm thử trong phạm vi khung local nêu trên; chưa test hoàn chỉnh nghiệp vụ/Auth/JPA/FE xuyên hệ thống. GET profile từ DB thật, JWT/admin, login/reset/email, client/types, full Compose/persistence/volume và E2E/CI nền đầy đủ thuộc P0-05…10, **chưa làm trong tác vụ này**. Service mới hiện liveness 200, readiness và đọc profile hợp lệ 503 có chủ đích cho đến khi P0-05 cung cấp DB.

## Cách chạy lại

```powershell
npm ci
npm run lint
npm run build
npm run check:contract
npm run test:legacy-db
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

FE còn cảnh báo bundle chính >500 kB; chưa xử lý ở đợt nền tảng. Không tăng ngưỡng để che cảnh báo. Không có bằng chứng CI hosted xanh; workflow chỉ mới được tạo và lệnh tương ứng đã chạy local trong phạm vi ghi rõ.

Rà soát kết thúc: `git diff --check` đạt (chỉ cảnh báo chuyển line ending); 19 file Markdown kiểm tra liên kết local không có link hỏng; YAML CI parse hợp lệ/đủ ba job; engines ở package.json và lockfile khớp. Commit gồm việc bỏ theo dõi `.env` (giữ file local), mã/cấu hình/tài liệu và bằng chứng liên quan; loại trừ secrets, dependency cài đặt và build output.
