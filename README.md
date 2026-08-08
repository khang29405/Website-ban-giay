# Website Bán Giày

Website bán giày trực tuyến, làm đồ án môn Công nghệ phần mềm. Frontend viết bằng HTML/CSS/JavaScript thuần, backend Node.js/Express nối với SQL Server, phân quyền theo 3 vai trò: Khách hàng, Nhân viên và Quản trị viên.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

## Tính năng chính

**Khách hàng**
- Duyệt, tìm kiếm, lọc và sắp xếp sản phẩm theo danh mục, thương hiệu, giá
- Xem chi tiết sản phẩm, chọn size và màu, xem thêm sản phẩm liên quan
- Đăng ký, đăng nhập (JWT), quên mật khẩu qua email, đổi mật khẩu (có yêu cầu độ mạnh mật khẩu kèm checklist)
- Giỏ hàng, đặt hàng (thanh toán khi nhận hàng)
- Theo dõi trạng thái đơn hàng, xem và in hóa đơn
- Danh sách sản phẩm yêu thích
- Gửi liên hệ, chuyển giao diện sáng/tối

**Nhân viên**
- Quản lý danh mục, thương hiệu, sản phẩm và biến thể (size/màu/tồn kho)
- Quản lý đơn hàng của toàn bộ khách hàng, cập nhật trạng thái, xem/in hóa đơn
- Xử lý tin nhắn liên hệ từ khách

**Quản trị viên**
- Toàn bộ quyền của Nhân viên, kèm quyền xóa danh mục/thương hiệu/sản phẩm/biến thể
- Quản lý tài khoản người dùng: đổi vai trò, khóa/mở khóa
- Thống kê doanh thu, top sản phẩm bán chạy, biểu đồ theo tháng/năm

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML/CSS/JavaScript thuần (không framework, không build tool), Font Awesome |
| Backend | Node.js, Express 5, kiến trúc phân tầng routes → controllers → services → models |
| Xác thực | JWT, bcrypt, phân quyền theo vai trò (middleware `requireRole`) |
| Cơ sở dữ liệu | SQL Server (driver `mssql`), 10 bảng, script tại `database/ShoeStoreDB.sql` |
| Khác | Multer + Cloudinary (upload ảnh), Nodemailer (email quên mật khẩu), Swagger (tài liệu API) |
| Triển khai | Docker, Docker Compose (SQL Server + backend + Nginx phục vụ frontend) |

## Cấu trúc dự án

```
Website-ban-giay/
├── backend/                 # Node.js/Express REST API
│   ├── src/
│   │   ├── config/           # cấu hình DB, Swagger, mailer, Cloudinary
│   │   ├── routes/           # định nghĩa endpoint
│   │   ├── controllers/      # xử lý request/response
│   │   ├── services/         # nghiệp vụ
│   │   ├── models/           # truy vấn SQL Server
│   │   ├── middlewares/      # xác thực, phân quyền, validate, xử lý lỗi
│   │   └── app.js
│   ├── server.js
│   └── Dockerfile
├── frontend/                 # HTML/CSS/JS thuần
│   ├── html/                  # các trang
│   ├── css/                   # base/layout/components/dark-theme + css/pages
│   ├── js/                    # api/auth/config/layout/validate + js/pages
│   ├── nginx.conf
│   └── Dockerfile
├── database/
│   ├── ShoeStoreDB.sql        # script tạo schema + dữ liệu mẫu
│   └── docker-seed.sh         # tự động tạo schema khi chạy Docker
├── docker-compose.yml         # dựng toàn bộ hệ thống bằng 1 lệnh
├── HUONG_DAN_BACKEND.md
├── HUONG_DAN_FRONTEND.md
└── HUONG_DAN_SWAGGER.md
```

## Cài đặt & chạy dự án

### Cách 1: Docker (khuyến nghị — chạy toàn bộ hệ thống bằng 1 lệnh)

