# Website bán giày thể thao

Frontend HTML/CSS/JavaScript thuần + Backend Node.js/Express (kiến trúc phân tầng) + SQL Server. Xác thực bằng JWT.

## Cấu trúc thư mục

```
database/   scripts SQL (tạo bảng + dữ liệu mẫu)
backend/    Node.js/Express API (có npm)
frontend/   HTML/CSS/JS thuần (không dùng npm)
```

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị bản LTS)
- SQL Server (Express hoặc bản đầy đủ), có thể truy cập qua SSMS
- Một client gọi API để test: Postman / Thunder Client / curl

## 1. Chuẩn bị database

1. Mở `database/ShoeStoreDB.sql` bằng SSMS, chạy toàn bộ file để tạo database `ShoeStoreDB`, 8 bảng và dữ liệu mẫu.
2. Ghi lại thông tin kết nối SQL Server của máy bạn: tên server (ví dụ `localhost` hoặc `localhost\SQLEXPRESS` nếu dùng named instance), tài khoản đăng nhập (ví dụ `sa`), mật khẩu.
   - Nếu dùng named instance (vd `SQLEXPRESS`), phải bật SQL Server Authentication (Mixed Mode), enable login `sa` và đảm bảo dịch vụ **SQL Server Browser** đang chạy.

## 2. Chạy Backend

Mỗi thành viên tự cấu hình kết nối database của máy mình — **không commit file `.env` thật lên GitHub**.

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Mở `backend/.env` vừa tạo và điền thông tin thật của máy bạn:

```
PORT=5000

DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS   # chỉ cần dòng này nếu dùng named instance, xoá nếu dùng instance mặc định
DB_PORT=1433              # bỏ qua nếu đã dùng DB_INSTANCE
DB_NAME=ShoeStoreDB
DB_USER=sa
DB_PASSWORD=<mật khẩu SQL Server của bạn>
DB_ENCRYPT=false

JWT_SECRET=<chuỗi bí mật ngẫu nhiên, tuỳ ý>
JWT_EXPIRES_IN=1d
```

Chạy server:

```bash
npm run dev      # tự restart khi sửa code (nodemon)
# hoặc
npm start
```

Kiểm tra: mở `http://localhost:5000/api/health`, phải thấy `{"success":true,"data":{"server":"up","db":"connected"}}`.

## Xử lý lỗi thường gặp khi kết nối SQL Server

Nếu gọi `/api/health` mà báo `{"success":false,"message":"Kết nối cơ sở dữ liệu thất bại"}`, kiểm tra lần lượt các lỗi thường gặp sau (đều xuất phát từ named instance như `SQLEXPRESS`):

**1. Lỗi `ETIMEOUT: Failed to connect to localhost\SQLEXPRESS in 15000ms`**
Nguyên nhân: dịch vụ **SQL Server Browser** đang Stopped — đây là dịch vụ bắt buộc để client tìm ra port của named instance.
Cách fix: `Win + R` → `services.msc` → tìm **SQL Server Browser** → chuột phải → **Properties** → Startup type = **Automatic** → **Start**.

**2. Lỗi `Port for SQLEXPRESS not found in localhost`**
Nguyên nhân: giao thức **TCP/IP** đang bị tắt cho instance (mặc định SQL Express chỉ bật Shared Memory/Named Pipes, không bật TCP/IP).
Cách fix: mở **SQL Server Configuration Manager** → **SQL Server Network Configuration** → **Protocols for SQLEXPRESS** → chuột phải **TCP/IP** → **Enable** → sau đó **restart dịch vụ SQL Server (SQLEXPRESS)** trong `services.msc` để áp dụng.

**3. Điền sai `DB_SERVER` khi dùng named instance**
Không được gộp `TEN_MAY\SQLEXPRESS` chung vào `DB_SERVER` (package `mssql` không tự tách được). Phải tách riêng:
```
DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS
```

**4. Đăng nhập `sa` bị từ chối**
Nguyên nhân: SQL Server mặc định chỉ bật Windows Authentication, tài khoản `sa` đang bị disable.
Cách fix: SSMS → chuột phải server gốc → **Properties → Security** → chọn **SQL Server and Windows Authentication mode** → OK → **Security → Logins → sa** → Properties → đặt mật khẩu (tab General) + Login = Enabled (tab Status) → restart dịch vụ SQL Server.

## 3. Chạy Frontend

Không cần npm/build. Mở trực tiếp `frontend/html/index.html` bằng trình duyệt, hoặc dùng một static server đơn giản (vd extension "Live Server" của VS Code) để tránh lỗi CORS/file://.

`frontend/js/main.js` có biến `API_BASE_URL` trỏ về `http://localhost:5000/api` — sửa lại nếu backend chạy port khác.

## Quy ước làm việc nhóm

- Nhánh: `main` là nhánh chính, mỗi task tạo nhánh riêng `feat/SCRUM-xx-...`, merge xong thì xoá nhánh.
- Commit: `type(scope): SCRUM-xx mô tả ngắn` (vd `feat(auth): SCRUM-17 đăng nhập JWT`), commit nhỏ và thường xuyên, không dồn vào ngày cuối sprint.
- Không commit file `backend/.env` (đã bị `.gitignore` chặn) — chỉ commit `backend/.env.example`.
