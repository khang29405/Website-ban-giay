// Dung cho cac o tim kiem/loc: cho go xong (het thoi gian delay) moi goi API,
// tranh goi lien tuc theo tung phim bam.
function debounce(fn, delay = 350) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Chi doi CACH HIEN THI ma (VD: SP0001, DH0029) - khoa chinh trong DB va moi cho
// goi API/onclick/href van dung so goc, khong lien quan gi den ham nay.
function formatId(prefix, id, digits = 4) {
    return `${prefix}${String(id).padStart(digits, "0")}`;
}

function emptyStateIcon() {
    return `
        <svg class="empty-state-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 24L16 8H48L56 24" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
            <rect x="8" y="24" width="48" height="28" rx="4" stroke="currentColor" stroke-width="2.5"/>
            <path d="M24 24V30C24 33.3137 26.6863 36 30 36H34C37.3137 36 40 33.3137 40 30V24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `;
}

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0][0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
}

// ============ Che do sang/toi (mac dinh toi, luu lua chon vao localStorage) ============
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const icon = document.querySelector("#theme-toggle-btn i");
    if (icon) {
        icon.className = theme === "dark" ? "fa-regular fa-lightbulb" : "fa-solid fa-lightbulb";
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || window.DEFAULT_THEME;
    applyTheme(current === "dark" ? "light" : "dark");
}

function renderHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    const user = getCurrentUser();
    const isStaff = !!user && (user.VaiTro === "Admin" || user.VaiTro === "NhanVien");
    const actionsHtml = user
        ? `
            ${
                isStaff
                    ? `<a href="admin.html" class="btn btn-outline admin-link"><i class="fa-solid fa-user-shield"></i> <span class="btn-label">Quản trị</span></a>`
                    : `<a href="cart.html" class="cart-link" id="cart-link">
                <i class="fa-solid fa-cart-shopping"></i>
                <span class="cart-badge" id="cart-badge" hidden>0</span>
            </a>`
            }
            <div class="user-menu" id="user-menu">
                <button type="button" class="avatar-btn" id="avatar-btn" aria-haspopup="true" aria-expanded="false">
                    <span class="user-greeting">Xin chào, ${escapeHtml(user.HoTen || user.Email)}</span>
                    <span class="avatar-circle">${getInitials(user.HoTen || user.Email)}</span>
                    <i class="fa-solid fa-chevron-down avatar-caret"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown" hidden>
                    <div class="user-dropdown-info">
                        <strong>${escapeHtml(user.HoTen || "")}</strong>
                        <span>${escapeHtml(user.Email || "")}</span>
                    </div>
                    ${
                        isStaff
                            ? ""
                            : `<a href="orders.html" class="user-dropdown-item"><i class="fa-solid fa-box"></i> Đơn hàng của tôi</a>
                               <a href="yeu-thich.html" class="user-dropdown-item"><i class="fa-solid fa-heart"></i> Sản phẩm yêu thích</a>`
                    }
                    <button type="button" class="user-dropdown-item" id="view-profile-btn"><i class="fa-solid fa-user"></i> Xem thông tin</button>
                    <button type="button" class="user-dropdown-item" id="edit-profile-btn"><i class="fa-solid fa-user-pen"></i> Chỉnh sửa thông tin</button>
                    <button type="button" class="user-dropdown-item" id="change-password-btn"><i class="fa-solid fa-key"></i> Đổi mật khẩu</button>
                    <button type="button" class="user-dropdown-item danger" id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
                </div>
            </div>
          `
        : `
            <a href="login.html" class="btn btn-outline"><i class="fa-solid fa-right-to-bracket"></i> <span class="btn-label">Đăng nhập</span></a>
            <a href="register.html" class="btn btn-accent"><i class="fa-solid fa-user-plus"></i> <span class="btn-label">Đăng ký</span></a>
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
                <li><a href="san-pham.html">Sản phẩm</a></li>
                <li><a href="about.html">Giới thiệu</a></li>
                <li><a href="contact.html">Liên hệ</a></li>
            </ul>

            <div class="header-actions">
                <button type="button" class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Chuyển chế độ sáng/tối" title="Chuyển chế độ sáng/tối">
                    <i class="fa-regular fa-lightbulb"></i>
                </button>
                ${actionsHtml}
                <button type="button" class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Mở menu" aria-expanded="false">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
        </div>
    `;

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        const currentTheme = document.documentElement.getAttribute("data-theme") || window.DEFAULT_THEME;
        themeToggleBtn.querySelector("i").className = currentTheme === "dark" ? "fa-regular fa-lightbulb" : "fa-solid fa-lightbulb";
        themeToggleBtn.addEventListener("click", toggleTheme);
    }

    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mainMenu = header.querySelector(".main-menu");
    if (mobileMenuToggle && mainMenu) {
        const closeMobileMenu = () => {
            mainMenu.classList.remove("mobile-open");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
            mobileMenuToggle.querySelector("i").className = "fa-solid fa-bars";
        };
        mobileMenuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mainMenu.classList.toggle("mobile-open");
            mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
            mobileMenuToggle.querySelector("i").className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
        });
        mainMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });
        document.addEventListener("click", (e) => {
            if (mainMenu.classList.contains("mobile-open") && !mainMenu.contains(e.target) && e.target !== mobileMenuToggle) {
                closeMobileMenu();
            }
        });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearAuth();
            window.location.href = "index.html";
        });
    }

    if (user) {
        updateCartBadge();
    }

    const avatarBtn = document.getElementById("avatar-btn");
    const userDropdown = document.getElementById("user-dropdown");
    if (avatarBtn && userDropdown) {
        avatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = !userDropdown.hidden;
            userDropdown.hidden = isOpen;
            avatarBtn.setAttribute("aria-expanded", String(!isOpen));
        });
    }

    const viewProfileBtn = document.getElementById("view-profile-btn");
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener("click", async () => {
            userDropdown.hidden = true;
            try {
                const freshUser = await apiGet("/auth/me");
                openViewProfileModal(freshUser);
            } catch (err) {
                showToast(err.message, "error");
            }
        });
    }

    const editProfileBtn = document.getElementById("edit-profile-btn");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", async () => {
            userDropdown.hidden = true;
            try {
                const freshUser = await apiGet("/auth/me");
                openEditProfileModal(freshUser);
            } catch (err) {
                showToast(err.message, "error");
            }
        });
    }

    const changePasswordBtn = document.getElementById("change-password-btn");
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", () => {
            userDropdown.hidden = true;
            openChangePasswordModal();
        });
    }
}

