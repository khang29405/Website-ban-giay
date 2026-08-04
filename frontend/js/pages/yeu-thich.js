const favoritesGuest = document.getElementById("favorites-guest");
const favoritesContent = document.getElementById("favorites-content");
const favoritesGrid = document.getElementById("favorites-grid");

async function loadFavorites() {
    favoritesGrid.innerHTML = `<div class="empty-state"><strong>Đang tải...</strong></div>`;
    try {
        const list = await apiGet("/yeu-thich");
        favoriteIds = new Set(list.map((it) => it.MaSP));

        if (!list.length) {
            favoritesGrid.innerHTML = `
                <div class="empty-state">
                    ${emptyStateIcon()}
                    <strong>Bạn chưa yêu thích sản phẩm nào</strong>
                    <p><a href="san-pham.html" class="btn btn-accent"><i class="fa-solid fa-store"></i> Khám phá sản phẩm</a></p>
                </div>
            `;
            return;
        }

        favoritesGrid.innerHTML = list.map((it) => productCardHtml(it)).join("");
    } catch (err) {
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được danh sách yêu thích</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
    }
}

// Bo yeu thich ngay tren trang nay thi tai lai danh sach de card bien mat luon,
// khong can nguoi dung tu F5.
document.addEventListener("favorite-toggled", (e) => {
    if (!e.detail.active) loadFavorites();
});

const currentUser = getCurrentUser();
if (currentUser && (currentUser.VaiTro === "Admin" || currentUser.VaiTro === "NhanVien")) {
    window.location.href = "index.html";
} else if (currentUser) {
    favoritesGuest.hidden = true;
    favoritesContent.hidden = false;
    loadFavorites();
} else {
    favoritesGuest.hidden = false;
    favoritesContent.hidden = true;
}
