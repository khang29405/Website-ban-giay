const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const brandFilter = document.getElementById("brand-filter");
const brandStrip = document.getElementById("brand-strip");

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <strong>Không tìm thấy sản phẩm phù hợp</strong>
                <p>Thử đổi từ khóa hoặc bộ lọc khác xem sao.</p>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = products
        .map((p) => {
            const media = p.HinhAnh
                ? `<img src="${escapeHtml(p.HinhAnh)}" alt="${escapeHtml(p.TenSP)}" loading="lazy">`
                : `<div class="product-card-noimg">Chưa có ảnh</div>`;
            const badge = !p.TrangThai ? `<span class="product-badge badge-off">Ngừng bán</span>` : "";

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

async function loadFilterOptions() {
    try {
        const [categories, brands] = await Promise.all([apiGet("/danh-muc"), apiGet("/thuong-hieu")]);

        categoryFilter.innerHTML =
            '<option value="">Tất cả danh mục</option>' +
            categories.map((c) => `<option value="${c.MaDM}">${escapeHtml(c.TenDanhMuc)}</option>`).join("");

        brandFilter.innerHTML =
            '<option value="">Tất cả thương hiệu</option>' +
            brands.map((b) => `<option value="${b.MaTH}">${escapeHtml(b.TenThuongHieu)}</option>`).join("");

        if (brandStrip) {
            brandStrip.innerHTML = brands
                .map((b) => `<button type="button" class="brand-pill" data-brand-id="${b.MaTH}">${escapeHtml(b.TenThuongHieu)}</button>`)
                .join("");

            brandStrip.querySelectorAll(".brand-pill").forEach((btn) => {
                btn.addEventListener("click", () => {
                    brandFilter.value = btn.dataset.brandId;
                    loadProducts();
                    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
                });
            });
        }
    } catch (err) {
        console.error("Không tải được danh mục/thương hiệu:", err.message);
    }
}

async function loadProducts() {
    productGrid.innerHTML = `<div class="empty-state"><strong>Đang tải sản phẩm...</strong></div>`;
    try {
        const products = await apiGet("/san-pham", {
            ten: searchInput.value.trim(),
            danhMuc: categoryFilter.value,
            thuongHieu: brandFilter.value,
        });
        renderProducts(products);
    } catch (err) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được sản phẩm</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
    }
}

let searchDebounce;
searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadProducts, 350);
});
categoryFilter.addEventListener("change", loadProducts);
brandFilter.addEventListener("change", loadProducts);

loadFilterOptions();
loadProducts();