function validateChangePasswordForm(form) {
    clearFormErrors(form);
    let valid = true;

    if (!form.MatKhauCu.value) {
        showFieldError(form.MatKhauCu, "Vui lòng nhập mật khẩu hiện tại");
        valid = false;
    }

    const matKhauMoi = form.MatKhauMoi.value;
    if (!matKhauMoi) {
        showFieldError(form.MatKhauMoi, "Vui lòng nhập mật khẩu mới");
        valid = false;
    } else {
        const unmetRule = firstUnmetPasswordRule(matKhauMoi);
        if (unmetRule) {
            showFieldError(form.MatKhauMoi, `Mật khẩu mới chưa đáp ứng: ${unmetRule.label}`);
            valid = false;
        }
    }

    const xacNhan = form.XacNhanMatKhauMoi.value;
    if (!xacNhan) {
        showFieldError(form.XacNhanMatKhauMoi, "Vui lòng xác nhận mật khẩu mới");
        valid = false;
    } else if (xacNhan !== matKhauMoi) {
        showFieldError(form.XacNhanMatKhauMoi, "Xác nhận mật khẩu mới không khớp");
        valid = false;
    }

    return valid;
}

function openChangePasswordModal() {
    openModal(`
        <h3>Đổi mật khẩu</h3>
        <div id="password-error" class="form-error" hidden></div>
        <form id="change-password-form" novalidate>
            <div class="form-group">
                <label>Mật khẩu hiện tại</label>
                <div class="password-input-wrap">
                    <input type="password" name="MatKhauCu" id="old-password-input">
                    <button type="button" class="password-toggle-btn" id="old-password-toggle-btn" aria-label="Hiện mật khẩu">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <div class="form-label-row">
                    <label>Mật khẩu mới</label>
                    <div class="password-hint-wrap">
                        <button type="button" class="password-hint-btn" aria-label="Yêu cầu mật khẩu">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                        <div class="password-hint-tooltip" id="password-hint-tooltip"></div>
                    </div>
                </div>
                <div class="password-input-wrap">
                    <input type="password" name="MatKhauMoi" id="new-password-input">
                    <button type="button" class="password-toggle-btn" id="new-password-toggle-btn" aria-label="Hiện mật khẩu">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
                <div class="password-live-hint" id="password-live-hint" hidden></div>
            </div>
            <div class="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <div class="password-input-wrap">
                    <input type="password" name="XacNhanMatKhauMoi" id="confirm-new-password-input">
                    <button type="button" class="password-toggle-btn" id="confirm-new-password-toggle-btn" aria-label="Hiện mật khẩu">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()"><i class="fa-solid fa-xmark"></i> Hủy</button>
                <button type="submit" class="btn btn-accent"><i class="fa-solid fa-key"></i> Đổi mật khẩu</button>
            </div>
        </form>
    `);

    const changePasswordForm = document.getElementById("change-password-form");
    attachLiveValidation(changePasswordForm, "password-error");
    renderPasswordChecklist(document.getElementById("password-hint-tooltip"));
    initPasswordLiveHint(document.getElementById("new-password-input"), document.getElementById("password-live-hint"));
    initPasswordToggle(document.getElementById("old-password-input"), document.getElementById("old-password-toggle-btn"));
    initPasswordToggle(document.getElementById("new-password-input"), document.getElementById("new-password-toggle-btn"));
    initPasswordToggle(document.getElementById("confirm-new-password-input"), document.getElementById("confirm-new-password-toggle-btn"));

    changePasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("password-error");
        errorBox.hidden = true;
        const form = e.target;
        if (!validateChangePasswordForm(form)) return;
        const MatKhauMoi = form.MatKhauMoi.value;
        try {
            await apiPut("/auth/change-password", { MatKhauCu: form.MatKhauCu.value, MatKhauMoi });
            closeModal();
            showToast("Đổi mật khẩu thành công", "success");
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
        }
    });
}

