# Hướng dẫn cấu trúc Frontend

Frontend là HTML/CSS/JavaScript thuần, không dùng npm/framework/build tool. Quy ước dưới đây giúp thêm trang mới ở các sprint sau mà không bị rối, không phải tổ chức lại từ đầu.

## Cấu trúc thư mục

```
frontend/
├── html/
│   ├── index.html          # trang chủ
│   ├── login.html          # đăng nhập (task 7)
│   ├── register.html       # đăng ký (task 7)
│   ├── product-detail.html # (sprint 2)
│   ├── cart.html           # (sprint 3)
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

## Hiện trạng (Sprint 3 task 6 - đặt hàng & lịch sử đơn hàng)

Đã có: `base.css`, `layout.css`, `components.css`, `config.js`, `api.js` (đủ `apiGet/apiPost/apiPut/apiPatch/apiDelete`, tự gắn `Authorization` nếu có token), `auth.js`, `validate.js`, `layout.js` (header tự hiện link "Quản trị" nếu `user.VaiTro === "Admin"`, có icon giỏ hàng + badge số lượng, avatar dropdown gồm Đơn hàng của tôi/Xem thông tin/Chỉnh sửa/Đổi mật khẩu/Đăng xuất, và các hàm dùng chung `showToast`/`showConfirm`/`openModal`/`closeModal`/`emptyStateIcon`).

Các trang đã có:
- `html/index.html` — trang chủ
- `html/login.html` + `js/pages/login.js`, `html/register.html` + `js/pages/register.js`
- `html/san-pham.html` + `js/pages/san-pham.js` — danh sách sản phẩm, lọc theo danh mục/thương hiệu, tìm kiếm, sắp xếp giá
- `html/product-detail.html` + `js/pages/product-detail.js` + `css/pages/product-detail.css` — chi tiết sản phẩm, chọn size/màu, thêm vào giỏ, sản phẩm cùng danh mục/thương hiệu
- `html/about.html` + `js/pages/about.js` + `css/pages/about.css` — giới thiệu
- `html/cart.html` + `js/pages/cart.js` + `css/pages/cart.css` — giỏ hàng, sửa số lượng/xóa, modal đặt hàng (nhập địa chỉ/SĐT, prefill từ hồ sơ, gọi `POST /don-hang`)
- `html/orders.html` + `js/pages/orders.js` + `css/pages/orders.css` — lịch sử đơn hàng của khách (danh sách + modal xem chi tiết từng đơn)
- `html/admin.html` + `js/pages/admin.js` + `css/pages/admin.css` — quản trị danh mục/thương hiệu/sản phẩm/biến thể

Chưa có (sẽ tạo khi làm Sprint 3 task 7-8): trang quản lý đơn hàng cho Admin (xem tất cả đơn, đổi trạng thái), Dockerize toàn bộ hệ thống — tạo đúng theo quy ước ở trên khi bắt đầu, không cần hỏi lại chỗ đặt file.
