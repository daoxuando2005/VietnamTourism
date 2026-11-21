# Runbook migration Supabase chuyển tiếp — P0-02

Phạm vi: schema cũ trong repo, trước khi chuyển miền sang Quarkus. Migration: [202611210001_legacy_access_hardening.sql](../../supabase/migrations/202611210001_legacy_access_hardening.sql). `supabase/schema.sql` chỉ còn guard; toàn bộ reset/seed cũ được lưu dưới dạng [plain text không thực thi](../../supabase/archive/legacy-demo.sql.txt).

## Chuẩn bị và export/restore

1. Xác định project/branch test được phép và người có quyền database owner. Không lấy URL từ `.env` làm bằng chứng được phép migrate production. Mở khoảng dừng ghi cho phần cần xuất/chuyển nhất quán; ghi source version/ngày và người thực hiện.
2. Chạy [inventory.sql](../../supabase/inventory.sql); lưu catalogs/trigger definitions/policies/grants, schema và row count vào nơi riêng có kiểm soát. Đối chiếu schema thật với repo. Nếu khác hoặc có hàm/grants/role tùy chỉnh, dừng áp dụng, bổ sung migration/test tương ứng; không xóa policy của hạ tầng không thuộc miền này một cách suy đoán.
3. Dùng PostgreSQL client tương thích nguồn, kết nối direct/session endpoint đã xác minh; credentials trong `.pg_service.conf`/`.pgpass` hoặc secret store, không trong lệnh được commit. Ví dụ backup public schema của miền legacy:

```text
pg_dump --dbname="service=vt_source_test" --schema=public --format=custom --file=backups/legacy-before.dump
pg_restore --list backups/legacy-before.dump
```

Public dump không phải backup toàn project: Auth identities, auth schema/trigger, Storage bytes và managed roles cần kế hoạch riêng. Vì tiếp tục giữ Supabase Auth/Storage, không import mock profile thành Auth user hay restore managed Auth bằng schema ứng dụng. Ghi riêng DDL trigger gắn `auth.users` từ catalogs, role owner và storage manifest; nếu cần backup toàn project dùng quy trình của nhà cung cấp đã xác minh. Trước restore trên test branch, bảo đảm Auth/schema/roles cần thiết và source subject mapping đã tồn tại.

4. Restore vào database/branch cách ly, chưa phải database nguồn. Bản dump chứa liên hệ và dữ liệu riêng, không commit/share. Chỉ sử dụng target mới, không `--clean`, không DROP:

```text
pg_restore --dbname="service=vt_restore_test" --exit-on-error backups/legacy-before.dump
```

5. Đối chiếu row count từng bảng, ID/FK/slug, số profile không khớp Auth, ảnh và aggregates. Chạy lại quyền anon/A/B. Test tự động `npm run test:legacy-db` đã chứng minh backup/restore trên PostgreSQL fixture, chưa thay bước dữ liệu/Auth/Storage thật này.

## Áp dụng

1. Phát hành frontend dùng projection công khai trước; giữ `VITE_LEGACY_PRIVATE_PROFILES_ENABLED=false` (mặc định) để không query bảng private chưa tồn tại. Trong maintenance window, chạy migration và kiểm SDK/quyền rồi rebuild FE với flag `true` để bật liên hệ owner. Không quay về wildcard private columns; flag chỉ điều khiển rollout phía client, RLS/grants mới là ranh giới bảo mật.
2. Chạy migration bằng owner trên target test đã restore. Script có transaction, lock/statement timeout; lỗi schema/lock sẽ rollback cả migration. Không dùng service-role key từ frontend. Script thay chính sách của đúng bảy bảng trong phạm vi đã inventory; không đổi Auth/Storage policy toàn project.

```text
psql "service=vt_restore_test" -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611210001_legacy_access_hardening.sql
```

3. Refresh schema cache PostgREST nếu host không tự phát hiện: qua owner `NOTIFY pgrst, 'reload schema';`. Kiểm thử SDK các projection/nested join thực tế; wildcard private columns phải bị từ chối. Chạy lại migration một lần trên target test để kiểm tính lặp an toàn.
4. Ma trận: khách đọc công khai, không đọc private/favorite; A tạo/sửa/xóa review/favorite của mình, không giả owner B; B không đọc/sửa private A; cấm sửa counters/ID/owner; metadata admin không thêm quyền; direct RPC trigger bị chặn; feed không xuất favorite mới/cũ. Kiểm tra signup username trùng, trigger update/delete review, giữ dữ liệu liên hệ sau copy.
5. Chỉ áp dụng sang môi trường được cho phép tiếp theo khi có bằng chứng backup, restore, UI/SDK/JWT thật và đánh giá diff policy. Ghi SHA256 migration, version nguồn, actor, target, thời gian và kết quả vào bản ghi. Tác vụ hiện tại chỉ áp dụng vào container test cách ly.

## Khôi phục và xử lý lỗi

- Migration thất bại trước COMMIT: transaction tự rollback; xác minh trạng thái và sửa nguyên nhân trước khi chạy lại. Không chạy file reset để chữa lỗi.
- Sau COMMIT: ưu tiên sửa tiến bằng migration mới giữ policy an toàn. Không khôi phục blanket policy `true` hoặc public private columns để làm FE cũ hoạt động.
- Nếu lỗi FE: đóng traffic phần bị ảnh hưởng, sửa projection/roll forward cặp FE + DB. Không rollback FE cũ một mình về wildcard. Hai lần ghi public/private legacy không nguyên tử; báo chính xác phần đã lưu, xử lý lại theo chủ sở hữu.
- Nếu cần khôi phục dữ liệu: restore backup vào branch cách ly, đối chiếu với các ghi phát sinh sau snapshot rồi lập kế hoạch merge theo ID với owner. Không ghi đè database đang sử dụng hoặc tự rollback schema toàn project.
- Giữ cột private cũ dưới quyền owner để kiểm tra hồi phục; chỉ loại bỏ trong migration riêng sau đối chiếu/backup và khi đường ghi cũ đã đóng. Dữ liệu favorite feed cũ vẫn được giữ nhưng bị giấu.

Nguồn: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [kết nối PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres), [pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html).
