function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// ============ Auth guard ============
const currentUser = getCurrentUser();
const isAdmin = !!currentUser && currentUser.VaiTro === "Admin";

document.getElementById("admin-root").hidden = !isAdmin;
document.getElementById("access-denied").hidden = isAdmin;

// ============ State ============
let danhMucList = [];
let thuongHieuList = [];
let sanPhamList = [];
let currentVariantProductId = null;
let currentVariantList = [];
let editingVariantId = null;

// ============ Danh mục ============
async function loadDanhMuc() {
    danhMucList = await apiGet("/danh-muc").catch(() => []);
    renderDanhMucTable();
}

function renderDanhMucTable() {
    const tbody = document.getElementById("table-danh-muc-body");
    tbody.innerHTML = danhMucList.length
        ? danhMucList
              .map(
                  (dm) => `
            <tr>
                <td>${dm.MaDM}</td>
                <td>${escapeHtml(dm.TenDanhMuc)}</td>
                <td class="admin-actions">
                    <button type="button" class="btn-link" onclick="openDanhMucForm(${dm.MaDM})">Sửa</button>
                    <button type="button" class="btn-link btn-link-danger" onclick="deleteDanhMuc(${dm.MaDM})">Xóa</button>
                </td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="3" class="admin-empty">Chưa có danh mục nào</td></tr>`;
}

function validateDanhMucForm(form) {
    clearFormErrors(form);
    let valid = true;

    const tenDanhMuc = form.TenDanhMuc.value.trim();
    if (!tenDanhMuc) {
        showFieldError(form.TenDanhMuc, "Vui lòng nhập tên danh mục");
        valid = false;
    } else if (tenDanhMuc.length > 100) {
        showFieldError(form.TenDanhMuc, "Tên danh mục tối đa 100 ký tự");
        valid = false;
    }

    return valid;
}

function openDanhMucForm(id) {
    const item = id ? danhMucList.find((d) => d.MaDM === id) : null;

    openModal(`
        <h3>${item ? "Sửa danh mục" : "Thêm danh mục"}</h3>
        <div id="modal-error" class="form-error" hidden></div>
        <form id="danh-muc-form" novalidate>
            <div class="form-group">
                <label>Tên danh mục</label>
                <input type="text" name="TenDanhMuc" value="${item ? escapeHtml(item.TenDanhMuc) : ""}" maxlength="100">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-accent">Lưu</button>
            </div>
        </form>
    `);

    const danhMucForm = document.getElementById("danh-muc-form");
    attachLiveValidation(danhMucForm, "modal-error");

    danhMucForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
        if (!validateDanhMucForm(e.target)) return;
        const TenDanhMuc = e.target.TenDanhMuc.value.trim();
        try {
            if (item) {
                await apiPut(`/danh-muc/${item.MaDM}`, { TenDanhMuc });
            } else {
                await apiPost("/danh-muc", { TenDanhMuc });
            }
            closeModal();
            loadDanhMuc();
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
        }
    });
}

