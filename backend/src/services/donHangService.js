const gioHangModel = require("../models/gioHangModel");
const donHangModel = require("../models/donHangModel");
const httpError = require("../utils/httpError");

async function createOrder(maND, { DiaChiGiaoHang, SDTNhan }) {
    const cartItems = await gioHangModel.findByUser(maND);

    if (!cartItems.length) {
        throw httpError(400, "Giỏ hàng trống, không thể đặt hàng");
    }

    for (const item of cartItems) {
        if (!item.TrangThai) {
            throw httpError(400, `Sản phẩm "${item.TenSP}" hiện không còn bán, vui lòng xóa khỏi giỏ hàng`);
        }
        if (item.SoLuong > item.SoLuongTon) {
            throw httpError(
                400,
                `Sản phẩm "${item.TenSP}" (size ${item.KichCo}, ${item.MauSac}) chỉ còn ${item.SoLuongTon} sản phẩm trong kho`
            );
        }
    }

    const tongTien = cartItems.reduce((sum, item) => sum + item.Gia * item.SoLuong, 0);

    return donHangModel.createOrder(maND, { DiaChiGiaoHang, SDTNhan, items: cartItems, tongTien });
}

async function createDirectOrder(maND, { MaBienThe, SoLuong, DiaChiGiaoHang, SDTNhan }) {
    const variant = await donHangModel.findVariantWithProduct(MaBienThe);
    if (!variant) {
        throw httpError(404, "Không tìm thấy biến thể sản phẩm");
    }
    if (!variant.TrangThai) {
        throw httpError(400, `Sản phẩm "${variant.TenSP}" hiện không còn bán`);
    }
    if (SoLuong > variant.SoLuongTon) {
        throw httpError(
            400,
            `Sản phẩm "${variant.TenSP}" (size ${variant.KichCo}, ${variant.MauSac}) chỉ còn ${variant.SoLuongTon} sản phẩm trong kho`
        );
    }

    const tongTien = variant.Gia * SoLuong;
    const item = { MaBienThe, SoLuong, Gia: variant.Gia, MaGioHang: null };

    return donHangModel.createOrder(maND, { DiaChiGiaoHang, SDTNhan, items: [item], tongTien });
}

async function getMyOrders(maND, filters) {
    return donHangModel.findByUser(maND, filters);
}

async function getAllOrders(filters) {
    return donHangModel.findAll(filters);
}

async function getOrderById(maDH, maND, isAdmin) {
    const order = await donHangModel.findById(maDH);
    if (!order || (!isAdmin && order.MaND !== maND)) {
        throw httpError(404, "Không tìm thấy đơn hàng");
    }
    return order;
}

const TRANG_THAI_HOP_LE = ["ChoXuLy", "DangGiao", "HoanThanh", "DaHuy"];

async function updateStatus(maDH, trangThaiMoi, lyDoHuy) {
    const order = await donHangModel.findById(maDH);
    if (!order) {
        throw httpError(404, "Không tìm thấy đơn hàng");
    }

    if (trangThaiMoi === "DaHuy") {
        if (!lyDoHuy || !lyDoHuy.trim()) {
            throw httpError(400, "Vui lòng nhập lý do hủy đơn");
        }
        if (order.TrangThai !== "DaHuy") {
            await donHangModel.restoreStock(maDH);
        }
        return donHangModel.updateTrangThai(maDH, trangThaiMoi, lyDoHuy.trim());
    }

    return donHangModel.updateTrangThai(maDH, trangThaiMoi, null);
}

async function topSanPhamBanChay(limit) {
    return donHangModel.topSanPhamBanChay(limit);
}

module.exports = {
    createOrder,
    createDirectOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateStatus,
    TRANG_THAI_HOP_LE,
    topSanPhamBanChay,
};
