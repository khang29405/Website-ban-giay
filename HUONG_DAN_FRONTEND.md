# Hướng dẫn cấu trúc Frontend

Frontend là HTML/CSS/JavaScript thuần, không dùng npm/framework/build tool. Quy ước dưới đây giúp thêm trang mới mà không bị rối, không phải tổ chức lại từ đầu.

## Cấu trúc thư mục

```
frontend/
├── html/
│   ├── index.html          # trang chủ
│   ├── login.html          # đăng nhập
│   ├── register.html       # đăng ký
│   ├── product-detail.html # chi tiết sản phẩm
│   ├── cart.html           # giỏ hàng
│   └── ...
├── css/
│   ├── base.css             # reset, biến màu (:root), typography — dùng chung TOÀN BỘ trang
│   ├── layout.css           # Header, menu, Footer — dùng chung TOÀN BỘ trang
│   ├── components.css       # các khối UI dùng lại nhiều nơi: nút, card, hero, form...
│   └── pages/
│       ├── login.css        # style CHỈ riêng cho login.html (nếu cần)
│       ├── product-detail.css
│       └── ...
└── js/
    ├── config.js            # hằng số dùng chung (API_BASE_URL...)
    ├── api.js                # helper gọi API dùng chung (apiPost, apiGet...)
    ├── auth.js                # helper trạng thái đăng nhập dùng chung
    ├── validate.js             # helper validate form dùng chung (email, SĐT, hiện/ẩn lỗi từng field)
    ├── layout.js               # render Header/Footer dùng chung (đọc trạng thái đăng nhập từ auth.js)
    └── pages/
        ├── login.js            # logic CHỈ riêng cho login.html
        ├── register.js
        └── ...
```

## Quy tắc

1. **File dùng chung nhiều trang** (header, footer, gọi API, lưu JWT, biến màu...) → nằm ở `css/`, `js/` gốc (không có subfolder), vì mọi trang đều cần include.
2. **File chỉ phục vụ 1 trang cụ thể** (form đăng ký, danh sách sản phẩm, giỏ hàng...) → nằm trong `css/pages/` và `js/pages/`, **đặt tên trùng với trang HTML** để dễ tìm — vd `register.html` đi cùng `css/pages/register.css` và `js/pages/register.js`.
3. **Không viết `<script>`/`<style>` trực tiếp trong file HTML** — mọi logic/style đều tách ra file `.js`/`.css` riêng theo quy tắc 1-2, HTML chỉ chứa cấu trúc + thẻ `<link>`/`<script src>`.
4. **Thứ tự include cố định trong mọi trang** (đúng thứ tự phụ thuộc):
   ```html
   <link rel="stylesheet" href="../css/base.css">
   <link rel="stylesheet" href="../css/layout.css">
   <link rel="stylesheet" href="../css/components.css">
   <link rel="stylesheet" href="../css/pages/ten-trang.css">  <!-- nếu có -->

   <script src="../js/config.js"></script>
   <script src="../js/api.js"></script>
   <script src="../js/auth.js"></script>
   <script src="../js/validate.js"></script>
   <script src="../js/layout.js"></script>
   <script src="../js/pages/ten-trang.js"></script>  <!-- nếu có -->
   ```
5. **Màu sắc/khoảng cách dùng biến CSS đã khai báo trong `base.css`** (`var(--color-accent)`, `var(--color-ink)`, `var(--radius)`...) — không tự đặt màu mới, giữ giao diện đồng nhất giữa các trang do nhiều người làm.
6. **Header/Footer chỉ sửa ở `layout.js`** — không copy HTML header/footer sang từng trang, tránh sửa 1 nơi quên nơi khác.
7. **Trang/khối nội dung chính nên có hiệu ứng xuất hiện nhẹ** — thêm class `fade-in` (định nghĩa sẵn trong `base.css`) vào khối bọc ngoài cùng của nội dung chính (card, layout chi tiết...) để trang không bị "tĩnh cứng". `.btn` đã tự có hiệu ứng hover nhấc nhẹ, không cần thêm gì khi dùng nút có sẵn.

## Các trang hiện có

| Trang | File | Ghi chú |
|---|---|---|
| Trang chủ | `index.html` | |
| Đăng nhập / Đăng ký | `login.html` / `register.html` | |
| Quên mật khẩu / Đặt lại mật khẩu | `quen-mat-khau.html` / `reset-password.html` | link đặt lại mật khẩu gửi qua email, token hết hạn sau 15 phút |
| Danh sách sản phẩm | `san-pham.html` | lọc theo danh mục/thương hiệu, tìm kiếm, sắp xếp giá, phân trang |
| Chi tiết sản phẩm | `product-detail.html` | chọn size/màu, thêm giỏ hàng/mua ngay, sản phẩm liên quan |
| Giới thiệu | `about.html` | |
| Liên hệ | `contact.html` | gửi lời nhắn, không cần đăng nhập |
| Giỏ hàng | `cart.html` | |
| Đơn hàng của tôi | `orders.html` | lọc theo trạng thái, xem chi tiết, hủy đơn kèm lý do, xem/in hóa đơn |
| Sản phẩm yêu thích | `yeu-thich.html` | |
| Quản trị | `admin.html` | tab Danh mục/Thương hiệu/Sản phẩm/Đơn hàng/Tin nhắn liên hệ cho Nhân viên; thêm tab Tài khoản (đổi vai trò/khoá) và Thống kê riêng cho Admin |
| 404 | `404.html` | |

Mỗi trang (trừ trang chủ) có file JS riêng cùng tên trong `js/pages/`, một số trang có thêm CSS riêng trong `css/pages/`.

## Các file dùng chung (`js/` gốc)

| File | Chức năng |
|---|---|
| `config.js` | hằng số dùng chung (`API_BASE_URL`...) |
| `api.js` | gọi API (`apiGet/apiPost/apiPut/apiPatch/apiDelete`, `apiGetPaged` cho endpoint có phân trang) |
| `auth.js` | lưu/đọc trạng thái đăng nhập (JWT) |
| `validate.js` | validate form, checklist độ mạnh mật khẩu, hiện/ẩn mật khẩu |
| `layout.js` | render Header/Footer, modal/toast/confirm dùng chung, xem/in hóa đơn |
| `product-card.js` | render thẻ sản phẩm + quản lý danh sách yêu thích dùng chung nhiều trang |
| `theme-init.js` | chuyển đổi giao diện sáng/tối |
