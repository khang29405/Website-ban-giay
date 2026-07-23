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
5. **Màu sắc/khoảng cách dùng biến CSS đã khai báo trong `base.css`** (`var(--color-primary)`, `var(--radius)`...) — không tự đặt màu mới, giữ giao diện đồng nhất giữa các trang do nhiều người làm.
6. **Header/Footer chỉ sửa ở `layout.js`** — không copy HTML header/footer sang từng trang, tránh sửa 1 nơi quên nơi khác.

## Hiện trạng (sau Task 6 + Task 7)

Đã có: `base.css`, `layout.css`, `components.css`, `config.js`, `api.js`, `auth.js`, `validate.js`, `layout.js`, `html/index.html`, `html/login.html` + `js/pages/login.js`, `html/register.html` + `js/pages/register.js`.
Chưa có (sẽ tạo khi làm sprint sau): `css/pages/`, và các trang HTML khác (sản phẩm, giỏ hàng, đơn hàng, admin...) — tạo đúng theo quy ước ở trên khi bắt đầu, không cần hỏi lại chỗ đặt file.
