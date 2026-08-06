# Website bán giày

Frontend HTML/CSS/JavaScript thuần + Backend Node.js/Express (kiến trúc phân tầng) + SQL Server. Xác thực bằng JWT.

## Cấu trúc thư mục

```
database/   scripts SQL (tạo bảng + dữ liệu mẫu)
backend/    Node.js/Express API (có npm)
frontend/   HTML/CSS/JS thuần (không dùng npm)
```

## Tài liệu

- **[HUONG_DAN_BACKEND.md](HUONG_DAN_BACKEND.md)** — cách chuẩn bị database, cấu hình `.env`, chạy backend, danh sách API hiện có, quy ước làm việc nhóm (nhánh/commit), và cách xử lý các lỗi thường gặp khi kết nối SQL Server.
- **[HUONG_DAN_SWAGGER.md](HUONG_DAN_SWAGGER.md)** — cách mở và dùng Swagger UI để xem/test API trực tiếp trên trình duyệt.

## Chạy toàn bộ hệ thống bằng Docker (Sprint 4)

`docker-compose.yml` ở thư mục gốc dựng 4 container: `db` (SQL Server), `db-seed` (tự tạo schema `ShoeStoreDB` nếu chưa có), `backend`, `frontend` (Nginx phục vụ file tĩnh).

1. Copy `.env.example` (thư mục gốc) thành `.env`, đặt mật khẩu SA đủ mạnh (tối thiểu 8 ký tự, đủ 3/4 loại chữ hoa/chữ thường/số/ký tự đặc biệt — SQL Server sẽ từ chối mật khẩu yếu).
2. Đảm bảo `backend/.env` đã có đủ các biến còn lại (JWT_SECRET, SMTP, Cloudinary...) theo `backend/.env.example` — riêng `DB_SERVER`/`DB_INSTANCE`/`DB_PORT`/`DB_PASSWORD` sẽ tự động bị Docker Compose ghi đè để trỏ vào container `db`, không cần sửa tay.
3. Chạy:
   ```
   docker compose up -d --build
   ```
   Lần đầu chạy sẽ tự động tải image SQL Server (~1.5GB) và tạo schema, có thể mất vài phút. `db-seed` chỉ tạo schema khi database chưa tồn tại — chạy lại `docker compose up` (hoặc `docker compose restart`) nhiều lần không làm mất dữ liệu (lưu trong volume `mssql-data`).
4. Truy cập: Frontend `http://localhost:8080/html/index.html`, API `http://localhost:5000/api`, Swagger `http://localhost:5000/api-docs`.
5. Dừng toàn bộ: `docker compose down` (thêm `-v` nếu muốn xóa luôn dữ liệu DB trong volume).

### Kết nối SSMS vào database trong container

Cổng 1433 của SQL Server trong container được mở ra ngoài máy host, nên SSMS (hoặc Azure Data Studio) vẫn kết nối được bình thường như SQL Server cài trực tiếp — chỉ khác thông tin đăng nhập:

- **Server name:** `localhost` (**không** phải `localhost\SQLEXPRESS` — container chạy instance mặc định, không phải named instance).
- **Authentication:** SQL Server Authentication (không phải Windows Authentication).
- **Login:** `sa`
- **Password:** đúng giá trị `DB_SA_PASSWORD` trong file `.env` ở thư mục gốc (không phải mật khẩu SA của SQL Server cài trên máy).

Lưu ý: đây là DB **hoàn toàn mới, tách biệt** với DB cũ (`localhost\SQLEXPRESS`) dùng khi chạy `npm run dev` — không tự đồng bộ dữ liệu qua lại giữa 2 bên. Đổi `DB_SA_PASSWORD` trong `.env` **sau khi** container đã tạo xong sẽ không có tác dụng (mật khẩu SA chỉ được đặt đúng 1 lần lúc container khởi tạo lần đầu) — muốn đổi mật khẩu SA thì phải xoá volume (`docker compose down -v`) rồi tạo lại từ đầu.

### Tạo tài khoản Admin đầu tiên trên DB mới (container)

DB trong container luôn khởi tạo rỗng — chưa có tài khoản Admin nào. Vì đổi vai trò sang Admin qua API bắt buộc phải đăng nhập bằng Admin có sẵn (chống tự phong quyền), nên tài khoản Admin đầu tiên phải tạo bằng tay, đúng 1 lần:

1. Đăng ký 1 tài khoản bình thường qua trang web hoặc `POST /api/auth/register` (mặc định là `KhachHang`).
2. Chạy SQL trực tiếp vào DB container để nâng lên Admin — qua SSMS (xem hướng dẫn kết nối ở trên) hoặc qua lệnh:
   ```bash
   docker exec website-ban-giay-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "<DB_SA_PASSWORD trong .env>" -C -d ShoeStoreDB -Q "UPDATE NGUOI_DUNG SET VaiTro='Admin' WHERE Email='email_vua_dang_ky@...'"
   ```
3. Đăng nhập lại — tài khoản đã là Admin, từ đây dùng tab "Tài khoản" trên trang quản trị để quản lý vai trò các tài khoản khác qua giao diện, không cần đụng SQL nữa.
