# Kiểm kê Supabase cũ — P0-02

Mốc nguồn: `ff76724`, khảo sát ngày 21/11/2026; snapshot schema/seed gốc lưu tại [archive/legacy-demo.sql.txt](../../supabase/archive/legacy-demo.sql.txt). Đây là kiểm kê mã nguồn, không phải snapshot database hosted. Thử HEAD đọc số lượng công khai và JWKS bằng cấu hình local đều lỗi kết nối; xem [bằng chứng](../verification/evidence/P0-02-public-probe.json). Chưa có credential owner/test branch để đọc catalogs, backup và migrate hosted.

| Miền | Bảng/query đang dùng | Phân loại và rủi ro trước sửa |
| --- | --- | --- |
| Tỉnh | `provinces`, provinceRepository: list/bySlug | Danh mục seed cũ 63 tỉnh; công khai, chưa là danh mục hiện hành. Đối chiếu tên/ID ở P1-02 |
| Địa điểm | `destinations`, destinationRepository: list/slug/province/search, join province | Seed demo 20 địa điểm, rating và ảnh không có chứng cứ nguồn/quyền; không coi là nội dung thật đã nghiệm thu |
| Hồ sơ | `profiles`, profileRepository: id/username/update; authService: get/insert fallback; nested joins của reviews/favorites/feed | ID UUID nhưng không FK auth trong script; ba profile demo không chứng minh có Auth user. `phone_number`, `birth_date` bị đọc công khai qua `*`; policy INSERT/UPDATE luôn đúng |
| Đánh giá | `reviews`, reviewRepository: list/destination/user/create/update/delete | Năm review seed, rating constraint 1–5; chưa unique user/destination. Ghi/sửa/xóa luôn đúng trước migration; aggregate rating hiện viết sẵn |
| Yêu thích | `favorites`, favoriteRepository: list/user/add/remove/isFavorite | Bốn favorite demo, unique user/destination; đọc và ghi toàn bộ công khai trước migration, trái yêu cầu riêng tư |
| Feed | `feed_activities`, feedService: all/user, nested profiles/destinations/provinces | Derived bằng trigger review/favorite; trước migration tự công khai favorite, không có quyền ghi trực tiếp cần cho FE |
| Auth | Supabase Auth signUp/signIn/signOut/getUser, AuthContext | Profile fallback phía client có thể trả thành công khi lưu lỗi; email confirmation/refresh/reset còn ở P0-06/07, chưa kiểm thử thật |
| Storage | Không tìm thấy upload/storage call thực thi trong source đã khảo sát | Chưa có bucket/policy/bytes inventory hosted; không kết luận Storage đang trống |

`src/data/users.ts`, `reviews.ts`, `favorites.ts`, `destinations.ts`, `provinces.ts`, `mockMapPlaces.ts`, `src/pages/home/data.ts` và thống kê trang chủ có dữ liệu viết sẵn. Không nhập chúng như người dùng/review/aggregate thật. Phân loại bản ghi trên database phải theo manifest nguồn và đối chiếu Auth/ảnh, không xóa tự động chỉ vì ID giống demo.

## Trigger/function đã khảo sát và xử lý

- `on_auth_user_created` → `handle_new_user`: SECURITY DEFINER không khóa search_path; username metadata có thể trùng làm lỗi signup. Migration khóa search_path rỗng, fully qualify bảng, loại ký tự username và có fallback UUID, không cấp role từ metadata.
- `on_review_changed` → `handle_review_feed_activity`: SECURITY DEFINER không khóa search_path; update/delete lọc `source_id` thiếu type. Migration scope theo review và chặn người dùng sửa owner/ID/destination bằng column grants; create/update/delete hợp lệ vẫn đồng bộ.
- `on_favorite_changed` → `handle_favorite_feed_activity`: trước ghi favorite công khai. Migration thay bằng no-op, giấu các dòng favorite cũ bằng RLS, không xóa dữ liệu.
- Cả ba hàm đều bị thu hồi EXECUTE khỏi PUBLIC/anon/authenticated. Trigger vẫn chạy được với owner đã tin cậy. Database hosted có thể có function/trigger khác: phải kiểm kê owner, grants và đường gọi trước áp dụng; test local chỉ dựng đúng schema trong repo.

## Thay đổi tương thích FE trong đợt này

Thay các wildcard `profiles(*)` bằng tập trường công khai rõ ràng; auth/profile đọc theo `PUBLIC_PROFILE_FIELDS`. Dữ liệu phone/birth được sao chép sang `profiles_private` với RLS chủ sở hữu; cột cũ giữ để khôi phục nhưng không cấp đọc/ghi API. Profile công khai theo username không lấy liên hệ. Profile owner đọc bảng private sau kiểm tra session; kiểm tra session phía client chỉ phục vụ UX, RLS là ranh giới thực.

Mặc định `VITE_LEGACY_PRIVATE_PROFILES_ENABLED=false`: không query bảng mới trước migration, không cho lưu liên hệ vào nguồn công khai cũ. Chỉ bật flag sau migration/SDK check và rebuild FE. Khi bật, method cập nhật legacy ghi public/private bằng hai request và báo rõ lỗi lưu một phần; transaction đầy đủ sẽ chuyển vào API ở P0-05/06/P2-01. Form sửa hồ sơ hiện chưa được hoàn thiện trong P0-01…04. Phải phát hành code projection trước migration thu hồi quyền wildcard. Không thu hồi toàn bộ Data API khi các miền khám phá/review/favorite vẫn dùng nó.

## Còn thiếu để đóng P0-02 trên môi trường thật

- Chạy [inventory.sql](../../supabase/inventory.sql) bằng owner trên project test được phép; kiểm tra schema drift, function/role/default grants, row count, ảnh/bucket và Auth subject.
- Chụp backup/test restore của dữ liệu thật được phép, có manifest/quyền xử lý dữ liệu riêng tư.
- Áp dụng migration theo [runbook](LEGACY_MIGRATION.md), xác minh SDK/PostgREST và khách/A/B với JWT thật; chưa có bằng chứng này.
- Không khẳng định policy hosted đã an toàn từ kiểm thử fixture hoặc từ file SQL.
