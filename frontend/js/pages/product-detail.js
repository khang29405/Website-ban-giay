const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const detailContainer = document.getElementById("product-detail");

let variants = [];
let selectedSize = null;
let selectedColor = null;
let lastChangedAxis = null;
// So luong da them vao gio trong phien nay theo tung bien the - "Them vao gio hang"
// KHONG tru ton kho that (chi tru khi dat hang thanh cong, xem donHangModel.js), nen
// dung de canh bao "da co X trong gio" thay vi gia vo ton kho that da giam.
let cartQtyByVariant = {};

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function uniqueValues(list, key) {
    return [...new Set(list.map((v) => v[key]))];
}

// Phan hoi truc quan tren chinh nut "Them vao gio hang" trong vai giay,
// bo sung cho toast + badge da co san
function flashAddedToCart(btn) {
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add("btn-added");
    btn.innerHTML = `<i class="fa-solid fa-check"></i> Đã thêm`;
    setTimeout(() => {
        btn.classList.remove("btn-added");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }, 1200);
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

    const inCart = cartQtyByVariant[variant.MaBienThe] || 0;
    const conLaiDeThem = variant.SoLuongTon - inCart;
    const ghiChuGio = inCart > 0 ? ` (đã có ${inCart} trong giỏ hàng)` : "";

    if (conLaiDeThem <= 0) {
        stockBox.className = "pd-stock out";
        stockBox.textContent = `Bạn đã thêm hết ${variant.SoLuongTon} sản phẩm còn lại vào giỏ hàng`;
        return;
    }

    if (variant.SoLuongTon <= 5) {
        stockBox.className = "pd-stock low";
        stockBox.textContent = `Chỉ còn ${variant.SoLuongTon} đôi - sắp hết hàng!${ghiChuGio}`;
        return;
    }

    stockBox.className = "pd-stock ok";
    stockBox.textContent = `Còn ${variant.SoLuongTon} sản phẩm${ghiChuGio}`;
}

function updateAddToCartState() {
    const qtyInput = document.getElementById("pd-qty-input");
    if (!qtyInput) return;

    const variant = selectedSize && selectedColor ? findVariant(selectedSize, selectedColor) : null;
    const inCart = variant ? cartQtyByVariant[variant.MaBienThe] || 0 : 0;
    const conLaiDeThem = variant ? variant.SoLuongTon - inCart : 0;
    const inStock = !!variant && conLaiDeThem > 0;

    qtyInput.max = inStock ? conLaiDeThem : 1;
    if (Number(qtyInput.value) > Number(qtyInput.max)) {
        qtyInput.value = qtyInput.max;
    }
}

function renderChips() {
    const sizes = uniqueValues(variants, "KichCo");
    const colors = uniqueValues(variants, "MauSac");

    // Chi loc theo truc con lai duoc chon GAN NHAT, tranh 2 truc tu khoa lan nhau
    // khi 1 san pham co cap size-mau 1-1 (chon xong ca 2 thi khong bam lai duoc truc nao).
    const validSizes = lastChangedAxis === "color" && selectedColor ? availableSizesForColor(selectedColor) : null;
    const validColors = lastChangedAxis === "size" && selectedSize ? availableColorsForSize(selectedSize) : null;

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
            lastChangedAxis = "size";
            renderChips();
            renderStock();
            updateAddToCartState();
        });
    });

    colorChips.querySelectorAll(".pd-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedColor = btn.dataset.color;
            lastChangedAxis = "color";
            renderChips();
            renderStock();
            updateAddToCartState();
        });
    });
}

