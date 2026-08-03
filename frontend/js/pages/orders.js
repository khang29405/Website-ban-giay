const ordersGuest = document.getElementById("orders-guest");
const ordersContent = document.getElementById("orders-content");
const ordersList = document.getElementById("orders-list");
const orderTabs = document.getElementById("order-tabs");

const STATUS_LABEL = {
    ChoXuLy: { text: "Chờ xử lý", cls: "pending" },
    DangGiao: { text: "Đang giao", cls: "shipping" },
    HoanThanh: { text: "Hoàn thành", cls: "done" },
    DaHuy: { text: "Đã hủy", cls: "cancelled" },
};

const STATUS_STEPS = ["ChoXuLy", "DangGiao", "HoanThanh"];

let selectedStatus = "";
let currentPage = 1;
const PAGE_SIZE = 6;

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function statusBadge(trangThai) {
    const status = STATUS_LABEL[trangThai] || { text: trangThai, cls: "" };
    return `<span class="order-status ${status.cls}">${status.text}</span>`;
}

function renderOrderProgress(trangThai, lyDoHuy) {
    if (trangThai === "DaHuy") {
        return `
            <div class="order-progress is-cancelled"><i class="fa-solid fa-circle-xmark"></i> Đơn hàng đã bị hủy, tồn kho đã được hoàn lại</div>
            ${lyDoHuy ? `<p class="order-cancel-reason"><span>Lý do hủy:</span> ${escapeHtml(lyDoHuy)}</p>` : ""}
        `;
    }

    const currentIndex = STATUS_STEPS.indexOf(trangThai);

    return `
        <div class="order-progress">
            ${STATUS_STEPS.map((step, i) => {
                const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "";
                const connector =
                    i < STATUS_STEPS.length - 1
                        ? `<span class="order-progress-line ${i < currentIndex ? "done" : ""}"></span>`
                        : "";
                return `
                    <div class="order-progress-step ${state}">
                        <span class="order-progress-dot"></span>
                        <span class="order-progress-label">${STATUS_LABEL[step].text}</span>
                    </div>
                    ${connector}
                `;
            }).join("")}
        </div>
    `;
}

function itemThumbnails(images, extraCount) {
    if (!images.length) {
        return `<div class="order-item-preview"><div class="order-item-preview-noimg">Chưa có ảnh</div></div>`;
    }

    return `
        <div class="order-item-preview">
            ${images
                .map((src) =>
                    src
                        ? `<img src="${escapeHtml(src)}" alt="Sản phẩm trong đơn hàng" loading="lazy">`
                        : `<div class="order-item-preview-noimg"></div>`
                )
                .join("")}
            ${extraCount > 0 ? `<span class="order-item-preview-extra">+${extraCount}</span>` : ""}
        </div>
    `;
}

