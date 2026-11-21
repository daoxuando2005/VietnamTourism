# Migration dữ liệu và Auth

Kiến trúc nghiệp vụ mới là Java/Quarkus/JPA/PostgreSQL, giữ Supabase Auth/Storage theo [ADR-001](docs/architecture/ADR-001-backend-microservices.md). Một số miền FE cũ vẫn dùng Data API trong thời gian chuyển tiếp.

**Không dùng `supabase/schema.sql` để thiết lập database.** Entry point chỉ còn guard từ chối; toàn bộ reset/seed cũ lưu dưới dạng [plain text archive](supabase/archive/legacy-demo.sql.txt), không phải migration production.

Thực hiện theo:

1. [Chuẩn bị toolchain/môi trường, Auth và Storage](docs/operations/DEVELOPMENT.md).
2. [Kiểm kê schema/query/trigger, mock/thật và quyền riêng tư](docs/operations/LEGACY_INVENTORY.md).
3. [Runbook export, restore, migration quyền và khôi phục](docs/operations/LEGACY_MIGRATION.md).
4. [SQL inventory chỉ đọc](supabase/inventory.sql) và [migration có phiên bản](supabase/migrations/202611210001_legacy_access_hardening.sql).
5. [Bằng chứng và giới hạn P0-02](docs/verification/P0-02.md).

Migration chuyển tiếp giữ dữ liệu, hạn chế ghi theo chủ sở hữu, tách liên hệ private, giấu favorite khỏi feed và khóa quyền function. Nó không tự tạo database/JWT của profile-service mới (P0-05/06), không đóng Data API của toàn project và không chứng minh môi trường hosted đã áp dụng.

`npm run test:legacy-db` kiểm PostgreSQL fixture, ownership/RLS, trigger và backup/restore cách ly. Chỉ áp dụng vào môi trường thật được phép sau khi inventory/schema drift, backup/restore, SDK/PostgREST và JWT A/B đã được kiểm chứng. Không tự khôi phục policy rộng hoặc xóa dữ liệu để chữa lỗi.