function renderProduct(product) {
    const media = product.HinhAnh
        ? `<img src="${escapeHtml(product.HinhAnh)}" alt="${escapeHtml(product.TenSP)}">`
        : `<div class="product-card-noimg">Chưa có ảnh</div>`;
    const badge = !product.TrangThai ? `<span class="product-badge badge-off">Ngừng bán</span>` : "";
    const user = getCurrentUser();
    const isAdmin = !!user && user.VaiTro === "Admin";

    detailContainer.innerHTML = `
        <div class="pd-layout">
            <div class="pd-media${product.HinhAnh ? " pd-media-zoomable" : ""}" id="pd-media">
                ${badge}
                ${media}
                ${product.HinhAnh ? `<span class="pd-media-zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Xem ảnh lớn</span>` : ""}
            </div>
            <div class="pd-info">
                <span class="product-brand">${escapeHtml(product.TenThuongHieu)}</span>
                <h1>${escapeHtml(product.TenSP)}</h1>
                <span class="product-category">${escapeHtml(product.TenDanhMuc)}</span>
                <div class="pd-price">${formatCurrency(product.Gia)}</div>
                <button type="button" class="pd-share-btn" id="share-btn"><i class="fa-solid fa-share-nodes"></i> Chia sẻ sản phẩm</button>
                <p class="pd-desc">${escapeHtml(product.MoTa || "Chưa có mô tả cho sản phẩm này.")}</p>

                <div class="pd-option-group">
                    <div class="pd-option-header">
                        <span class="pd-option-label">Kích cỡ</span>
                        <button type="button" class="pd-size-guide-btn" id="size-guide-btn">Hướng dẫn chọn size</button>
                    </div>
                    <div class="pd-chips" id="size-chips"></div>
                </div>
                <div class="pd-option-group">
                    <span class="pd-option-label">Màu sắc</span>
                    <div class="pd-chips" id="color-chips"></div>
                </div>

                <div class="pd-stock" id="pd-stock">Chọn kích cỡ và màu sắc để xem tồn kho</div>

                <div class="pd-add-cart">
                    ${
                        isAdmin
                            ? `<p class="pd-admin-notice"><i class="fa-solid fa-circle-info"></i> Tài khoản quản trị không thể thêm vào giỏ hàng hoặc đặt hàng.</p>`
                            : user
                            ? `
                        <div class="qty-control">
                            <button type="button" class="qty-btn" id="qty-minus">−</button>
                            <input type="number" class="qty-input" id="pd-qty-input" value="1" min="1">
                            <button type="button" class="qty-btn" id="qty-plus">+</button>
                        </div>
                        <button type="button" class="btn btn-outline" id="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng</button>
                        <button type="button" class="btn btn-accent" id="buy-now-btn"><i class="fa-solid fa-bolt"></i> Mua ngay</button>
                    `
                            : `<a href="login.html" class="btn btn-accent"><i class="fa-solid fa-right-to-bracket"></i> Đăng nhập để mua hàng</a>`
                    }
                </div>

                <ul class="pd-trust-mini">
                    <li><span class="pd-trust-icon"><i class="fa-solid fa-circle-check"></i></span><span>Hàng chính hãng 100%</span></li>
                    <li><span class="pd-trust-icon"><i class="fa-solid fa-truck"></i></span><span>Giao hàng toàn quốc</span></li>
                    <li><span class="pd-trust-icon"><i class="fa-solid fa-rotate"></i></span><span>Đổi trả trong 7 ngày</span></li>
                </ul>
            </div>
        </div>
    `;

    const breadcrumb = document.getElementById("pd-breadcrumb");
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="index.html">Trang chủ</a>
            <span>/</span>
            <a href="san-pham.html">Sản phẩm</a>
            <span>/</span>
            <a href="san-pham.html?danhMuc=${product.MaDM}">${escapeHtml(product.TenDanhMuc)}</a>
            <span>/</span>
            <span>${escapeHtml(product.TenSP)}</span>
        `;
    }

    renderChips();
    updateAddToCartState();

    const qtyMinus = document.getElementById("qty-minus");
    const qtyPlus = document.getElementById("qty-plus");
    const qtyInput = document.getElementById("pd-qty-input");
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const buyNowBtn = document.getElementById("buy-now-btn");

    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener("click", () => {
            qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
        });
        qtyPlus.addEventListener("click", () => {
            const max = Number(qtyInput.max) || 999;
            qtyInput.value = Math.min(max, Number(qtyInput.value) + 1);
        });
    }

    function getValidSelectedVariant() {
        if (!selectedSize && !selectedColor) {
            showToast("Vui lòng chọn kích cỡ và màu sắc", "error");
            return null;
        }
        if (!selectedSize) {
            showToast("Vui lòng chọn kích cỡ", "error");
            return null;
        }
        if (!selectedColor) {
            showToast("Vui lòng chọn màu sắc", "error");
            return null;
        }

        const variant = findVariant(selectedSize, selectedColor);
        if (!variant || variant.SoLuongTon <= 0) {
            showToast("Sản phẩm đã hết hàng với lựa chọn này", "error");
            return null;
        }

        const inCart = cartQtyByVariant[variant.MaBienThe] || 0;
        if (inCart >= variant.SoLuongTon) {
            showToast("Bạn đã thêm hết số lượng còn lại của lựa chọn này vào giỏ hàng", "error");
            return null;
        }

        return variant;
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", async () => {
            const variant = getValidSelectedVariant();
            if (!variant) return;

            const soLuong = Number(qtyInput.value) || 1;
            const daCoTrongGio = cartQtyByVariant[variant.MaBienThe] || 0;
            const conLaiDeThem = variant.SoLuongTon - daCoTrongGio;
            if (soLuong > conLaiDeThem) {
                showToast(
                    `Chỉ còn ${variant.SoLuongTon} sản phẩm trong kho, bạn đã có ${daCoTrongGio} trong giỏ hàng (thêm được tối đa ${conLaiDeThem} nữa)`,
                    "error"
                );
                return;
            }

            try {
                await apiPost("/gio-hang", { MaBienThe: variant.MaBienThe, SoLuong: soLuong });
                showToast("Đã thêm vào giỏ hàng", "success");
                updateCartBadge();
                flashAddedToCart(addToCartBtn);

                cartQtyByVariant[variant.MaBienThe] = (cartQtyByVariant[variant.MaBienThe] || 0) + soLuong;
                renderStock();
                updateAddToCartState();
            } catch (err) {
                showToast(err.message, "error");
            }
        });
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
            const variant = getValidSelectedVariant();
            if (!variant) return;

            const soLuong = Number(qtyInput.value) || 1;
            openCheckoutModal({ MaBienThe: variant.MaBienThe, SoLuong: soLuong });
        });
    }

    const pdMedia = document.getElementById("pd-media");
    if (pdMedia && product.HinhAnh) {
        pdMedia.addEventListener("click", () => {
            openModal(
                `
                <div class="pd-zoom-img-wrap">
                    <button type="button" class="pd-zoom-close" onclick="closeModal()" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>
                    <img src="${escapeHtml(product.HinhAnh)}" alt="${escapeHtml(product.TenSP)}" class="pd-zoom-img">
                </div>
            `,
                "modal-box-image"
            );
        });
    }

    const shareBtn = document.getElementById("share-btn");
    if (shareBtn) {
        shareBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast("Đã sao chép liên kết sản phẩm", "success");
            } catch (err) {
                showToast("Không thể sao chép liên kết", "error");
            }
        });
    }

    const sizeGuideBtn = document.getElementById("size-guide-btn");
    if (sizeGuideBtn) {
        sizeGuideBtn.addEventListener("click", openSizeGuideModal);
    }
}

