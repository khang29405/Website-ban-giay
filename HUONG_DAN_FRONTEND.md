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

## Hiện trạng (Sprint 3 - đã hoàn thiện quản lý đơn hàng + các yêu cầu bổ sung)

Đã có: `base.css`, `layout.css`, `components.css` (gồm cả các thành phần dùng chung cho đơn hàng: `.order-tabs`, `.order-status`, `.order-progress`, `.order-detail-*`, `.order-cancel-reason`, `.pagination` — dùng chung giữa trang khách và tab Admin), `config.js`, `api.js` (đủ `apiGet/apiPost/apiPut/apiPatch/apiDelete`, tự gắn `Authorization` nếu có token; riêng `apiGetPaged(path, params)` dùng cho các endpoint có phân trang — trả về `{ items, pagination }` thay vì mảng thẳng, vì `apiGet` mặc định chỉ trả `data`), `auth.js`, `validate.js`, `layout.js` (header tự hiện link "Quản trị" nếu `user.VaiTro === "Admin"`, có icon giỏ hàng + badge số lượng, avatar dropdown gồm Đơn hàng của tôi/Xem thông tin/Chỉnh sửa/Đổi mật khẩu/Đăng xuất, hàm `openCheckoutModal` dùng chung cho cả trang giỏ hàng và nút "Mua ngay", hàm `renderPagination(container, pagination, onPageChange)` dùng chung cho mọi danh sách có phân trang, và các hàm dùng chung `showToast` (giới hạn tối đa 3 toast hiển thị cùng lúc, tự dọn toast cũ nhất khi bấm liên tục)/`showConfirm`/`showPrompt` (hộp thoại nhập 1 dòng text bắt buộc, dùng cho lý do hủy đơn)/`openModal`/`closeModal`/`emptyStateIcon`).

**Phân trang**: `san-pham.html` (catalog công khai) và tab "Sản phẩm"/"Đơn hàng" trong `admin.html`, cùng `orders.html` (đơn hàng của khách) đều dùng `apiGetPaged` + `renderPagination` (nút Trước/Sau đơn giản, không đánh số trang) — đổi trang/đổi bộ lọc/tìm kiếm đều reset về trang 1. Tab "Thống kê" của Admin **không** dùng danh sách đã phân trang của tab "Đơn hàng" — nó gọi `/api/don-hang` riêng, không truyền `page`, để luôn có toàn bộ đơn hàng khi tính tổng doanh thu/số đơn.

Các trang đã có:
- `html/index.html` — trang chủ
- `html/login.html` + `js/pages/login.js`, `html/register.html` + `js/pages/register.js`
- `html/quen-mat-khau.html` + `js/pages/quen-mat-khau.js` (Sprint 4) — nhập email, gọi `POST /api/auth/quen-mat-khau`, luôn hiện cùng 1 thông báo chung dù email có tồn tại hay không (không lộ thông tin), không chuyển trang
- `html/reset-password.html` + `js/pages/reset-password.js` (Sprint 4) — đọc `token` từ query string (link trong email), nhập mật khẩu mới + xác nhận, gọi `POST /api/auth/dat-lai-mat-khau`; thiếu token hoặc token sai/hết hạn thì ẩn form, hiện lỗi kèm link quay lại `quen-mat-khau.html`; thành công thì chuyển sang `login.html?reset=1`
- `html/san-pham.html` + `js/pages/san-pham.js` — danh sách sản phẩm, lọc theo danh mục/thương hiệu, tìm kiếm, sắp xếp giá
- `html/product-detail.html` + `js/pages/product-detail.js` + `css/pages/product-detail.css` — chi tiết sản phẩm, chọn size/màu, thêm vào giỏ/mua ngay, sản phẩm cùng danh mục/thương hiệu
- `html/about.html` + `js/pages/about.js` + `css/pages/about.css` — giới thiệu (câu chuyện, cách mua hàng, giá trị cốt lõi, thương hiệu phân phối, CTA cuối trang dẫn sang trang sản phẩm/liên hệ)
- `html/contact.html` + `js/pages/contact.js` + `css/pages/contact.css` — liên hệ (thông tin cửa hàng + form gửi lời nhắn, tự điền họ tên/email nếu đã đăng nhập; form gửi thật qua `POST /api/lien-he`, không cần đăng nhập, có xử lý lỗi nếu gửi thất bại)
- `html/cart.html` + `js/pages/cart.js` + `css/pages/cart.css` — giỏ hàng, sửa số lượng/xóa, mở modal đặt hàng dùng chung
- `html/orders.html` + `js/pages/orders.js` + `css/pages/orders.css` — lịch sử đơn hàng của khách (tabs lọc trạng thái, danh sách kèm ảnh xem trước, modal chi tiết có thanh tiến trình trạng thái, hiển thị lý do hủy nếu đơn đã bị Admin hủy)
- `html/admin.html` + `js/pages/admin.js` + `css/pages/admin.css` — quản trị danh mục/thương hiệu/sản phẩm/biến thể; sản phẩm có thumbnail trong bảng, click ảnh/tên mở trang chi tiết ở tab mới; tab "Sản phẩm" và tab "Đơn hàng" đều có ô tìm kiếm riêng (`.admin-search-bar`, dùng lại component `.search-box` sẵn có, có `oninput` debounce ngoài `onclick`/Enter) — sản phẩm tìm theo tên (`?ten=`), đơn hàng tách 2 ô riêng: mã đơn (`?maDon=`) và tên/email khách (`?q=`) để tránh trùng kết quả; tab "Đơn hàng" (xem tất cả đơn của mọi khách, tab trạng thái con hiện kèm số lượng, lọc theo trạng thái, đổi trạng thái ngay trong bảng — chuyển sang "Đã hủy" bắt buộc nhập lý do qua `showPrompt`, xem chi tiết kèm lý do hủy); tab "Thống kê" (tổng doanh thu từ đơn Hoàn thành, giá trị đơn trung bình, tổng sản phẩm tồn kho, số đơn theo từng trạng thái, doanh thu theo tháng/năm gần đây kèm biểu đồ cột CSS đơn giản có animation — tính toán hoàn toàn ở client từ dữ liệu `/api/don-hang` + `/api/san-pham` đã tải, không có API riêng); tab "Tin nhắn liên hệ" (xem/lọc lời nhắn từ trang Liên hệ theo trạng thái, đánh dấu đã/chưa xử lý, phân trang qua `/api/lien-he`)

Chưa có (Sprint 3 task 8): Dockerize toàn bộ hệ thống (Frontend Nginx + Backend Node.js + Database) — tạo `Dockerfile`/`docker-compose.yml` khi bắt đầu.
