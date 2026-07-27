async function loadAboutStats() {
    const statsEl = document.getElementById("about-stats");
    if (!statsEl) return;
    try {
        const [categories, brands, products] = await Promise.all([
            apiGet("/danh-muc"),
            apiGet("/thuong-hieu"),
            apiGet("/san-pham"),
        ]);
        statsEl.innerHTML = `
            <div class="about-stat"><strong>${products.length}+</strong><span>Mẫu giày đang bán</span></div>
            <div class="about-stat"><strong>${brands.length}</strong><span>Thương hiệu chính hãng</span></div>
            <div class="about-stat"><strong>${categories.length}</strong><span>Danh mục sản phẩm</span></div>
        `;
    } catch (err) {
        statsEl.innerHTML = "";
        console.error("Không tải được số liệu:", err.message);
    }
}

async function loadAboutBrands() {
    const brandStripEl = document.getElementById("about-brand-strip");
    if (!brandStripEl) return;
    try {
        const brands = await apiGet("/thuong-hieu");
        brandStripEl.innerHTML = brands
            .map((b) => `<a href="san-pham.html?thuongHieu=${b.MaTH}" class="about-brand-pill">${escapeHtml(b.TenThuongHieu)}</a>`)
            .join("");
    } catch (err) {
        console.error("Không tải được thương hiệu:", err.message);
    }
}

loadAboutStats();
loadAboutBrands();
