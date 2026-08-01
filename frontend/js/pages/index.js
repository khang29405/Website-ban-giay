const productGrid = document.getElementById("product-grid");

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function isNewProduct(ngayTao) {
    if (!ngayTao) return false;
    const days = (Date.now() - new Date(ngayTao).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
}

function renderSkeletonCards(count) {
    productGrid.innerHTML = Array.from({ length: count })
        .map(
            () => `
        <div class="product-card product-card-skeleton">
            <div class="product-card-media"></div>
            <div class="product-card-body">
                <span class="skeleton-line skeleton-line-sm"></span>
                <span class="skeleton-line"></span>
                <span class="skeleton-line skeleton-line-sm"></span>
                <span class="skeleton-line skeleton-line-price"></span>
            </div>
        </div>
    `
        )
        .join("");
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <strong>Chưa có sản phẩm nào</strong>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = products
        .map((p) => {
            const media = p.HinhAnh
                ? `<img src="${escapeHtml(p.HinhAnh)}" alt="${escapeHtml(p.TenSP)}" loading="lazy">`
                : `<div class="product-card-noimg">Chưa có ảnh</div>`;
            const badge = !p.TrangThai
                ? `<span class="product-badge badge-off">Ngừng bán</span>`
                : isNewProduct(p.NgayTao)
                ? `<span class="product-badge badge-new">Mới</span>`
                : "";

            return `
                <a class="product-card" href="product-detail.html?id=${p.MaSP}">
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
            `;
        })
        .join("");
}

async function loadFeaturedProducts() {
    renderSkeletonCards(8);
    try {
        const products = await apiGet("/san-pham");
        const featured = products
            .slice()
            .sort((a, b) => new Date(b.NgayTao) - new Date(a.NgayTao))
            .slice(0, 8);
        renderProducts(featured);
    } catch (err) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được sản phẩm</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
    }
}

loadFeaturedProducts();
