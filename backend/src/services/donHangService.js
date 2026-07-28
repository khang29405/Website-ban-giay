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

async function getMyOrders(maND) {
    return donHangModel.findByUser(maND);
}

async function getAllOrders() {
    return donHangModel.findAll();
}

async function getOrderById(maDH, maND, isAdmin) {
    const order = await donHangModel.findById(maDH);
    if (!order || (!isAdmin && order.MaND !== maND)) {
        throw httpError(404, "Không tìm thấy đơn hàng");
    }
    return order;
}

const TRANG_THAI_HOP_LE = ["ChoXuLy", "DangGiao", "HoanThanh", "DaHuy"];

async function updateStatus(maDH, trangThaiMoi) {
    const order = await donHangModel.findById(maDH);
    if (!order) {
        throw httpError(404, "Không tìm thấy đơn hàng");
    }

    if (trangThaiMoi === "DaHuy" && order.TrangThai !== "DaHuy") {
        await donHangModel.restoreStock(maDH);
    }

    return donHangModel.updateTrangThai(maDH, trangThaiMoi);
}

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateStatus, TRANG_THAI_HOP_LE };
