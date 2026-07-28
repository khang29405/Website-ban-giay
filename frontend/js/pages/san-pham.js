const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const sortButtons = document.querySelectorAll(".sort-btn");
const categoryList = document.getElementById("category-filter-list");
const brandList = document.getElementById("brand-filter-list");

const urlParams = new URLSearchParams(window.location.search);

let categoriesData = [];
let brandsData = [];
let selectedCategory = urlParams.get("danhMuc") || "";
let selectedBrand = urlParams.get("thuongHieu") || "";
let selectedSort = "";

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function isNewProduct(ngayTao) {
    if (!ngayTao) return false;
    const days = (Date.now() - new Date(ngayTao).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = `
            <div class="empty-state">
                ${emptyStateIcon()}
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

function renderCategoryList() {
    categoryList.innerHTML =
        `<li><button type="button" class="filter-list-item${selectedCategory === "" ? " active" : ""}" data-value="">Tất cả danh mục</button></li>` +
        categoriesData
            .map((c) => {
                const value = String(c.MaDM);
                const active = selectedCategory === value ? " active" : "";
                return `<li><button type="button" class="filter-list-item${active}" data-value="${value}">${escapeHtml(c.TenDanhMuc)}</button></li>`;
            })
            .join("");

    categoryList.querySelectorAll(".filter-list-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedCategory = btn.dataset.value;
            renderCategoryList();
            loadProducts();
        });
    });
}

function renderBrandList() {
    brandList.innerHTML =
        `<li><button type="button" class="filter-list-item${selectedBrand === "" ? " active" : ""}" data-value="">Tất cả thương hiệu</button></li>` +
        brandsData
            .map((b) => {
                const value = String(b.MaTH);
                const active = selectedBrand === value ? " active" : "";
                return `<li><button type="button" class="filter-list-item${active}" data-value="${value}">${escapeHtml(b.TenThuongHieu)}</button></li>`;
            })
            .join("");

    brandList.querySelectorAll(".filter-list-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedBrand = btn.dataset.value;
            renderBrandList();
            loadProducts();
        });
    });
}

async function loadFilterOptions() {
    try {
        const [categories, brands] = await Promise.all([apiGet("/danh-muc"), apiGet("/thuong-hieu")]);
        categoriesData = categories;
        brandsData = brands;
        renderCategoryList();
        renderBrandList();
    } catch (err) {
        console.error("Không tải được danh mục/thương hiệu:", err.message);
    }
}

async function loadProducts() {
    productGrid.innerHTML = `<div class="empty-state"><strong>Đang tải sản phẩm...</strong></div>`;
    try {
        const products = await apiGet("/san-pham", {
            ten: searchInput.value.trim(),
            danhMuc: selectedCategory,
            thuongHieu: selectedBrand,
            sapXep: selectedSort,
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

searchBtn.addEventListener("click", loadProducts);
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        loadProducts();
    }
});

sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.sort;
        selectedSort = selectedSort === value ? "" : value;
        sortButtons.forEach((b) => b.classList.toggle("active", b.dataset.sort === selectedSort));
        loadProducts();
    });
});

loadFilterOptions();
loadProducts();