async function deleteDanhMuc(id) {
    if (!(await showConfirm("Xóa danh mục này?"))) return;
    try {
        await apiDelete(`/danh-muc/${id}`);
        loadDanhMuc();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ============ Thương hiệu ============
async function loadThuongHieu() {
    thuongHieuList = await apiGet("/thuong-hieu").catch(() => []);
    renderThuongHieuTable();
}

function renderThuongHieuTable() {
    const tbody = document.getElementById("table-thuong-hieu-body");
    tbody.innerHTML = thuongHieuList.length
        ? thuongHieuList
              .map(
                  (th) => `
            <tr>
                <td>${th.MaTH}</td>
                <td>${escapeHtml(th.TenThuongHieu)}</td>
                <td class="admin-actions">
                    <button type="button" class="btn-link" onclick="openThuongHieuForm(${th.MaTH})">Sửa</button>
                    <button type="button" class="btn-link btn-link-danger" onclick="deleteThuongHieu(${th.MaTH})">Xóa</button>
                </td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="3" class="admin-empty">Chưa có thương hiệu nào</td></tr>`;
}

function validateThuongHieuForm(form) {
    clearFormErrors(form);
    let valid = true;

    const tenThuongHieu = form.TenThuongHieu.value.trim();
    if (!tenThuongHieu) {
        showFieldError(form.TenThuongHieu, "Vui lòng nhập tên thương hiệu");
        valid = false;
    } else if (tenThuongHieu.length > 100) {
        showFieldError(form.TenThuongHieu, "Tên thương hiệu tối đa 100 ký tự");
        valid = false;
    }

    return valid;
}

function openThuongHieuForm(id) {
    const item = id ? thuongHieuList.find((t) => t.MaTH === id) : null;

    openModal(`
        <h3>${item ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h3>
        <div id="modal-error" class="form-error" hidden></div>
        <form id="thuong-hieu-form" novalidate>
            <div class="form-group">
                <label>Tên thương hiệu</label>
                <input type="text" name="TenThuongHieu" value="${item ? escapeHtml(item.TenThuongHieu) : ""}" maxlength="100">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-accent">Lưu</button>
            </div>
        </form>
    `);

    const thuongHieuForm = document.getElementById("thuong-hieu-form");
    attachLiveValidation(thuongHieuForm, "modal-error");

    thuongHieuForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
        if (!validateThuongHieuForm(e.target)) return;
        const TenThuongHieu = e.target.TenThuongHieu.value.trim();
        try {
            if (item) {
                await apiPut(`/thuong-hieu/${item.MaTH}`, { TenThuongHieu });
            } else {
                await apiPost("/thuong-hieu", { TenThuongHieu });
            }
            closeModal();
            loadThuongHieu();
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
        }
    });
}

async function deleteThuongHieu(id) {
    if (!(await showConfirm("Xóa thương hiệu này?"))) return;
    try {
        await apiDelete(`/thuong-hieu/${id}`);
        loadThuongHieu();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ============ Sản phẩm ============
let stockByProduct = {};
let sanPhamPage = 1;
const SAN_PHAM_PAGE_SIZE = 10;

async function loadSanPham() {
    const { items, pagination } = await apiGetPaged("/san-pham", { page: sanPhamPage, limit: SAN_PHAM_PAGE_SIZE }).catch(
        () => ({ items: [], pagination: null })
    );
    if (!items.length && sanPhamPage > 1) {
        sanPhamPage -= 1;
        return loadSanPham();
    }
    sanPhamList = items;
    await loadStockSummary();
    renderSanPhamTable();
    renderPagination(document.getElementById("san-pham-pagination"), pagination, (page) => {
        sanPhamPage = page;
        loadSanPham();
    });
}

async function loadStockSummary() {
    stockByProduct = {};
    const results = await Promise.all(
        sanPhamList.map((sp) => apiGet(`/san-pham/${sp.MaSP}/bien-the`).catch(() => []))
    );
    sanPhamList.forEach((sp, i) => {
        stockByProduct[sp.MaSP] = results[i].reduce((sum, bt) => sum + bt.SoLuongTon, 0);
    });
}

function renderSanPhamTable() {
    const tbody = document.getElementById("table-san-pham-body");
    tbody.innerHTML = sanPhamList.length
        ? sanPhamList
              .map(
                  (sp) => `
            <tr>
                <td>${sp.MaSP}</td>
                <td>${escapeHtml(sp.TenSP)}</td>
                <td>${escapeHtml(sp.TenDanhMuc)}</td>
                <td>${escapeHtml(sp.TenThuongHieu)}</td>
                <td>${formatCurrency(sp.Gia)}</td>
                <td>${stockByProduct[sp.MaSP] > 0 ? stockByProduct[sp.MaSP] : '<span class="admin-status off">Hết hàng</span>'}</td>
                <td>${sp.TrangThai ? '<span class="admin-status ok">Đang bán</span>' : '<span class="admin-status off">Đã ẩn</span>'}</td>
                <td class="admin-actions">
                    <button type="button" class="btn-link" onclick="openSanPhamForm(${sp.MaSP})">Sửa</button>
                    <button type="button" class="btn-link" onclick="toggleTrangThai(${sp.MaSP}, ${sp.TrangThai ? "false" : "true"})">${sp.TrangThai ? "Ẩn" : "Hiện"}</button>
                    <button type="button" class="btn-link" onclick="openBienTheModal(${sp.MaSP})">Biến thể</button>
                    <button type="button" class="btn-link btn-link-danger" onclick="deleteSanPham(${sp.MaSP})">Xóa</button>
                </td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="8" class="admin-empty">Chưa có sản phẩm nào</td></tr>`;
}

function sanPhamOptionsHtml() {
    return {
        danhMuc: danhMucList.map((d) => `<option value="${d.MaDM}">${escapeHtml(d.TenDanhMuc)}</option>`).join(""),
        thuongHieu: thuongHieuList.map((t) => `<option value="${t.MaTH}">${escapeHtml(t.TenThuongHieu)}</option>`).join(""),
    };
}

function validateSanPhamForm(form) {
    clearFormErrors(form);
    let valid = true;

    const tenSP = form.TenSP.value.trim();
    if (!tenSP) {
        showFieldError(form.TenSP, "Vui lòng nhập tên sản phẩm");
        valid = false;
    } else if (tenSP.length > 200) {
        showFieldError(form.TenSP, "Tên sản phẩm tối đa 200 ký tự");
        valid = false;
    }

    const gia = form.Gia.value;
    if (gia === "") {
        showFieldError(form.Gia, "Vui lòng nhập giá");
        valid = false;
    } else if (Number(gia) < 0) {
        showFieldError(form.Gia, "Giá phải là số không âm");
        valid = false;
    }

    const hinhAnh = form.HinhAnh.value.trim();
    if (hinhAnh.length > 255) {
        showFieldError(form.HinhAnh, "Đường dẫn ảnh tối đa 255 ký tự");
        valid = false;
    }

    if (!form.MaDM.value) {
        showFieldError(form.MaDM, "Vui lòng chọn danh mục");
        valid = false;
    }

    if (!form.MaTH.value) {
        showFieldError(form.MaTH, "Vui lòng chọn thương hiệu");
        valid = false;
    }

    return valid;
}

function openSanPhamForm(id) {
    const item = id ? sanPhamList.find((s) => s.MaSP === id) : null;
    const opts = sanPhamOptionsHtml();

    openModal(`
        <h3>${item ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <div id="modal-error" class="form-error" hidden></div>
        <form id="san-pham-form" novalidate>
            <div class="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" name="TenSP" value="${item ? escapeHtml(item.TenSP) : ""}" maxlength="200">
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea name="MoTa" rows="3">${item ? escapeHtml(item.MoTa || "") : ""}</textarea>
            </div>
            <div class="form-group">
                <label>Giá (VNĐ)</label>
                <input type="number" name="Gia" min="0" step="1000" value="${item ? item.Gia : ""}">
            </div>
            <div class="form-group">
                <label>Đường dẫn ảnh</label>
                <input type="text" name="HinhAnh" value="${item ? escapeHtml(item.HinhAnh || "") : ""}">
            </div>
            <div class="form-group">
                <label>Danh mục</label>
                <select name="MaDM">${opts.danhMuc}</select>
            </div>
            <div class="form-group">
                <label>Thương hiệu</label>
                <select name="MaTH">${opts.thuongHieu}</select>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-accent">Lưu</button>
            </div>
        </form>
    `);

    if (item) {
        document.querySelector('#san-pham-form select[name="MaDM"]').value = item.MaDM;
        document.querySelector('#san-pham-form select[name="MaTH"]').value = item.MaTH;
    }

    const sanPhamForm = document.getElementById("san-pham-form");
    attachLiveValidation(sanPhamForm, "modal-error");

    sanPhamForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
        const form = e.target;
        if (!validateSanPhamForm(form)) return;
        const data = {
            TenSP: form.TenSP.value.trim(),
            MoTa: form.MoTa.value.trim() || undefined,
            Gia: Number(form.Gia.value),
            HinhAnh: form.HinhAnh.value.trim() || undefined,
            MaDM: Number(form.MaDM.value),
            MaTH: Number(form.MaTH.value),
        };
        try {
            if (item) {
                await apiPut(`/san-pham/${item.MaSP}`, data);
            } else {
                await apiPost("/san-pham", data);
            }
            closeModal();
            loadSanPham();
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
        }
    });
}

async function toggleTrangThai(id, newStatus) {
    try {
        await apiPatch(`/san-pham/${id}/trang-thai`, { TrangThai: newStatus });
        loadSanPham();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteSanPham(id) {
    if (!(await showConfirm("Xóa sản phẩm này? Không thể hoàn tác."))) return;
    try {
        await apiDelete(`/san-pham/${id}`);
        loadSanPham();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function validateBienTheForm(form) {
    clearFormErrors(form);
    let valid = true;

    const kichCo = form.KichCo.value.trim();
    if (!kichCo) {
        showFieldError(form.KichCo, "Vui lòng nhập kích cỡ");
        valid = false;
    } else if (kichCo.length > 10) {
        showFieldError(form.KichCo, "Kích cỡ tối đa 10 ký tự");
        valid = false;
    }

    const mauSac = form.MauSac.value.trim();
    if (!mauSac) {
        showFieldError(form.MauSac, "Vui lòng nhập màu sắc");
        valid = false;
    } else if (mauSac.length > 50) {
        showFieldError(form.MauSac, "Màu sắc tối đa 50 ký tự");
        valid = false;
    }

    const soLuongTon = form.SoLuongTon.value;
    if (soLuongTon === "") {
        showFieldError(form.SoLuongTon, "Vui lòng nhập số lượng tồn");
        valid = false;
    } else if (Number(soLuongTon) < 0) {
        showFieldError(form.SoLuongTon, "Số lượng tồn phải là số không âm");
        valid = false;
    }

    return valid;
}

// ============ Biến thể (trong modal riêng của 1 sản phẩm) ============
async function openBienTheModal(productId) {
    currentVariantProductId = productId;
    editingVariantId = null;
    const product = sanPhamList.find((s) => s.MaSP === productId);
    currentVariantList = await apiGet(`/san-pham/${productId}/bien-the`).catch(() => []);

    openModal(`
        <h3>Biến thể — ${escapeHtml(product ? product.TenSP : "")}</h3>
        <div id="modal-error" class="form-error" hidden></div>

        <table class="admin-table admin-table-compact">
            <thead><tr><th>Kích cỡ</th><th>Màu sắc</th><th>Tồn kho</th><th></th></tr></thead>
            <tbody id="bien-the-tbody"></tbody>
        </table>

        <form id="bien-the-form" class="admin-inline-form" novalidate>
            <input type="text" name="KichCo" placeholder="Kích cỡ" maxlength="10">
            <input type="text" name="MauSac" placeholder="Màu sắc" maxlength="50">
            <input type="number" name="SoLuongTon" placeholder="Tồn kho" min="0">
            <button type="submit" class="btn btn-accent" id="bien-the-submit-btn">+ Thêm</button>
        </form>

        <div class="modal-actions">
            <button type="button" class="btn btn-ghost" onclick="closeBienTheModal()">Đóng</button>
        </div>
    `);

    renderBienTheTable();

    const bienTheForm = document.getElementById("bien-the-form");
    attachLiveValidation(bienTheForm, "modal-error");

    bienTheForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
        const form = e.target;
        if (!validateBienTheForm(form)) return;
        const data = {
            KichCo: form.KichCo.value.trim(),
            MauSac: form.MauSac.value.trim(),
            SoLuongTon: Number(form.SoLuongTon.value),
        };
        try {
            if (editingVariantId) {
                await apiPut(`/bien-the/${editingVariantId}`, data);
                editingVariantId = null;
                document.getElementById("bien-the-submit-btn").textContent = "+ Thêm";
            } else {
                await apiPost(`/san-pham/${currentVariantProductId}/bien-the`, data);
            }
            form.reset();
            currentVariantList = await apiGet(`/san-pham/${currentVariantProductId}/bien-the`);
            renderBienTheTable();
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
        }
    });
}

function renderBienTheTable() {
    const tbody = document.getElementById("bien-the-tbody");
    tbody.innerHTML = currentVariantList.length
        ? currentVariantList
              .map(
                  (bt) => `
            <tr>
                <td>${escapeHtml(bt.KichCo)}</td>
                <td>${escapeHtml(bt.MauSac)}</td>
                <td>${bt.SoLuongTon}</td>
                <td class="admin-actions">
                    <button type="button" class="btn-link" onclick="editBienThe(${bt.MaBienThe})">Sửa</button>
                    <button type="button" class="btn-link btn-link-danger" onclick="deleteBienThe(${bt.MaBienThe})">Xóa</button>
                </td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="4" class="admin-empty">Chưa có biến thể</td></tr>`;
}

function editBienThe(id) {
    const bt = currentVariantList.find((v) => v.MaBienThe === id);
    if (!bt) return;
    editingVariantId = id;
    const form = document.getElementById("bien-the-form");
    form.KichCo.value = bt.KichCo;
    form.MauSac.value = bt.MauSac;
    form.SoLuongTon.value = bt.SoLuongTon;
    document.getElementById("bien-the-submit-btn").textContent = "Lưu thay đổi";
}

function closeBienTheModal() {
    closeModal();
    currentVariantProductId = null;
    loadSanPham();
}

async function deleteBienThe(id) {
    if (!(await showConfirm("Xóa biến thể này?"))) return;
    try {
        await apiDelete(`/bien-the/${id}`);
        currentVariantList = await apiGet(`/san-pham/${currentVariantProductId}/bien-the`);
        renderBienTheTable();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ============ Đơn hàng ============
const DON_HANG_STATUS_LABEL = {
    ChoXuLy: { text: "Chờ xử lý", cls: "pending" },
    DangGiao: { text: "Đang giao", cls: "shipping" },
    HoanThanh: { text: "Hoàn thành", cls: "done" },
    DaHuy: { text: "Đã hủy", cls: "cancelled" },
};

let donHangList = [];
let selectedDonHangStatus = "";
let donHangPage = 1;
const DON_HANG_PAGE_SIZE = 8;

function donHangStatusBadge(trangThai) {
    const status = DON_HANG_STATUS_LABEL[trangThai] || { text: trangThai, cls: "" };
    return `<span class="order-status ${status.cls}">${status.text}</span>`;
}

function donHangStatusClass(trangThai) {
    const status = DON_HANG_STATUS_LABEL[trangThai];
    return status ? `status-${status.cls}` : "";
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function loadDonHang() {
    const { items, pagination } = await apiGetPaged("/don-hang", {
        trangThai: selectedDonHangStatus,
        page: donHangPage,
        limit: DON_HANG_PAGE_SIZE,
    }).catch(() => ({ items: [], pagination: null }));
    if (!items.length && donHangPage > 1) {
        donHangPage -= 1;
        return loadDonHang();
    }
    donHangList = items;
    renderDonHangTable();
    renderPagination(document.getElementById("don-hang-pagination"), pagination, (page) => {
        donHangPage = page;
        loadDonHang();
    });
}

async function loadThongKe() {
    const allOrders = await apiGet("/don-hang").catch(() => []);
    renderThongKe(allOrders);
}

function renderThongKe(allOrders) {
    const cardsEl = document.getElementById("stat-cards");
    const monthTbody = document.getElementById("table-thong-ke-thang-body");
    if (!cardsEl || !monthTbody) return;

    const completedOrders = allOrders.filter((o) => o.TrangThai === "HoanThanh");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.TongTien, 0);

    const countByStatus = { ChoXuLy: 0, DangGiao: 0, HoanThanh: 0, DaHuy: 0 };
    allOrders.forEach((o) => {
        if (countByStatus[o.TrangThai] !== undefined) countByStatus[o.TrangThai]++;
    });

    cardsEl.innerHTML = `
        <div class="stat-card stat-card-highlight">
            <span class="stat-card-label">Tổng doanh thu</span>
            <strong class="stat-card-value">${formatCurrency(totalRevenue)}</strong>
        </div>
        <div class="stat-card">
            <span class="stat-card-label">Tổng số đơn</span>
            <strong class="stat-card-value">${allOrders.length}</strong>
        </div>
        ${Object.entries(DON_HANG_STATUS_LABEL)
            .map(
                ([value, s]) => `
            <div class="stat-card">
                <span class="stat-card-label">${s.text}</span>
                <strong class="stat-card-value status-${s.cls}">${countByStatus[value]}</strong>
            </div>`
            )
            .join("")}
    `;

    const revenueByMonth = {};
    completedOrders.forEach((o) => {
        const d = new Date(o.NgayDat);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!revenueByMonth[key]) revenueByMonth[key] = { count: 0, revenue: 0 };
        revenueByMonth[key].count++;
        revenueByMonth[key].revenue += o.TongTien;
    });

    const months = Object.keys(revenueByMonth).sort().reverse();
    monthTbody.innerHTML = months.length
        ? months
              .map((key) => {
                  const [year, month] = key.split("-");
                  const row = revenueByMonth[key];
                  return `<tr><td>Tháng ${month}/${year}</td><td>${row.count}</td><td>${formatCurrency(row.revenue)}</td></tr>`;
              })
              .join("")
        : `<tr><td colspan="3" class="admin-empty">Chưa có đơn hàng hoàn thành</td></tr>`;
}

function renderDonHangTable() {
    const tbody = document.getElementById("table-don-hang-body");

    tbody.innerHTML = donHangList.length
        ? donHangList
              .map(
                  (o) => `
            <tr>
                <td>#${o.MaDH}</td>
                <td>${escapeHtml(o.HoTen || "")}<br><span class="admin-subtext">${escapeHtml(o.Email || "")}</span></td>
                <td>${formatDate(o.NgayDat)}</td>
                <td>${o.TongSoLuong || 0}</td>
                <td>${formatCurrency(o.TongTien)}</td>
                <td>
                    <select class="admin-order-status-select ${donHangStatusClass(o.TrangThai)}" data-id="${o.MaDH}">
                        ${Object.entries(DON_HANG_STATUS_LABEL)
                            .map(
                                ([value, s]) =>
                                    `<option value="${value}" ${o.TrangThai === value ? "selected" : ""}>${s.text}</option>`
                            )
                            .join("")}
                    </select>
                </td>
                <td class="admin-actions">
                    <button type="button" class="btn-link" onclick="openAdminOrderDetail(${o.MaDH})">Xem chi tiết</button>
                </td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="7" class="admin-empty">Không có đơn hàng nào</td></tr>`;

    tbody.querySelectorAll(".admin-order-status-select").forEach((select) => {
        const originalValue = select.value;

        function resetToOriginal() {
            select.value = originalValue;
            select.className = `admin-order-status-select ${donHangStatusClass(originalValue)}`;
        }

        select.addEventListener("change", async () => {
            const newValue = select.value;
            const id = select.dataset.id;
            const label = DON_HANG_STATUS_LABEL[newValue] ? DON_HANG_STATUS_LABEL[newValue].text : newValue;

            let lyDoHuy = null;
            if (newValue === "DaHuy") {
                lyDoHuy = await showPrompt(`Nhập lý do hủy đơn #${id}:`, {
                    placeholder: "VD: Khách hàng đổi ý, hết hàng thực tế...",
                    okText: "Hủy đơn",
                });
                if (!lyDoHuy) {
                    resetToOriginal();
                    return;
                }
            } else if (!(await showConfirm(`Đổi trạng thái đơn #${id} sang "${label}"?`))) {
                resetToOriginal();
                return;
            }

            select.className = `admin-order-status-select ${donHangStatusClass(newValue)}`;
            try {
                await apiPatch(`/don-hang/${id}/trang-thai`, { TrangThai: newValue, LyDoHuy: lyDoHuy });
                showToast("Đã cập nhật trạng thái đơn hàng", "success");
                loadDonHang();
                loadThongKe();
            } catch (err) {
                showToast(err.message, "error");
                resetToOriginal();
            }
        });
    });
}

async function openAdminOrderDetail(id) {
    try {
        const order = await apiGet(`/don-hang/${id}`);
        const itemsHtml = order.ChiTiet.map((item) => {
            const media = item.HinhAnh
                ? `<img src="${escapeHtml(item.HinhAnh)}" alt="${escapeHtml(item.TenSP)}">`
                : `<div class="order-detail-item-noimg">Chưa có ảnh</div>`;
            return `
                <div class="order-detail-item">
                    <div class="order-detail-item-media">${media}</div>
                    <div class="order-detail-item-info">
                        <span class="order-detail-item-name">${escapeHtml(item.TenSP)}</span>
                        <span class="order-detail-item-variant">Size ${escapeHtml(item.KichCo)} · ${escapeHtml(item.MauSac)} · × ${item.SoLuong}</span>
                    </div>
                    <strong class="order-detail-item-subtotal">${formatCurrency(item.DonGia * item.SoLuong)}</strong>
                </div>
            `;
        }).join("");

        openModal(`
            <h3>Đơn hàng #${order.MaDH}</h3>
            <p class="order-detail-meta"><span>Khách hàng</span><strong>${escapeHtml(order.HoTen || "")} (${escapeHtml(order.Email || "")})</strong></p>
            <p class="order-detail-meta"><span>Trạng thái</span>${donHangStatusBadge(order.TrangThai)}</p>
            ${
                order.TrangThai === "DaHuy" && order.LyDoHuy
                    ? `<p class="order-detail-meta"><span>Lý do hủy</span><strong>${escapeHtml(order.LyDoHuy)}</strong></p>`
                    : ""
            }
            <p class="order-detail-meta"><span>Ngày đặt</span><strong>${formatDate(order.NgayDat)}</strong></p>
            <p class="order-detail-meta"><span>Giao đến</span><strong>${escapeHtml(order.DiaChiGiaoHang)}</strong></p>
            <p class="order-detail-meta"><span>SĐT nhận hàng</span><strong>${escapeHtml(order.SDTNhan)}</strong></p>
            <div class="order-detail-items">${itemsHtml}</div>
            <div class="order-detail-total">
                <span>Tổng cộng</span>
                <strong>${formatCurrency(order.TongTien)}</strong>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Đóng</button>
            </div>
        `);
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ============ Tabs ============
function initTabs() {
    document.querySelectorAll(".admin-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll(".admin-panel").forEach((p) => (p.hidden = true));
            document.getElementById("panel-" + btn.dataset.tab).hidden = false;
        });
    });
}

// ============ Init ============
if (isAdmin) {
    initTabs();

    document.getElementById("btn-add-danh-muc").addEventListener("click", () => openDanhMucForm());
    document.getElementById("btn-add-thuong-hieu").addEventListener("click", () => openThuongHieuForm());
    document.getElementById("btn-add-san-pham").addEventListener("click", () => openSanPhamForm());

    const adminOrderTabs = document.getElementById("admin-order-tabs");
    if (adminOrderTabs) {
        adminOrderTabs.querySelectorAll(".order-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                selectedDonHangStatus = tab.dataset.status;
                donHangPage = 1;
                adminOrderTabs.querySelectorAll(".order-tab").forEach((t) => t.classList.toggle("active", t === tab));
                loadDonHang();
            });
        });
    }

    loadDanhMuc();
    loadThuongHieu();
    loadSanPham();
    loadDonHang();
    loadThongKe();
}
