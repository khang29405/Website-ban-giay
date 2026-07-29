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
let currentPage = 1;
const PAGE_SIZE = 12;

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
            currentPage = 1;
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
            currentPage = 1;
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
        renderActiveFilters();
    } catch (err) {
        console.error("Không tải được danh mục/thương hiệu:", err.message);
    }
}

function findCategoryName(id) {
    const found = categoriesData.find((c) => String(c.MaDM) === id);
    return found ? found.TenDanhMuc : "";
}

function findBrandName(id) {
    const found = brandsData.find((b) => String(b.MaTH) === id);
    return found ? found.TenThuongHieu : "";
}

function renderActiveFilters() {
    const chips = [];
    const searchValue = searchInput.value.trim();

    if (searchValue) {
        chips.push({ label: `Tìm: "${searchValue}"`, clear: () => (searchInput.value = "") });
    }
    if (selectedCategory) {
        chips.push({ label: findCategoryName(selectedCategory), clear: () => (selectedCategory = "") });
    }
    if (selectedBrand) {
        chips.push({ label: findBrandName(selectedBrand), clear: () => (selectedBrand = "") });
    }
    if (selectedSort) {
        chips.push({
            label: selectedSort === "gia_tang" ? "Giá tăng dần" : "Giá giảm dần",
            clear: () => (selectedSort = ""),
        });
    }

    const container = document.getElementById("active-filters");
    if (!chips.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML =
        chips
            .map(
                (chip, i) =>
                    `<button type="button" class="filter-chip" data-chip="${i}">${escapeHtml(chip.label)} <i class="fa-solid fa-xmark"></i></button>`
            )
            .join("") + `<button type="button" class="filter-chip-clear" id="clear-all-filters">Xóa tất cả</button>`;

    container.querySelectorAll("[data-chip]").forEach((btn) => {
        btn.addEventListener("click", () => {
            chips[Number(btn.dataset.chip)].clear();
            currentPage = 1;
            renderCategoryList();
            renderBrandList();
            sortButtons.forEach((b) => b.classList.toggle("active", b.dataset.sort === selectedSort));
            loadProducts();
        });
    });
    document.getElementById("clear-all-filters").addEventListener("click", () => {
        searchInput.value = "";
        selectedCategory = "";
        selectedBrand = "";
        selectedSort = "";
        currentPage = 1;
        renderCategoryList();
        renderBrandList();
        sortButtons.forEach((b) => b.classList.remove("active"));
        loadProducts();
    });
}

async function loadProducts() {
    renderSkeletonCards(PAGE_SIZE);
    try {
        const { items, pagination } = await apiGetPaged("/san-pham", {
            ten: searchInput.value.trim(),
            danhMuc: selectedCategory,
            thuongHieu: selectedBrand,
            sapXep: selectedSort,
            page: currentPage,
            limit: PAGE_SIZE,
        });
        renderProducts(items);
        renderPagination(document.getElementById("product-pagination"), pagination, (page) => {
            currentPage = page;
            loadProducts();
            document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        document.getElementById("catalog-result-count").textContent = pagination
            ? `Hiển thị ${items.length} trong tổng số ${pagination.total} sản phẩm`
            : `${items.length} sản phẩm`;
        renderActiveFilters();
    } catch (err) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được sản phẩm</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
        document.getElementById("catalog-result-count").textContent = "";
    }
}

function runProductSearch() {
    currentPage = 1;
    loadProducts();
}

searchBtn.addEventListener("click", runProductSearch);
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        runProductSearch();
    }
});
searchInput.addEventListener("input", debounce(runProductSearch));

sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.sort;
        selectedSort = selectedSort === value ? "" : value;
        sortButtons.forEach((b) => b.classList.toggle("active", b.dataset.sort === selectedSort));
        currentPage = 1;
        loadProducts();
    });
});

loadFilterOptions();
loadProducts();
