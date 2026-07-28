# Hướng dẫn chạy Backend

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị bản LTS)
- SQL Server (Express hoặc bản đầy đủ), có thể truy cập qua SSMS
- Một client gọi API để test: Postman / Thunder Client / curl (hoặc dùng Swagger UI — xem [HUONG_DAN_SWAGGER.md](HUONG_DAN_SWAGGER.md))

## 1. Chuẩn bị database

1. Mở `database/ShoeStoreDB.sql` bằng SSMS, chạy toàn bộ file để tạo database `ShoeStoreDB`, 8 bảng và dữ liệu mẫu.
2. Ghi lại thông tin kết nối SQL Server của máy bạn: tên server (ví dụ `localhost` hoặc `localhost\SQLEXPRESS` nếu dùng named instance), tài khoản đăng nhập (ví dụ `sa`), mật khẩu.

## 2. Cấu hình và chạy

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

## 3. Danh sách API hiện có (hết Sprint 3 task 4)

Tất cả API có prefix `/api`. Xem chi tiết đầy đủ (schema, ví dụ, test trực tiếp) tại Swagger UI — [HUONG_DAN_SWAGGER.md](HUONG_DAN_SWAGGER.md).

### `GET /api/health`
Kiểm tra server và kết nối database còn sống không.
- Response `200`: `{"success":true,"data":{"server":"up","db":"connected"}}`
- Response `500`: `{"success":false,"message":"Kết nối cơ sở dữ liệu thất bại"}`

### `POST /api/auth/register`
Đăng ký tài khoản khách hàng mới (vai trò luôn là `KhachHang`, không nhận vai trò từ client).

Body (JSON):
```json
{
  "HoTen": "Nguyen Van A",
  "Email": "a@test.com",
  "MatKhau": "123456",
  "SDT": "0901234567",
  "DiaChi": "123 Nguyen Trai, Q1, TP.HCM"
}
```
`SDT` và `DiaChi` không bắt buộc.
- `201`: tạo thành công, trả về thông tin user (không có mật khẩu).
- `400`: dữ liệu không hợp lệ (thiếu trường, email sai định dạng, mật khẩu < 6 ký tự...).
- `409`: email đã được sử dụng.

### `POST /api/auth/login`
Đăng nhập, trả về JWT token.

Body (JSON):
```json
{
  "Email": "a@test.com",
  "MatKhau": "123456"
}
```
- `200`: trả về `{ token, user }`. Token dùng cho các API cần đăng nhập ở sprint sau (header `Authorization: Bearer <token>`).
- `400`: dữ liệu không hợp lệ.
- `401`: sai email hoặc mật khẩu.

### Danh mục (`/api/danh-muc`) và Thương hiệu (`/api/thuong-hieu`)
CRUD đầy đủ, cấu trúc endpoint giống hệt nhau cho cả 2 (chỉ khác tên trường `TenDanhMuc`/`TenThuongHieu`):

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/` | Public | Danh sách tất cả |
| GET | `/:id` | Public | Chi tiết 1 mục, `404` nếu không có |
| POST | `/` | **Admin** | Tạo mới, `201`. `400` nếu thiếu tên/quá 100 ký tự. Riêng thương hiệu: `409` nếu trùng tên (có ràng buộc UNIQUE trong DB) |
| PUT | `/:id` | **Admin** | Cập nhật, `200`. `404` nếu không tồn tại |
| DELETE | `/:id` | **Admin** | Xoá, `200`. `409` nếu đang có sản phẩm tham chiếu tới (ràng buộc khóa ngoại) |

Route Admin cần header `Authorization: Bearer <token>` (lấy từ `/api/auth/login`), thiếu token → `401`, có token nhưng không phải Admin → `403`.

### Sản phẩm (`/api/san-pham`)
| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | / | Public (tuỳ chọn token) | Danh sách tất cả (kèm tên danh mục/thương hiệu qua JOIN). Hỗ trợ query ?ten=&danhMuc=&thuongHieu=&sapXep= để tìm/lọc/sắp xếp. **Khách/chưa đăng nhập chỉ thấy sản phẩm `TrangThai = true`** (sản phẩm đã ẩn bị loại khỏi danh sách); nếu gửi kèm token Admin hợp lệ thì thấy tất cả kể cả sản phẩm đã ẩn |
| GET | `/:id` | Public (tuỳ chọn token) | Chi tiết 1 sản phẩm, `404` nếu không có **hoặc nếu đã ẩn mà người gọi không phải Admin** (coi như không tồn tại) |
| POST | `/` | **Admin** | Tạo mới, `201`. `400` nếu thiếu trường/danh mục hoặc thương hiệu không tồn tại |
| PUT | `/:id` | **Admin** | Cập nhật, `200`. `404` nếu không tồn tại |
| PATCH | `/:id/trang-thai` | **Admin** | Ẩn/hiện sản phẩm, body `{ "TrangThai": true/false }` — không xóa dữ liệu |
| DELETE | `/:id` | **Admin** | Xoá hẳn, `200`. `409` nếu còn biến thể đang có trong giỏ hàng/đơn hàng |

### Biến thể sản phẩm (size/màu/tồn kho)
| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/api/san-pham/:id/bien-the` | Public | Danh sách biến thể của 1 sản phẩm, `404` nếu sản phẩm không tồn tại |
| POST | `/api/san-pham/:id/bien-the` | **Admin** | Thêm biến thể mới, `201`. `409` nếu trùng cặp kích cỡ+màu đã có |
| GET | `/api/bien-the/:id` | Public | Chi tiết 1 biến thể |
| PUT | `/api/bien-the/:id` | **Admin** | Cập nhật kích cỡ/màu/tồn kho, `200` |
| DELETE | `/api/bien-the/:id` | **Admin** | Xoá, `200`. `409` nếu đang có trong giỏ hàng/đơn hàng |

