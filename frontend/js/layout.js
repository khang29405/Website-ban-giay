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
            <a href="register.html" class="btn btn-primary">Đăng ký</a>
          `;

    header.className = "site-header";
    header.innerHTML = `
        <div class="container">
            <a href="index.html" class="brand">
                <span class="brand-mark">👟</span>
                <span>ShoeStore</span>
            </a>

            <ul class="main-menu">
                <li><a href="index.html">Trang chủ</a></li>
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
                    <h4>ShoeStore</h4>
                    <p>Website bán giày thể thao chính hãng.</p>
                </div>
                <div>
                    <h4>Liên kết</h4>
                    <ul>
                        <li><a href="index.html">Trang chủ</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Liên hệ</h4>
                    <ul>
                        <li><a href="mailto:support@shoestore.local">support@shoestore.local</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                © ${new Date().getFullYear()} ShoeStore. Đồ án Công nghệ phần mềm.
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
});
