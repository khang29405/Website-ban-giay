// Dung chung cho moi noi hien thi card san pham (trang chu, danh sach san pham, san pham
// lien quan, trang yeu thich). Phai load SAU auth.js/api.js va TRUOC cac js/pages/*.js.

let favoriteIds = new Set();

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function isNewProduct(ngayTao) {
    if (!ngayTao) return false;
    const days = (Date.now() - new Date(ngayTao).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
}

// Goi 1 lan luc vao trang (truoc khi render card) de biet san pham nao dang duoc
// nguoi dung hien tai yeu thich. Khach chua dang nhap thi coi nhu danh sach rong.
async function loadFavoriteIds() {
    if (!getCurrentUser()) {
        favoriteIds = new Set();
        return favoriteIds;
    }
    try {
        const list = await apiGet("/yeu-thich");
        favoriteIds = new Set(list.map((it) => it.MaSP));
    } catch {
        favoriteIds = new Set();
    }
    return favoriteIds;
}

// Nhan vien/Admin khong mua sam nen cung khong dung yeu thich (giong cach cart/orders
// da an voi 2 vai tro nay o cac trang khac).
function isStaffUser() {
    const user = getCurrentUser();
    return !!user && (user.VaiTro === "Admin" || user.VaiTro === "NhanVien");
}

function productCardHtml(p, { showBadge = true } = {}) {
    const media = p.HinhAnh
        ? `<img src="${escapeHtml(p.HinhAnh)}" alt="${escapeHtml(p.TenSP)}" loading="lazy">`
        : `<div class="product-card-noimg">Chưa có ảnh</div>`;
    const badge = !showBadge
        ? ""
        : !p.TrangThai
        ? `<span class="product-badge badge-off">Ngừng bán</span>`
        : isNewProduct(p.NgayTao)
        ? `<span class="product-badge badge-new">Mới</span>`
        : "";
    const isFav = favoriteIds.has(Number(p.MaSP));
    const favBtn = isStaffUser()
        ? ""
        : `<button type="button" class="product-card-fav-btn${isFav ? " active" : ""}" aria-label="${isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}" onclick="toggleFavorite(event, ${p.MaSP})">
                <i class="fa-${isFav ? "solid" : "regular"} fa-heart"></i>
            </button>`;

    return `
        <div class="product-card">
            <a class="product-card-link" href="product-detail.html?id=${p.MaSP}">
                <div class="product-card-media">
                    ${badge}
                    ${media}
                    <span class="product-card-view">Xem chi tiết →</span>
                </div>
                <div class="product-card-body">
                    <span class="product-brand">${escapeHtml(p.TenThuongHieu)}</span>
                    <span class="product-name">${escapeHtml(p.TenSP)}</span>
                    <span class="product-category">${escapeHtml(p.TenDanhMuc)}</span>
                    <span class="product-price">${formatCurrency(p.Gia)}</span>
                </div>
            </a>
            ${favBtn}
        </div>
    `;
}

// Dung o nut tim trai o card lan nut rieng o trang chi tiet san pham (product-detail.js).
// Bat su kien "favorite-toggled" tren document de cac trang khac (vd trang Yeu thich cua
// toi) tu cap nhat lai danh sach ma khong can goi lai API.
async function toggleFavorite(event, maSp) {
    event.preventDefault();
    event.stopPropagation();

    if (!getCurrentUser()) {
        window.location.href = "login.html";
        return;
    }

    const btn = event.currentTarget;
    const icon = btn.querySelector("i");
    const wasActive = btn.classList.contains("active");

    try {
        if (wasActive) {
            await apiDelete(`/yeu-thich/${maSp}`);
            favoriteIds.delete(Number(maSp));
        } else {
            await apiPost("/yeu-thich", { MaSP: Number(maSp) });
            favoriteIds.add(Number(maSp));
        }
        btn.classList.toggle("active", !wasActive);
        icon.className = !wasActive ? "fa-solid fa-heart" : "fa-regular fa-heart";
        btn.setAttribute("aria-label", !wasActive ? "Bỏ yêu thích" : "Thêm vào yêu thích");
        const label = btn.querySelector("span");
        if (label) label.textContent = !wasActive ? "Đã yêu thích" : "Yêu thích";
        document.dispatchEvent(new CustomEvent("favorite-toggled", { detail: { maSp: Number(maSp), active: !wasActive } }));
    } catch (err) {
        showToast(err.message || "Có lỗi xảy ra, vui lòng thử lại", "error");
    }
}