### Giỏ hàng (`/api/gio-hang`) — cần đăng nhập, mỗi người chỉ thấy/sửa được giỏ của chính mình
| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/` | Đã đăng nhập | Danh sách các dòng trong giỏ của user hiện tại (kèm tên/ảnh/giá sản phẩm, size, màu, tồn kho qua JOIN) |
| POST | `/` | Đã đăng nhập | Thêm biến thể vào giỏ, body `{ "MaBienThe": 1, "SoLuong": 1 }`, `201`. Nếu biến thể đã có trong giỏ thì **cộng dồn** số lượng thay vì tạo dòng mới. `400` nếu tổng số lượng vượt tồn kho. `404` nếu biến thể không tồn tại |
| PUT | `/:id` | Đã đăng nhập | Cập nhật số lượng, body `{ "SoLuong": 2 }`, `200`. `400` nếu vượt tồn kho. `404` nếu dòng giỏ hàng không tồn tại hoặc không thuộc về mình |
| DELETE | `/:id` | Đã đăng nhập | Xoá 1 dòng khỏi giỏ, `200`. `404` nếu không tồn tại hoặc không thuộc về mình |

`:id` ở đây là `MaGioHang`. Không giới hạn vai trò (Admin hay KhachHang đều dùng được giỏ hàng của chính mình).

### Đặt hàng (`/api/don-hang`) — cần đăng nhập
| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| POST | `/` | Đã đăng nhập | Đặt hàng từ **toàn bộ giỏ hàng hiện tại**, body `{ "DiaChiGiaoHang": "...", "SDTNhan": "0901234567" }`, `201`. Thanh toán mặc định COD, không nhận từ client. `400` nếu giỏ hàng trống, có sản phẩm đã ngừng bán, hoặc số lượng vượt tồn kho hiện tại (kiểm tra lại tại thời điểm đặt, không chỉ lúc thêm vào giỏ) |  
| GET | `/` | Đã đăng nhập | **KhachHang**: chỉ thấy đơn hàng của chính mình. **Admin**: thấy toàn bộ đơn hàng của mọi khách (kèm `HoTen`/`Email` người đặt) |
| GET | `/:id` | Đã đăng nhập | Chi tiết 1 đơn (kèm `ChiTiet` — danh sách sản phẩm/size/màu/đơn giá). KhachHang chỉ xem được đơn của mình, `404` nếu xem đơn người khác (không lộ đơn đó có tồn tại hay không) |
| PATCH | `/:id/trang-thai` | **Admin** | Cập nhật trạng thái, body `{ "TrangThai": "ChoXuLy" \| "DangGiao" \| "HoanThanh" \| "DaHuy" }`, `200`. Nếu chuyển sang `DaHuy` thì **tự động hoàn lại tồn kho** cho các biến thể trong đơn (chỉ hoàn 1 lần, hủy lại đơn đã hủy không hoàn thêm) |

Khi đặt hàng thành công, trong 1 transaction: tạo `DON_HANG` + `CHI_TIET_DON_HANG` (lưu `DonGia` tại thời điểm mua), trừ `SoLuongTon` của từng biến thể, và xoá các dòng tương ứng khỏi `GIO_HANG`. Nếu bất kỳ bước nào lỗi thì rollback toàn bộ — không có chuyện giỏ hàng bị xoá mà đơn không tạo được (hoặc ngược lại). `TrangThai` đơn hàng mặc định `ChoXuLy`.

### Tạo tài khoản Admin
Đăng ký một tài khoản bình thường qua `/api/auth/register`, sau đó tự nâng quyền trong SSMS:
```sql
UPDATE NGUOI_DUNG SET VaiTro = 'Admin' WHERE Email = N'admin@shoestore.com';
```

## 4. Chạy Frontend

Không cần npm/build. Mở trực tiếp `frontend/html/index.html` bằng trình duyệt, hoặc dùng một static server đơn giản (vd extension "Live Server" của VS Code) để tránh lỗi CORS/file://. Chi tiết cấu trúc thư mục xem [HUONG_DAN_FRONTEND.md](HUONG_DAN_FRONTEND.md).

`frontend/js/config.js` có biến `API_BASE_URL` trỏ về `http://localhost:5000/api` — sửa lại nếu backend chạy port khác.

