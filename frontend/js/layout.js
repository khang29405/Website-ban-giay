function renderHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    const user = getCurrentUser();
    const actionsHtml = user
        ? `
            <span class="user-greeting">Xin chào, ${escapeHtml(user.HoTen || user.Email)}</span>
            <button type="button" id="logout-btn" class="btn btn-outline">Đăng xuất</button>
          `
        : `
            <a href="login.html" class="btn btn-outline">Đăng nhập</a>
            <a href="register.html" class="btn btn-accent">Đăng ký</a>
          `;

    header.className = "site-header";
    header.innerHTML = `
        <div class="container">
            <a href="index.html" class="brand">
                My<span>Shoes</span>
            </a>

            <ul class="main-menu">
                <li><a href="index.html">Trang chủ</a></li>
                <li><a href="index.html#catalog">Sản phẩm</a></li>
            </ul>

            <div class="header-actions">
                ${actionsHtml}
            </div>
        </div>
    `;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearAuth();
            window.location.href = "index.html";
        });
    }
}

function renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;

    footer.className = "site-footer";
    footer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4>MyShoes</h4>
                    <p>Website bán giày thể thao chính hãng — Nike, Adidas, Puma, Converse, Vans và nhiều thương hiệu khác.</p>
                </div>
                <div>
                    <h4>Liên kết</h4>
                    <ul>
                        <li><a href="index.html">Trang chủ</a></li>
                        <li><a href="index.html#catalog">Sản phẩm</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Liên hệ</h4>
                    <ul>
                        <li><a href="mailto:support@myshoes.local">support@myshoes.local</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                © ${new Date().getFullYear()} MyShoes. Đồ án Công nghệ phần mềm.
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
});