function openSizeGuideModal() {
    openModal(`
        <h3>Hướng dẫn chọn size</h3>
        <table class="size-guide-table">
            <thead>
                <tr><th>EU</th><th>US</th><th>UK</th><th>Chân dài (cm)</th></tr>
            </thead>
            <tbody>
                <tr><td>38.5</td><td>6</td><td>5.5</td><td>24.0</td></tr>
                <tr><td>39</td><td>6.5</td><td>6</td><td>24.5</td></tr>
                <tr><td>40</td><td>7</td><td>6</td><td>25.0</td></tr>
                <tr><td>40.5</td><td>7.5</td><td>6.5</td><td>25.5</td></tr>
                <tr><td>41</td><td>8</td><td>7</td><td>26.0</td></tr>
                <tr><td>42</td><td>8.5</td><td>7.5</td><td>26.5</td></tr>
                <tr><td>42.5</td><td>9</td><td>8</td><td>27.0</td></tr>
                <tr><td>43</td><td>9.5</td><td>8.5</td><td>27.5</td></tr>
                <tr><td>44</td><td>10</td><td>9</td><td>28.0</td></tr>
                <tr><td>45</td><td>11</td><td>10</td><td>29.0</td></tr>
            </tbody>
        </table>
        <p class="size-guide-tip">Số liệu tham khảo theo bảng size Nike. Mỗi thương hiệu có thể chênh lệch nhẹ — nên đo chân vào cuối ngày, cộng thêm 0.5–1cm để chọn size thoải mái.</p>
        <div class="modal-actions">
            <button type="button" class="btn btn-accent" onclick="closeModal()"><i class="fa-solid fa-check"></i> Đã hiểu</button>
        </div>
    `);
}