function validateProfileForm(form) {
    clearFormErrors(form);
    let valid = true;

    const hoTen = form.HoTen.value.trim();
    if (!hoTen) {
        showFieldError(form.HoTen, "Vui lòng nhập họ tên");
        valid = false;
    } else if (hoTen.length > 100) {
        showFieldError(form.HoTen, "Họ tên tối đa 100 ký tự");
        valid = false;
    }

    const sdt = form.SDT.value.trim();
    if (sdt && !isValidPhoneVN(sdt)) {
        showFieldError(form.SDT, "Số điện thoại không hợp lệ");
        valid = false;
    }

    const diaChi = form.DiaChi.value.trim();
    if (diaChi.length > 255) {
        showFieldError(form.DiaChi, "Địa chỉ tối đa 255 ký tự");
        valid = false;
    }

    return valid;
}

function openViewProfileModal(user) {
    const ngayTao = user.NgayTao ? new Date(user.NgayTao).toLocaleDateString("vi-VN") : "—";

    openModal(`
        <h3>Thông tin tài khoản</h3>
        <div class="profile-view">
            <div class="profile-view-row"><span>Họ tên</span><strong>${escapeHtml(user.HoTen || "—")}</strong></div>
            <div class="profile-view-row"><span>Email</span><strong>${escapeHtml(user.Email || "—")}</strong></div>
            <div class="profile-view-row"><span>Số điện thoại</span><strong>${escapeHtml(user.SDT || "Chưa cập nhật")}</strong></div>
            <div class="profile-view-row"><span>Địa chỉ</span><strong>${escapeHtml(user.DiaChi || "Chưa cập nhật")}</strong></div>
            <div class="profile-view-row"><span>Vai trò</span><strong>${
                user.VaiTro === "Admin" ? "Quản trị viên" : user.VaiTro === "NhanVien" ? "Nhân viên" : "Khách hàng"
            }</strong></div>
            <div class="profile-view-row"><span>Ngày tạo tài khoản</span><strong>${ngayTao}</strong></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal()"><i class="fa-solid fa-xmark"></i> Đóng</button>
            <button type="button" class="btn btn-accent" id="go-edit-profile-btn"><i class="fa-solid fa-user-pen"></i> Chỉnh sửa</button>
        </div>
    `);

    document.getElementById("go-edit-profile-btn").addEventListener("click", () => {
        openEditProfileModal(user);
    });
}

