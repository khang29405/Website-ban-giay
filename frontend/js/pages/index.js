const productGrid = document.getElementById("product-grid");

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

    productGrid.innerHTML = products.map((p) => productCardHtml(p)).join("");
}

async function loadFeaturedProducts() {
    renderSkeletonCards(8);
    try {
        const [featured] = await Promise.all([apiGet("/san-pham/noi-bat", { limit: 8 }), loadFavoriteIds()]);
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
