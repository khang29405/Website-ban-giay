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

module.exports = { createOrder };