function openEditProfileModal(user) {
    openModal(`
        <h3>Chỉnh sửa thông tin</h3>
        <div id="profile-error" class="form-error" hidden></div>
        <form id="profile-edit-form" novalidate>
            <div class="form-group">
                <label>Họ tên</label>
                <input type="text" name="HoTen" value="${escapeHtml(user.HoTen || "")}" maxlength="100">
            </div>
            <div class="form-group">
                <label>Số điện thoại</label>
                <input type="text" name="SDT" value="${escapeHtml(user.SDT || "")}">
            </div>
            <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" name="DiaChi" value="${escapeHtml(user.DiaChi || "")}">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()"><i class="fa-solid fa-xmark"></i> Hủy</button>
                <button type="submit" class="btn btn-accent"><i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>
            </div>
        </form>
    `);

    const profileForm = document.getElementById("profile-edit-form");
    attachLiveValidation(profileForm, "profile-error");

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("profile-error");
        errorBox.hidden = true;
        const form = e.target;
        if (!validateProfileForm(form)) return;
        const data = {
            HoTen: form.HoTen.value.trim(),
            SDT: form.SDT.value.trim() || undefined,
            DiaChi: form.DiaChi.value.trim() || undefined,
        };
        try {
            const updated = await apiPut("/auth/me", data);
            setAuth(null, updated);
            closeModal();
            showToast("Cập nhật thông tin thành công", "success");
            renderHeader();
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
        }
    });
}

function renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;
    if (window.location.pathname.endsWith("admin.html")) return;

    footer.className = "site-footer";
    footer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4>MyShoes</h4>
                    <p>Cửa hàng giày chính hãng — Nike, Adidas, Puma, Converse, Vans. Cam kết hàng thật, giá đúng, giao nhanh toàn quốc.</p>
                </div>
                <div>
                    <h4>Liên kết</h4>
                    <ul>
                        <li><a href="index.html">Trang chủ</a></li>
                        <li><a href="san-pham.html">Sản phẩm</a></li>
                        <li><a href="about.html">Giới thiệu</a></li>
                        <li><a href="contact.html">Liên hệ</a></li>
                        <li><a href="cart.html">Giỏ hàng</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Liên hệ</h4>
                    <ul>
                        <li>126 Nguyễn Thiện Thành, P. Trà Vinh, Vĩnh Long</li>
                        <li><a href="tel:0974714067">0974 714 067</a></li>
                        <li><a href="mailto:support@myshoes.local">support@myshoes.local</a></li>
                        <li>8:00 - 21:00 tất cả các ngày</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                © ${new Date().getFullYear()} MyShoes. Đã đăng ký bản quyền.
            </div>
        </div>
    `;
}

// ============ Nut lien he noi (fixed) o goc duoi ben trai - dung chung moi trang ============
function renderFloatingContact() {
    if (document.getElementById("floating-contact")) return;
    if (window.location.pathname.endsWith("admin.html")) return;

    const wrap = document.createElement("div");
    wrap.id = "floating-contact";
    wrap.className = "contact-floating-actions";
    wrap.innerHTML = `
        <a href="https://zalo.me/0974714067" target="_blank" rel="noopener" class="floating-contact-btn floating-contact-zalo" aria-label="Chat Zalo">
            <i class="fa-solid fa-comment-dots"></i>
            <span class="floating-contact-tooltip">Chat Zalo</span>
        </a>
        <a href="tel:0974714067" class="floating-contact-btn floating-contact-call" aria-label="Gọi ngay 0974 714 067">
            <i class="fa-solid fa-phone"></i>
            <span class="floating-contact-tooltip">Gọi ngay: 0974 714 067</span>
        </a>
    `;
    document.body.appendChild(wrap);
}

document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    renderFloatingContact();
});

// ============ Cart badge (dung chung moi trang, goi lai sau khi sua gio hang) ============
async function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    try {
        const items = await apiGet("/gio-hang");
        const count = items.reduce((sum, item) => sum + item.SoLuong, 0);
        if (count > 0) {
            badge.textContent = count > 99 ? "99+" : count;
            badge.hidden = false;
            badge.classList.remove("cart-badge-bump");
            void badge.offsetWidth;
            badge.classList.add("cart-badge-bump");
        } else {
            badge.hidden = true;
        }
    } catch (err) {
        badge.hidden = true;
    }
}

document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("user-dropdown");
    const menu = document.getElementById("user-menu");
    if (dropdown && !dropdown.hidden && menu && !menu.contains(e.target)) {
        dropdown.hidden = true;
        const btn = document.getElementById("avatar-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
    }
});

// ============ Checkout (dung chung: giỏ hàng + nut "Mua ngay" o trang chi tiet san pham) ============
function validateCheckoutForm(form) {
    clearFormErrors(form);
    let valid = true;

    const diaChi = form.DiaChiGiaoHang.value.trim();
    if (!diaChi) {
        showFieldError(form.DiaChiGiaoHang, "Vui lòng nhập địa chỉ giao hàng");
        valid = false;
    } else if (diaChi.length > 255) {
        showFieldError(form.DiaChiGiaoHang, "Địa chỉ tối đa 255 ký tự");
        valid = false;
    }

    const sdt = form.SDTNhan.value.trim();
    if (!sdt) {
        showFieldError(form.SDTNhan, "Vui lòng nhập số điện thoại nhận hàng");
        valid = false;
    } else if (!isValidPhoneVN(sdt)) {
        showFieldError(form.SDTNhan, "Số điện thoại không hợp lệ");
        valid = false;
    }

    return valid;
}

async function openCheckoutModal(directItem) {
    let profile = {};
    try {
        profile = await apiGet("/auth/me");
    } catch (err) {
        // Khong lay duoc thong tin ca nhan, de trong cho nguoi dung tu nhap
    }

    openModal(`
        <h3>${directItem ? "Mua ngay" : "Xác nhận đặt hàng"}</h3>
        <div id="checkout-error" class="form-error" hidden></div>
        <form id="checkout-form" novalidate>
            <div class="form-row">
                <div class="form-group">
                    <label>Địa chỉ giao hàng</label>
                    <input type="text" name="DiaChiGiaoHang" value="${escapeHtml(profile.DiaChi || "")}" placeholder="VD: 123 Nguyễn Trãi, Q1, TP.HCM" maxlength="255">
                </div>
                <div class="form-group">
                    <label>Số điện thoại nhận hàng</label>
                    <input type="text" name="SDTNhan" value="${escapeHtml(profile.SDT || "")}" placeholder="VD: 0901234567">
                </div>
            </div>

            <div class="form-group">
                <label>Phương thức thanh toán</label>
                <div class="payment-methods">
                    <label class="payment-method">
                        <input type="radio" name="PhuongThucTT" value="COD" checked>
                        <span class="payment-method-icon"><i class="fa-solid fa-money-bill-wave"></i></span>
                        <span class="payment-method-info">
                            <strong>Thanh toán khi nhận hàng (COD)</strong>
                            <span>Trả tiền mặt cho người giao hàng</span>
                        </span>
                    </label>
                    <label class="payment-method is-disabled">
                        <input type="radio" name="PhuongThucTT" value="ChuyenKhoan" disabled>
                        <span class="payment-method-icon"><i class="fa-solid fa-building-columns"></i></span>
                        <span class="payment-method-info">
                            <strong>Chuyển khoản ngân hàng</strong>
                            <span>Sắp ra mắt</span>
                        </span>
                    </label>
                    <label class="payment-method is-disabled">
                        <input type="radio" name="PhuongThucTT" value="ViDienTu" disabled>
                        <span class="payment-method-icon"><i class="fa-solid fa-wallet"></i></span>
                        <span class="payment-method-info">
                            <strong>Ví điện tử (Momo, ZaloPay...)</strong>
                            <span>Sắp ra mắt</span>
                        </span>
                    </label>
                </div>
            </div>

            <p class="checkout-note">Đơn hàng chỉ được tạo sau khi bạn bấm "Đặt hàng" — bấm Hủy sẽ không có gì thay đổi.</p>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()"><i class="fa-solid fa-xmark"></i> Hủy</button>
                <button type="submit" class="btn btn-accent"><i class="fa-solid fa-check"></i> Đặt hàng</button>
            </div>
        </form>
    `, "modal-box-wide");

    const form = document.getElementById("checkout-form");
    attachLiveValidation(form, "checkout-error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("checkout-error");
        errorBox.hidden = true;
        if (!validateCheckoutForm(form)) return;

        const data = {
            DiaChiGiaoHang: form.DiaChiGiaoHang.value.trim(),
            SDTNhan: form.SDTNhan.value.trim(),
        };

        const endpoint = directItem ? "/don-hang/mua-ngay" : "/don-hang";
        if (directItem) {
            data.MaBienThe = directItem.MaBienThe;
            data.SoLuong = directItem.SoLuong;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            await apiPost(endpoint, data);
            closeModal();
            showToast("Đặt hàng thành công!", "success");
            updateCartBadge();
            setTimeout(() => {
                window.location.href = "orders.html";
            }, 800);
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
            submitBtn.disabled = false;
        }
    });
}

// ============ Phan trang (dung chung cho danh sach san pham/don hang) ============
function renderPagination(container, pagination, onPageChange) {
    if (!container) return;
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    const { page, totalPages } = pagination;
    container.innerHTML = `
        <button type="button" class="pagination-btn" data-action="prev" ${page <= 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-left"></i> Trước</button>
        <span class="pagination-info">Trang ${page} / ${totalPages}</span>
        <button type="button" class="pagination-btn" data-action="next" ${page >= totalPages ? "disabled" : ""}>Sau <i class="fa-solid fa-chevron-right"></i></button>
    `;

    container.querySelector('[data-action="prev"]').addEventListener("click", () => onPageChange(page - 1));
    container.querySelector('[data-action="next"]').addEventListener("click", () => onPageChange(page + 1));
}

// ============ Toast (thong bao khong chan thao tac) ============
const MAX_TOASTS = 1;

const TOAST_ICONS = {
    success: "fa-solid fa-check",
    error: "fa-solid fa-xmark",
    info: "fa-solid fa-info",
};

function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const existing = container.querySelectorAll(".toast:not(.toast-out)");
    if (existing.length >= MAX_TOASTS) {
        existing[0].classList.add("toast-out");
        setTimeout(() => existing[0].remove(), 200);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i class="${TOAST_ICONS[type] || TOAST_ICONS.info}"></i></span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <span class="toast-progress"></span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-out");
        setTimeout(() => toast.remove(), 200);
    }, 2000);
}

// ============ Modal (dung chung cho moi trang) ============
function getModalOverlay() {
    let overlay = document.getElementById("modal-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "modal-overlay";
        overlay.className = "modal-overlay";
        overlay.hidden = true;
        overlay.innerHTML = '<div class="modal-box" id="modal-box"></div>';
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });
    }
    return overlay;
}

function openModal(html, extraClass) {
    const overlay = getModalOverlay();
    const box = document.getElementById("modal-box");
    box.innerHTML = html;
    box.className = extraClass ? `modal-box ${extraClass}` : "modal-box";
    overlay.hidden = false;
}

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) {
        overlay.hidden = true;
        const box = document.getElementById("modal-box");
        box.innerHTML = "";
        box.className = "modal-box";
    }
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
                    <button type="button" class="btn btn-ghost" data-action="cancel"><i class="fa-solid fa-xmark"></i> Hủy</button>
                    <button type="button" class="btn btn-accent" data-action="ok"><i class="fa-solid fa-check"></i> Xác nhận</button>
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

// ============ Prompt (nhap 1 dong text bat buoc, vd: ly do huy don) ============
function showPrompt(message, { placeholder = "", okText = "Xác nhận" } = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.innerHTML = `
            <div class="confirm-box">
                <p class="confirm-message"></p>
                <textarea class="confirm-prompt-input" rows="3" maxlength="255" placeholder="${escapeHtml(placeholder)}"></textarea>
                <p class="confirm-prompt-error" hidden>Vui lòng nhập nội dung</p>
                <div class="confirm-actions">
                    <button type="button" class="btn btn-ghost" data-action="cancel"><i class="fa-solid fa-xmark"></i> Hủy</button>
                    <button type="button" class="btn btn-accent" data-action="ok"><i class="fa-solid fa-check"></i> ${escapeHtml(okText)}</button>
                </div>
            </div>
        `;
        overlay.querySelector(".confirm-message").textContent = message;
        document.body.appendChild(overlay);

        const input = overlay.querySelector(".confirm-prompt-input");
        const errorEl = overlay.querySelector(".confirm-prompt-error");
        input.focus();

        function finish(result) {
            overlay.remove();
            resolve(result);
        }

        overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => finish(null));
        overlay.querySelector('[data-action="ok"]').addEventListener("click", () => {
            const value = input.value.trim();
            if (!value) {
                errorEl.hidden = false;
                input.focus();
                return;
            }
            finish(value);
        });
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) finish(null);
        });
    });
}
