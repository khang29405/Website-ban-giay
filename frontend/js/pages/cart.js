const cartGuest = document.getElementById("cart-guest");
const cartContent = document.getElementById("cart-content");
const cartItemsEl = document.getElementById("cart-items");
const cartSummaryItemsEl = document.getElementById("cart-summary-items");
const cartTotalQtyEl = document.getElementById("cart-total-qty");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function renderCartSummary(items) {
    cartSummaryItemsEl.innerHTML = items
        .map(
            (item) => `
        <div class="cart-summary-item">
            <span class="cart-summary-item-name">
                ${escapeHtml(item.TenSP)} <span class="cart-summary-item-variant">(${escapeHtml(item.KichCo)}, ${escapeHtml(item.MauSac)})</span>
                <span class="cart-summary-item-unitprice">${formatCurrency(item.Gia)} × ${item.SoLuong}</span>
            </span>
            <span class="cart-summary-item-subtotal">${formatCurrency(item.Gia * item.SoLuong)}</span>
        </div>
    `
        )
        .join("");

    const totalQty = items.reduce((sum, item) => sum + item.SoLuong, 0);
    cartTotalQtyEl.textContent = totalQty;
}

function renderCartItems(items) {
    if (!items.length) {
        cartItemsEl.innerHTML = `
            <div class="empty-state">
                ${emptyStateIcon()}
                <strong>Giỏ hàng của bạn đang trống</strong>
                <p><a href="san-pham.html" class="btn btn-outline"><i class="fa-solid fa-store"></i> Tiếp tục mua sắm</a></p>
            </div>
        `;
        cartSummaryItemsEl.innerHTML = "";
        cartTotalQtyEl.textContent = "0";
        cartTotalEl.textContent = formatCurrency(0);
        updateCheckoutState(false);
        return;
    }

    cartItemsEl.innerHTML = items
        .map((item) => {
            const media = item.HinhAnh
                ? `<img src="${escapeHtml(item.HinhAnh)}" alt="${escapeHtml(item.TenSP)}">`
                : `<div class="product-card-noimg">Chưa có ảnh</div>`;
            const subtotal = item.Gia * item.SoLuong;

            return `
                <div class="cart-item" data-id="${item.MaGioHang}" data-stock="${item.SoLuongTon}">
                    <a class="cart-item-link" href="product-detail.html?id=${item.MaSP}">
                        <div class="cart-item-media">${media}</div>
                        <div class="cart-item-info">
                            <span class="cart-item-name">${escapeHtml(item.TenSP)}</span>
                            <span class="cart-item-variant">Size ${escapeHtml(item.KichCo)} · ${escapeHtml(item.MauSac)}</span>
                            <span class="cart-item-price">${formatCurrency(item.Gia)} / đôi</span>
                        </div>
                    </a>
                    <div class="qty-control">
                        <button type="button" class="qty-btn" data-action="minus">−</button>
                        <input type="number" class="qty-input" value="${item.SoLuong}" min="1" max="${item.SoLuongTon}">
                        <button type="button" class="qty-btn" data-action="plus">+</button>
                    </div>
                    <div class="cart-item-subtotal">${formatCurrency(subtotal)}</div>
                    <button type="button" class="cart-item-remove" title="Xóa"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        })
        .join("");

    const total = items.reduce((sum, item) => sum + item.Gia * item.SoLuong, 0);
    cartTotalEl.textContent = formatCurrency(total);
    renderCartSummary(items);

    updateCheckoutState(true);
    wireCartItemEvents();
}

function updateCheckoutState(hasItems) {
    if (checkoutBtn) checkoutBtn.disabled = !hasItems;
}

function renderCartSkeleton(count = 3) {
    cartItemsEl.innerHTML = Array.from({ length: count })
        .map(
            () => `
        <div class="cart-item cart-item-skeleton">
            <div class="cart-item-media"></div>
            <div class="cart-item-info">
                <span class="skeleton-line skeleton-line-sm"></span>
                <span class="skeleton-line"></span>
                <span class="skeleton-line skeleton-line-sm"></span>
            </div>
        </div>
    `
        )
        .join("");
    cartSummaryItemsEl.innerHTML = "";
}

async function loadCart() {
    renderCartSkeleton();
    try {
        const items = await apiGet("/gio-hang");
        renderCartItems(items);
    } catch (err) {
        cartItemsEl.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được giỏ hàng</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
    }
}

async function updateItemQuantity(id, soLuong) {
    try {
        await apiPut(`/gio-hang/${id}`, { SoLuong: soLuong });
        await loadCart();
        updateCartBadge();
    } catch (err) {
        showToast(err.message, "error");
        loadCart();
    }
}

async function removeItem(id) {
    if (!(await showConfirm("Xóa sản phẩm này khỏi giỏ hàng?"))) return;
    try {
        await apiDelete(`/gio-hang/${id}`);
        showToast("Đã xóa khỏi giỏ hàng", "success");
        await loadCart();
        updateCartBadge();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function wireCartItemEvents() {
    cartItemsEl.querySelectorAll(".cart-item").forEach((row) => {
        const id = row.dataset.id;
        const maxStock = Number(row.dataset.stock);
        const qtyInput = row.querySelector(".qty-input");
        const minusBtn = row.querySelector('[data-action="minus"]');
        const plusBtn = row.querySelector('[data-action="plus"]');
        const removeBtn = row.querySelector(".cart-item-remove");

        minusBtn.addEventListener("click", () => {
            const next = Math.max(1, Number(qtyInput.value) - 1);
            if (next === Number(qtyInput.value)) return;
            updateItemQuantity(id, next);
        });

        plusBtn.addEventListener("click", () => {
            const next = Math.min(maxStock, Number(qtyInput.value) + 1);
            if (next === Number(qtyInput.value)) return;
            updateItemQuantity(id, next);
        });

        qtyInput.addEventListener("change", () => {
            let next = Number(qtyInput.value);
            if (!next || next < 1) next = 1;
            if (next > maxStock) next = maxStock;
            updateItemQuantity(id, next);
        });

        removeBtn.addEventListener("click", () => removeItem(id));
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        openCheckoutModal();
    });
}

const currentUser = getCurrentUser();
if (currentUser && (currentUser.VaiTro === "Admin" || currentUser.VaiTro === "NhanVien")) {
    window.location.href = "index.html";
} else if (currentUser) {
    cartGuest.hidden = true;
    cartContent.hidden = false;
    loadCart();
} else {
    cartGuest.hidden = false;
    cartContent.hidden = true;
}
