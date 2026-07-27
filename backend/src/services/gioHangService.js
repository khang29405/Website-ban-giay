const gioHangModel = require("../models/gioHangModel");
const httpError = require("../utils/httpError");

async function getCart(maND) {
    return gioHangModel.findByUser(maND);
}

async function addToCart(maND, { MaBienThe, SoLuong }) {
    const variant = await gioHangModel.findVariantById(MaBienThe);
    if (!variant) {
        throw httpError(404, "Không tìm thấy biến thể sản phẩm");
    }

    const existing = await gioHangModel.findByUserAndVariant(maND, MaBienThe);
    const tongSoLuong = (existing ? existing.SoLuong : 0) + SoLuong;

    if (tongSoLuong > variant.SoLuongTon) {
        throw httpError(400, `Số lượng vượt quá tồn kho (còn ${variant.SoLuongTon})`);
    }

    if (existing) {
        return gioHangModel.updateSoLuong(existing.MaGioHang, tongSoLuong);
    }
    return gioHangModel.create({ MaND: maND, MaBienThe, SoLuong });
}

async function updateQuantity(maND, id, soLuong) {
    const item = await gioHangModel.findById(id);
    if (!item || item.MaND !== maND) {
        throw httpError(404, "Không tìm thấy sản phẩm trong giỏ hàng");
    }

    if (soLuong > item.SoLuongTon) {
        throw httpError(400, `Số lượng vượt quá tồn kho (còn ${item.SoLuongTon})`);
    }

    return gioHangModel.updateSoLuong(id, soLuong);
}

async function removeFromCart(maND, id) {
    const item = await gioHangModel.findById(id);
    if (!item || item.MaND !== maND) {
        throw httpError(404, "Không tìm thấy sản phẩm trong giỏ hàng");
    }
    await gioHangModel.remove(id);
}

module.exports = { getCart, addToCart, updateQuantity, removeFromCart };