function renderRelatedProducts(products, sectionId, gridId) {
    const section = document.getElementById(sectionId);
    const grid = document.getElementById(gridId);
    if (!section || !grid) return;

    if (!products.length) {
        section.hidden = true;
        return;
    }

    grid.innerHTML = products
        .map((p) => {
            const media = p.HinhAnh
                ? `<img src="${escapeHtml(p.HinhAnh)}" alt="${escapeHtml(p.TenSP)}" loading="lazy">`
                : `<div class="product-card-noimg">Chưa có ảnh</div>`;

            return `
                <a class="product-card" href="product-detail.html?id=${p.MaSP}">
                    <div class="product-card-media">
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

    section.hidden = false;
}

async function loadRelatedByCategory(product) {
    try {
        const products = await apiGet("/san-pham", { danhMuc: product.MaDM });
        const related = products.filter((p) => p.MaSP !== product.MaSP).slice(0, 4);
        renderRelatedProducts(related, "pd-related", "related-products");
    } catch (err) {
        console.error("Không tải được sản phẩm cùng danh mục:", err.message);
    }
}

async function loadRelatedByBrand(product) {
    try {
        const products = await apiGet("/san-pham", { thuongHieu: product.MaTH });
        const related = products.filter((p) => p.MaSP !== product.MaSP).slice(0, 4);
        renderRelatedProducts(related, "pd-related-brand", "related-products-brand");
    } catch (err) {
        console.error("Không tải được sản phẩm cùng thương hiệu:", err.message);
    }
}

function renderProductSkeleton() {
    detailContainer.innerHTML = `
        <div class="pd-layout">
            <div class="pd-media">
                <div class="product-card-media"></div>
            </div>
            <div class="pd-info">
                <span class="skeleton-line skeleton-line-sm" style="width:90px"></span>
                <span class="skeleton-line" style="width:70%;height:26px;margin-top:6px"></span>
                <span class="skeleton-line skeleton-line-sm" style="width:110px"></span>
                <span class="skeleton-line skeleton-line-price" style="width:150px;height:24px;margin:10px 0"></span>
                <span class="skeleton-line" style="width:100%"></span>
                <span class="skeleton-line" style="width:85%"></span>
                <span class="skeleton-line" style="width:40%;height:36px;margin-top:16px"></span>
            </div>
        </div>
    `;
}

async function loadProductDetail() {
    if (!productId) {
        detailContainer.innerHTML = `<div class="empty-state"><strong>Thiếu mã sản phẩm</strong></div>`;
        return;
    }

    renderProductSkeleton();

    try {
        const [product, variantList] = await Promise.all([
            apiGet(`/san-pham/${productId}`),
            apiGet(`/san-pham/${productId}/bien-the`),
        ]);
        variants = variantList;
        renderProduct(product);
        loadRelatedByCategory(product);
        loadRelatedByBrand(product);
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
