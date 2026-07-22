# Hướng dẫn xem Swagger

## Swagger là gì?

Swagger là công cụ mô tả và test REST API dưới dạng một trang web tương tác — thay vì đọc code hoặc hỏi nhau qua tin nhắn, cả nhóm mở cùng một trang để xem API nào tồn tại, cần gửi gì, trả về gì, và có thể test thử ngay trên trình duyệt.

## 1. Cách mở Swagger UI

1. Chạy backend trước (xem [HUONG_DAN_BACKEND.md](HUONG_DAN_BACKEND.md)):
   ```bash
   cd backend
   npm run dev
   ```
2. Mở trình duyệt, vào:
   ```
   http://localhost:5000/api-docs
   ```
3. Sẽ thấy danh sách các API được nhóm theo tag (`Auth`, `Health`), mỗi API có method (GET/POST), đường dẫn, mô tả.

## 2. Cách test API ngay trên Swagger (không cần Postman)

1. Bấm vào một API muốn test (ví dụ `POST /auth/register`) để mở rộng.
2. Bấm nút **Try it out** (góc phải).
3. Ô **Request body** sẽ hiện sẵn dữ liệu mẫu — sửa lại giá trị theo ý muốn (ví dụ đổi `Email` để tránh trùng).
4. Bấm **Execute**.
5. Kéo xuống xem:
   - **Response body**: dữ liệu trả về (JSON).
   - **Response code**: mã trạng thái (`201`, `400`, `409`...).
   - **Curl**: lệnh curl tương đương, có thể copy dùng nơi khác.

## 3. Dùng token cho các API cần đăng nhập (áp dụng từ sprint sau)

Khi có route nào gắn middleware `verifyToken` (bảo vệ bằng JWT), làm theo:

1. Gọi `POST /auth/login` trên Swagger trước, copy giá trị `token` trong response.
2. Bấm nút **Authorize** (ổ khoá, góc trên bên phải trang Swagger).
3. Dán token vào ô hiện ra (không cần gõ chữ `Bearer`, Swagger tự thêm) → **Authorize** → **Close**.
4. Từ giờ mọi request "Try it out" trong trang sẽ tự động kèm token này ở header `Authorization`, cho đến khi bạn **Logout** (cũng ở nút Authorize) hoặc tải lại trang.

## 4. Cách đọc 1 API trên Swagger để biết cần làm gì ở Frontend

Mỗi API trên Swagger có 5 phần, đọc theo đúng thứ tự này để suy ra việc cần làm:

| Phần trên Swagger | Cho biết gì | Frontend cần làm gì |
|---|---|---|
| **Method + đường dẫn** (vd `POST /auth/register`) | Gọi API bằng cách nào | Dùng `fetch(API_BASE_URL + "/auth/register", { method: "POST", ... })` |
| **Request body / schema** | Các field cần gửi lên, field nào có dấu `*` (bắt buộc) | Mỗi field cần gửi = 1 ô input trên form. Field bắt buộc → thêm `required` + validate trước khi submit |
| **Response `2xx`** (thành công) | Dữ liệu server trả về khi mọi thứ ổn | Đây là dữ liệu sẽ hiển thị lên giao diện hoặc lưu lại (vd lưu `token`) |
| **Responses `4xx`/`5xx`** (bảng phía dưới) | Các trường hợp lỗi có thể xảy ra | Mỗi mã lỗi cần 1 thông báo tương ứng hiển thị cho người dùng |
| **Ổ khoá (Authorize)** trên API đó, nếu có | API này cần đăng nhập mới gọi được | Phải đính kèm `Authorization: Bearer <token>` khi gọi (token lấy từ lúc login, lưu ở `localStorage`) |

Áp dụng đúng bảng 5 phần này cho **bất kỳ API nào** xuất hiện trên Swagger (auth, sản phẩm, giỏ hàng, đơn hàng... ở sprint sau) là suy ra được ngay cần làm gì ở giao diện, không cần hỏi lại Backend.

### Ví dụ áp dụng — `POST /auth/register`

Đọc Swagger thấy: body cần `HoTen`, `Email`, `MatKhau` (bắt buộc), `SDT`, `DiaChi` (không bắt buộc); trả `201` khi thành công; `400` và `409` khi lỗi.

→ Việc cần làm ở Frontend:
- Làm form có 5 ô tương ứng 5 field, field bắt buộc gắn `required`.
- Khi submit: gửi đúng các field đó dạng JSON tới `POST /api/auth/register`.
- `201`: báo thành công, điều hướng người dùng tới bước tiếp theo (vd trang đăng nhập).
- `400`: đọc `errors` trong response, hiện lỗi ngay dưới ô input tương ứng.
- `409`: hiện thông báo lỗi lấy đúng từ `message` server trả về, đặt gần field liên quan (ở đây là Email).

## 5. Cách thêm tài liệu Swagger cho API mới (dành cho các sprint sau)

Không cần sửa file cấu hình. Chỉ cần viết comment `@swagger` ngay phía trên route trong file `backend/src/routes/*.js`, theo mẫu có sẵn trong `authRoutes.js`:

```js
/**
 * @swagger
 * /san-pham:
 *   get:
 *     summary: Lay danh sach san pham
 *     tags: [SanPham]
 *     responses:
 *       200:
 *         description: Thanh cong
 */
router.get("/san-pham", ...);
```

Swagger sẽ tự quét lại comment này mỗi khi restart server (`backend/src/config/swagger.js` đã cấu hình sẵn để quét toàn bộ `src/routes/*.js`) — không cần đăng ký thủ công ở đâu khác.