Yêu cầu: đã cài [Docker Desktop](https://www.docker.com/products/docker-desktop/) và đang chạy.

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

<details>
<summary><b>Kết nối SSMS vào database trong container</b></summary>

Cổng 1433 của SQL Server trong container được mở ra ngoài máy host, nên SSMS (hoặc Azure Data Studio) vẫn kết nối được bình thường như SQL Server cài trực tiếp — chỉ khác thông tin đăng nhập:

- **Server name:** `localhost` (**không** phải `localhost\SQLEXPRESS` — container chạy instance mặc định, không phải named instance).
- **Authentication:** SQL Server Authentication (không phải Windows Authentication).
- **Login:** `sa`
- **Password:** đúng giá trị `DB_SA_PASSWORD` trong file `.env` ở thư mục gốc (không phải mật khẩu SA của SQL Server cài trên máy).

Lưu ý: đây là DB **hoàn toàn mới, tách biệt** với DB cũ (`localhost\SQLEXPRESS`) dùng khi chạy `npm run dev` — không tự đồng bộ dữ liệu qua lại giữa 2 bên. Đổi `DB_SA_PASSWORD` trong `.env` **sau khi** container đã tạo xong sẽ không có tác dụng (mật khẩu SA chỉ được đặt đúng 1 lần lúc container khởi tạo lần đầu) — muốn đổi mật khẩu SA thì phải xoá volume (`docker compose down -v`) rồi tạo lại từ đầu.
</details>

<details>
<summary><b>Tạo tài khoản Admin đầu tiên trên DB mới (container)</b></summary>

DB trong container luôn khởi tạo rỗng — chưa có tài khoản Admin nào. Vì đổi vai trò sang Admin qua API bắt buộc phải đăng nhập bằng Admin có sẵn (chống tự phong quyền), nên tài khoản Admin đầu tiên phải tạo bằng tay, đúng 1 lần:

1. Đăng ký 1 tài khoản bình thường qua trang web hoặc `POST /api/auth/register` (mặc định là `KhachHang`).
2. Chạy SQL trực tiếp vào DB container để nâng lên Admin — qua SSMS (xem hướng dẫn kết nối ở trên) hoặc qua lệnh:
   ```bash
   docker exec website-ban-giay-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "<DB_SA_PASSWORD trong .env>" -C -d ShoeStoreDB -Q "UPDATE NGUOI_DUNG SET VaiTro='Admin' WHERE Email='email_vua_dang_ky@...'"
   ```
3. Đăng nhập lại — tài khoản đã là Admin, từ đây dùng tab "Tài khoản" trên trang quản trị để quản lý vai trò các tài khoản khác qua giao diện, không cần đụng SQL nữa.
</details>

<details>
<summary><b>Chia sẻ 1 database dùng chung cho cả nhóm (qua ngrok, không cần VPS)</b></summary>

Mở cổng SQL Server trong container ra internet tạm thời qua [ngrok](https://ngrok.com):

**Phía host (máy đang chạy `docker compose up -d`, container `db` đang `healthy`):**

1. Cài ngrok, đăng ký tài khoản free, xác minh thẻ (bắt buộc để dùng TCP endpoint, không bị trừ tiền): https://dashboard.ngrok.com/settings#id-verification
2. Lấy authtoken ở Dashboard, chạy 1 lần: `ngrok config add-authtoken <token>`
3. Mở tunnel: `ngrok tcp 1433` — **giữ cửa sổ này mở suốt** lúc nhóm cần dùng chung DB, tắt đi là mất kết nối.
4. Ngrok in ra dòng dạng `Forwarding tcp://0.tcp.ap.ngrok.io:25318 -> localhost:1433` — gửi riêng cho nhóm **host** (`0.tcp.ap.ngrok.io`), **port** (`25318`), và mật khẩu `sa` (chính là `DB_SA_PASSWORD` trong file `.env` ở thư mục gốc) — **không đăng công khai / không commit lên Git**.

**Phía các thành viên còn lại:** sửa `backend/.env`, thay các dòng DB bằng thông tin host vừa gửi:

```
DB_SERVER=0.tcp.ap.ngrok.io
DB_INSTANCE=
DB_PORT=25318
DB_USER=sa
DB_PASSWORD=<mật khẩu sa host gửi>
```

Chạy backend như bình thường (`npm start` hoặc `npm run dev` trong `backend/`), thấy log "Đã kết nối SQL Server" là đã kết nối vào đúng DB chung.

Lưu ý: gói ngrok free mỗi lần mở lại tunnel sẽ đổi **host:port ngẫu nhiên** — host cần báo lại địa chỉ mới cho nhóm mỗi lần restart.
</details>

### Cách 2: Chạy thủ công (development, không dùng Docker)

Dùng khi cần chạy backend với `npm run dev` (tự restart khi sửa code) và SQL Server cài trực tiếp trên máy. Xem hướng dẫn đầy đủ (cấu hình `.env`, chuẩn bị database, danh sách API, xử lý lỗi kết nối thường gặp) tại **[HUONG_DAN_BACKEND.md](HUONG_DAN_BACKEND.md)** và **[HUONG_DAN_FRONTEND.md](HUONG_DAN_FRONTEND.md)**.

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| **[HUONG_DAN_BACKEND.md](HUONG_DAN_BACKEND.md)** | Chuẩn bị database, cấu hình `.env`, chạy backend thủ công, danh sách API, cách xử lý lỗi kết nối SQL Server thường gặp |
| **[HUONG_DAN_FRONTEND.md](HUONG_DAN_FRONTEND.md)** | Quy ước cấu trúc thư mục, cách thêm trang mới, danh sách các trang hiện có |
| **[HUONG_DAN_SWAGGER.md](HUONG_DAN_SWAGGER.md)** | Cách mở và dùng Swagger UI để xem/test API trực tiếp trên trình duyệt |

## Ghi chú

Làm cho mục đích học tập, không dùng để kinh doanh.