## 5. Quy ước làm việc nhóm

- Nhánh: `main` là nhánh chính, mỗi task tạo nhánh riêng `feat/SCRUM-xx-...`, merge xong thì xoá nhánh.
- Commit: `type(scope): SCRUM-xx mô tả ngắn` (vd `feat(auth): SCRUM-17 đăng nhập JWT`), commit nhỏ và thường xuyên, không dồn vào ngày cuối sprint.
- Không commit file `backend/.env` (đã bị `.gitignore` chặn) — chỉ commit `backend/.env.example`.

## 6. Xử lý lỗi thường gặp khi kết nối SQL Server

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

**5. Server dừng đột ngột lúc `npm run dev` (`[nodemon] app crashed`) ngay khi chưa gọi API nào**
Sau khi sửa bất kỳ mục nào ở trên, nhớ **restart lại server** (`rs` trong terminal nodemon, hoặc Ctrl+C rồi `npm run dev` lại) vì kết nối DB được thiết lập 1 lần lúc server khởi động.

## 7. Chạy bằng Docker (Task 8 Sprint 1)

Yêu cầu: đã cài [Docker Desktop](https://www.docker.com/products/docker-desktop/) và đang chạy.

### Chuẩn bị

`backend/.env` phải tồn tại (xem mục 2) — Docker Compose đọc file này để cấu hình container. **Không cần sửa tay `DB_SERVER`** — `docker-compose.yml` đã tự động ghi đè `DB_SERVER=host.docker.internal` khi chạy container (mục `environment:` trong file, ghi đè lên giá trị `localhost` trong `.env`), nên `.env` cứ giữ nguyên `DB_SERVER=localhost` để dùng chung được cho cả `npm run dev` lẫn Docker.

Lý do cần ghi đè: container Backend có "localhost" của riêng nó (là chính container đó), không phải máy Windows của bạn — nên không thể dùng `localhost` như lúc chạy `npm run dev` để trỏ tới SQL Server đang cài trên máy thật. `host.docker.internal` là tên DNS đặc biệt Docker Desktop cung cấp sẵn để container gọi ngược ra máy host — SQL Server của bạn vẫn chạy trên Windows như bình thường, không cần đóng gói vào container ở Sprint này.

### Chạy thử

Ở thư mục gốc dự án (`d:\cnpm\web`, nơi có file `docker-compose.yml`):

```bash
docker compose up --build
```

- Backend: `http://localhost:5000/api/health`, `http://localhost:5000/api-docs`
- Frontend: `http://localhost:8080` (tự chuyển tới `http://localhost:8080/html/index.html`)

Dừng: `Ctrl+C`, hoặc `docker compose down` để dọn container.

### Nếu backend trong Docker không kết nối được SQL Server

Dù đã đổi `DB_SERVER=host.docker.internal` đúng, **Windows Firewall vẫn có thể chặn** kết nối từ container tới SQL Server, vì với Firewall thì mạng ảo của Docker (WSL2) bị coi là một mạng khác, không phải "chính máy này" như lúc chạy `npm run dev` trực tiếp (loopback `localhost` được Firewall bỏ qua mặc định, còn kết nối từ container thì không).

Cách kiểm tra/khắc phục: mở **Windows Defender Firewall with Advanced Security** → **Inbound Rules** → tìm rule cho SQL Server (port 1433) và **SQL Server Browser** (UDP 1434) → đảm bảo áp dụng cho cả profile **Private** (mạng Docker/WSL2 thường được xếp vào Private) → nếu chưa có rule, tạo mới cho phép TCP 1433 và UDP 1434 từ mọi nguồn nội bộ.

### Cấu trúc Docker

- `backend/Dockerfile` — image Node.js chạy `server.js`.
- `frontend/Dockerfile` + `frontend/nginx.conf` — image Nginx phục vụ file tĩnh trong `frontend/html`, `frontend/css`, `frontend/js`.
- `docker-compose.yml` (thư mục gốc) — chạy cả 2 container cùng lúc, backend expose cổng 5000, frontend expose cổng 8080.
- **Chưa đóng gói Database** — đây là bản "nền tảng" theo đúng phạm vi Task 8 Sprint 1; Dockerize toàn bộ hệ thống kèm Database là việc của Sprint 3.