function renderOrders(orders) {
    if (!orders.length) {
        ordersList.innerHTML = `
            <div class="empty-state">
                ${emptyStateIcon()}
                <strong>${selectedStatus ? "Không có đơn hàng nào ở trạng thái này" : "Bạn chưa có đơn hàng nào"}</strong>
                <p><a href="san-pham.html" class="btn btn-accent"><i class="fa-solid fa-store"></i> Mua sắm ngay</a></p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = orders
        .map((o) => {
            const images = o.AnhXemTruoc || [];
            const extraCount = Math.max(0, (o.TongSoLuong || images.length) - images.length);

            return `
                <div class="order-card">
                    <div class="order-card-header">
                        <div class="order-card-heading">
                            <span class="order-code">Đơn ${formatId("DH", o.MaDH, 5)}</span>
                            <span class="order-date">${formatDate(o.NgayDat)}</span>
                        </div>
                        ${statusBadge(o.TrangThai)}
                    </div>

                    ${itemThumbnails(images, extraCount)}

                    <div class="order-card-body">
                        <span class="order-address">Giao đến: ${escapeHtml(o.DiaChiGiaoHang)}</span>
                        <div class="order-card-total">
                            <span>${o.TongSoLuong || 0} sản phẩm</span>
                            <strong>${formatCurrency(o.TongTien)}</strong>
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline btn-block" data-id="${o.MaDH}"><i class="fa-solid fa-eye"></i> Xem chi tiết</button>
                </div>
            `;
        })
        .join("");

    ordersList.querySelectorAll("[data-id]").forEach((btn) => {
        btn.addEventListener("click", () => openOrderDetailModal(btn.dataset.id));
    });
}

async function openOrderDetailModal(id) {
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
            <h3>Đơn hàng ${formatId("DH", order.MaDH, 5)}</h3>

            ${renderOrderProgress(order.TrangThai, order.LyDoHuy)}

            <p class="order-detail-meta"><span>Ngày đặt</span><strong>${formatDate(order.NgayDat)}</strong></p>
            <p class="order-detail-meta"><span>Giao đến</span><strong>${escapeHtml(order.DiaChiGiaoHang)}</strong></p>
            <p class="order-detail-meta"><span>SĐT nhận hàng</span><strong>${escapeHtml(order.SDTNhan)}</strong></p>
            <p class="order-detail-meta"><span>Thanh toán</span><strong>${escapeHtml(order.PhuongThucTT)} (khi nhận hàng)</strong></p>

            <div class="order-detail-items">${itemsHtml}</div>

            <div class="order-detail-total">
                <span>Tổng cộng</span>
                <strong>${formatCurrency(order.TongTien)}</strong>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-ghost" onclick="closeModal()"><i class="fa-solid fa-xmark"></i> Đóng</button>
            </div>
        `);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderOrdersSkeleton(count = 3) {
    ordersList.innerHTML = Array.from({ length: count })
        .map(
            () => `
        <div class="order-card order-card-skeleton">
            <div class="order-card-header">
                <div class="order-card-heading">
                    <span class="skeleton-line skeleton-line-sm" style="width:70px"></span>
                    <span class="skeleton-line skeleton-line-sm" style="width:90px"></span>
                </div>
                <span class="skeleton-line skeleton-line-sm" style="width:60px;margin:0"></span>
            </div>
            <div class="order-item-preview">
                <div class="order-item-preview-noimg"></div>
            </div>
            <div class="order-card-body">
                <span class="skeleton-line" style="width:80%"></span>
                <div class="order-card-total">
                    <span class="skeleton-line skeleton-line-sm" style="width:70px;margin:0"></span>
                    <span class="skeleton-line skeleton-line-sm" style="width:90px;margin:0"></span>
                </div>
            </div>
            <span class="skeleton-line" style="width:100%;height:36px;margin:0"></span>
        </div>
    `
        )
        .join("");
}

async function loadOrders() {
    renderOrdersSkeleton();
    try {
        const { items, pagination } = await apiGetPaged("/don-hang", {
            trangThai: selectedStatus,
            page: currentPage,
            limit: PAGE_SIZE,
        });
        renderOrders(items);
        renderPagination(document.getElementById("orders-pagination"), pagination, (page) => {
            currentPage = page;
            loadOrders();
        });
    } catch (err) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <strong>Không tải được đơn hàng</strong>
                <p>${escapeHtml(err.message || "Vui lòng thử lại sau.")}</p>
            </div>
        `;
    }
}

if (orderTabs) {
    orderTabs.querySelectorAll(".order-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            selectedStatus = tab.dataset.status;
            currentPage = 1;
            orderTabs.querySelectorAll(".order-tab").forEach((t) => t.classList.toggle("active", t === tab));
            loadOrders();
        });
    });
}

const currentUser = getCurrentUser();
if (currentUser && (currentUser.VaiTro === "Admin" || currentUser.VaiTro === "NhanVien")) {
    window.location.href = "index.html";
} else if (currentUser) {
    ordersGuest.hidden = true;
    ordersContent.hidden = false;
    loadOrders();
} else {
    ordersGuest.hidden = false;
    ordersContent.hidden = true;
}
