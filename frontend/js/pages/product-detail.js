const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const detailContainer = document.getElementById("product-detail");

let variants = [];
let selectedSize = null;
let selectedColor = null;

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function uniqueValues(list, key) {
    return [...new Set(list.map((v) => v[key]))];
}

function findVariant(size, color) {
    return variants.find((v) => v.KichCo === size && v.MauSac === color) || null;
}

function availableColorsForSize(size) {
    return new Set(variants.filter((v) => v.KichCo === size).map((v) => v.MauSac));
}

function availableSizesForColor(color) {
    return new Set(variants.filter((v) => v.MauSac === color).map((v) => v.KichCo));
}

function renderStock() {
    const stockBox = document.getElementById("pd-stock");
    if (!stockBox) return;

    if (!selectedSize || !selectedColor) {
        stockBox.className = "pd-stock";
        stockBox.textContent = "Chọn kích cỡ và màu sắc để xem tồn kho";
        return;
    }

    const variant = findVariant(selectedSize, selectedColor);
    if (!variant) {
        stockBox.className = "pd-stock out";
        stockBox.textContent = "Không có sẵn với lựa chọn này";
        return;
    }

    if (variant.SoLuongTon <= 0) {
        stockBox.className = "pd-stock out";
        stockBox.textContent = "Hết hàng";
        return;
    }

    stockBox.className = "pd-stock ok";
    stockBox.textContent = `Còn ${variant.SoLuongTon} sản phẩm`;
}

function renderChips() {
    const sizes = uniqueValues(variants, "KichCo");
    const colors = uniqueValues(variants, "MauSac");

    const validSizes = selectedColor ? availableSizesForColor(selectedColor) : null;
    const validColors = selectedSize ? availableColorsForSize(selectedSize) : null;

    const sizeChips = document.getElementById("size-chips");
    const colorChips = document.getElementById("color-chips");
    if (!sizeChips || !colorChips) return;

    sizeChips.innerHTML = sizes
        .map((s) => {
            const disabled = validSizes && !validSizes.has(s);
            const active = s === selectedSize;
            return `<button type="button" class="pd-chip${active ? " active" : ""}" data-size="${escapeHtml(s)}" ${disabled ? "disabled" : ""}>${escapeHtml(s)}</button>`;
        })
        .join("");

    colorChips.innerHTML = colors
        .map((c) => {
            const disabled = validColors && !validColors.has(c);
            const active = c === selectedColor;
            return `<button type="button" class="pd-chip${active ? " active" : ""}" data-color="${escapeHtml(c)}" ${disabled ? "disabled" : ""}>${escapeHtml(c)}</button>`;
        })
        .join("");

    sizeChips.querySelectorAll(".pd-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedSize = btn.dataset.size;
            renderChips();
            renderStock();
        });
    });

    colorChips.querySelectorAll(".pd-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedColor = btn.dataset.color;
            renderChips();
            renderStock();
        });
    });
}

function renderProduct(product) {
    const media = product.HinhAnh
        ? `<img src="${escapeHtml(product.HinhAnh)}" alt="${escapeHtml(product.TenSP)}">`
        : `<div class="product-card-noimg">Chưa có ảnh</div>`;
    const badge = !product.TrangThai ? `<span class="product-badge badge-off">Ngừng bán</span>` : "";

    detailContainer.innerHTML = `
        <div class="pd-layout fade-in">
            <div class="pd-media">
                ${badge}
                ${media}
            </div>
            <div class="pd-info">
                <span class="product-brand">${escapeHtml(product.TenThuongHieu)}</span>
                <h1>${escapeHtml(product.TenSP)}</h1>
                <span class="product-category">${escapeHtml(product.TenDanhMuc)}</span>
                <div class="pd-price">${formatCurrency(product.Gia)}</div>
                <p class="pd-desc">${escapeHtml(product.MoTa || "Chưa có mô tả cho sản phẩm này.")}</p>

                <div class="pd-option-group">
                    <span class="pd-option-label">Kích cỡ</span>
                    <div class="pd-chips" id="size-chips"></div>
                </div>
                <div class="pd-option-group">
                    <span class="pd-option-label">Màu sắc</span>
                    <div class="pd-chips" id="color-chips"></div>
                </div>

                <div class="pd-stock" id="pd-stock">Chọn kích cỡ và màu sắc để xem tồn kho</div>
            </div>
        </div>
    `;

    renderChips();
}

async function loadProductDetail() {
    if (!productId) {
        detailContainer.innerHTML = `<div class="empty-state"><strong>Thiếu mã sản phẩm</strong></div>`;
        return;
    }

    try {
        const [product, variantList] = await Promise.all([
            apiGet(`/san-pham/${productId}`),
            apiGet(`/san-pham/${productId}/bien-the`),
        ]);
        variants = variantList;
        renderProduct(product);
    } catch (err) {
        detailContainer.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được sản phẩm</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
    }
}

loadProductDetail();
