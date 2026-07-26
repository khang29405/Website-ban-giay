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
                <span class="brand-mark">M</span>
                <span class="brand-word">My<span class="brand-accent">Shoes</span></span>
            </a>

            <ul class="main-menu">
                <li><a href="index.html">Trang chủ</a></li>
                <li><a href="index.html#catalog">Sản phẩm</a></li>
                ${user && user.VaiTro === "Admin" ? '<li><a href="admin.html">Quản trị</a></li>' : ""}
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

// ============ Toast (thong bao khong chan thao tac) ============
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-out");
        setTimeout(() => toast.remove(), 200);
    }, 3200);
}

// ============ Confirm (thay the window.confirm mac dinh cua trinh duyet) ============
function showConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.innerHTML = `
            <div class="confirm-box">
                <p class="confirm-message"></p>
                <div class="confirm-actions">
                    <button type="button" class="btn btn-ghost" data-action="cancel">Hủy</button>
                    <button type="button" class="btn btn-accent" data-action="ok">Xác nhận</button>
                </div>
            </div>
        `;
        overlay.querySelector(".confirm-message").textContent = message;
        document.body.appendChild(overlay);

        function finish(result) {
            overlay.remove();
            resolve(result);
        }

        overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => finish(false));
        overlay.querySelector('[data-action="ok"]').addEventListener("click", () => finish(true));
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) finish(false);
        });
    });
}
