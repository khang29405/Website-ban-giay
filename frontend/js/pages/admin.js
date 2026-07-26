function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// ============ Auth guard ============
const currentUser = getCurrentUser();
const isAdmin = !!currentUser && currentUser.VaiTro === "Admin";

document.getElementById("admin-root").hidden = !isAdmin;
document.getElementById("access-denied").hidden = isAdmin;

// ============ Modal ============
const modalOverlay = document.getElementById("modal-overlay");
const modalBox = document.getElementById("modal-box");

function openModal(html) {
    modalBox.innerHTML = html;
    modalOverlay.hidden = false;
}

function closeModal() {
    modalOverlay.hidden = true;
    modalBox.innerHTML = "";
}

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

function openDanhMucForm(id) {
    const item = id ? danhMucList.find((d) => d.MaDM === id) : null;

    openModal(`
        <h3>${item ? "Sửa danh mục" : "Thêm danh mục"}</h3>
        <div id="modal-error" class="form-error" hidden></div>
        <form id="danh-muc-form">
            <div class="form-group">
                <label>Tên danh mục</label>
                <input type="text" name="TenDanhMuc" value="${item ? escapeHtml(item.TenDanhMuc) : ""}" required maxlength="100">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-accent">Lưu</button>
            </div>
        </form>
    `);

    document.getElementById("danh-muc-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
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

function openThuongHieuForm(id) {
    const item = id ? thuongHieuList.find((t) => t.MaTH === id) : null;

    openModal(`
        <h3>${item ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h3>
        <div id="modal-error" class="form-error" hidden></div>
        <form id="thuong-hieu-form">
            <div class="form-group">
                <label>Tên thương hiệu</label>
                <input type="text" name="TenThuongHieu" value="${item ? escapeHtml(item.TenThuongHieu) : ""}" required maxlength="100">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-accent">Lưu</button>
            </div>
        </form>
    `);

    document.getElementById("thuong-hieu-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
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

async function loadSanPham() {
    sanPhamList = await apiGet("/san-pham").catch(() => []);
    await loadStockSummary();
    renderSanPhamTable();
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

function openSanPhamForm(id) {
    const item = id ? sanPhamList.find((s) => s.MaSP === id) : null;
    const opts = sanPhamOptionsHtml();

    openModal(`
        <h3>${item ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <div id="modal-error" class="form-error" hidden></div>
        <form id="san-pham-form">
            <div class="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" name="TenSP" value="${item ? escapeHtml(item.TenSP) : ""}" required maxlength="200">
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea name="MoTa" rows="3">${item ? escapeHtml(item.MoTa || "") : ""}</textarea>
            </div>
            <div class="form-group">
                <label>Giá (VNĐ)</label>
                <input type="number" name="Gia" min="0" step="1000" value="${item ? item.Gia : ""}" required>
            </div>
            <div class="form-group">
                <label>Đường dẫn ảnh</label>
                <input type="text" name="HinhAnh" value="${item ? escapeHtml(item.HinhAnh || "") : ""}">
            </div>
            <div class="form-group">
                <label>Danh mục</label>
                <select name="MaDM" required>${opts.danhMuc}</select>
            </div>
            <div class="form-group">
                <label>Thương hiệu</label>
                <select name="MaTH" required>${opts.thuongHieu}</select>
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

    document.getElementById("san-pham-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
        const form = e.target;
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

        <form id="bien-the-form" class="admin-inline-form">
            <input type="text" name="KichCo" placeholder="Kích cỡ" required maxlength="10">
            <input type="text" name="MauSac" placeholder="Màu sắc" required maxlength="50">
            <input type="number" name="SoLuongTon" placeholder="Tồn kho" min="0" required>
            <button type="submit" class="btn btn-accent" id="bien-the-submit-btn">+ Thêm</button>
        </form>

        <div class="modal-actions">
            <button type="button" class="btn btn-ghost" onclick="closeBienTheModal()">Đóng</button>
        </div>
    `);

    renderBienTheTable();

    document.getElementById("bien-the-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("modal-error");
        errorBox.hidden = true;
        const form = e.target;
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

    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.getElementById("btn-add-danh-muc").addEventListener("click", () => openDanhMucForm());
    document.getElementById("btn-add-thuong-hieu").addEventListener("click", () => openThuongHieuForm());
    document.getElementById("btn-add-san-pham").addEventListener("click", () => openSanPhamForm());

    loadDanhMuc();
    loadThuongHieu();
    loadSanPham();
}
