const yeuThichModel = require("../models/yeuThichModel");
const sanPhamModel = require("../models/sanPhamModel");
const httpError = require("../utils/httpError");

async function getMyFavorites(maND) {
    return yeuThichModel.findByUser(maND);
}

async function addFavorite(maND, maSP) {
    const product = await sanPhamModel.findById(maSP);
    if (!product) {
        throw httpError(404, "Không tìm thấy sản phẩm");
    }

    const existing = await yeuThichModel.findByUserAndProduct(maND, maSP);
    if (existing) {
        throw httpError(409, "Sản phẩm đã có trong danh sách yêu thích");
    }

    await yeuThichModel.create(maND, maSP);
}

async function removeFavorite(maND, maSP) {
    const existing = await yeuThichModel.findByUserAndProduct(maND, maSP);
    if (!existing) {
        throw httpError(404, "Sản phẩm không có trong danh sách yêu thích");
    }
    await yeuThichModel.remove(maND, maSP);
}

module.exports = { getMyFavorites, addFavorite, removeFavorite };
