const bienTheModel = require("../models/bienTheModel");
const sanPhamModel = require("../models/sanPhamModel");
const httpError = require("../utils/httpError");

const UNIQUE_VIOLATION = [2627, 2601];
const FK_VIOLATION = 547;

async function getByProductId(maSP) {
    const sanPham = await sanPhamModel.findById(maSP);
    if (!sanPham) throw httpError(404, "Không tìm thấy sản phẩm");
    return bienTheModel.findByProductId(maSP);
}

async function getById(id) {
    const item = await bienTheModel.findById(id);
    if (!item) throw httpError(404, "Không tìm thấy biến thể");
    return item;
}

async function create(maSP, data) {
    const sanPham = await sanPhamModel.findById(maSP);
    if (!sanPham) throw httpError(404, "Không tìm thấy sản phẩm");

    try {
        return await bienTheModel.create(maSP, data);
    } catch (err) {
        if (UNIQUE_VIOLATION.includes(err.number)) {
            throw httpError(409, "Biến thể (kích cỡ + màu sắc) này đã tồn tại cho sản phẩm");
        }
        throw err;
    }
}

async function update(id, data) {
    const existing = await bienTheModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy biến thể");

    try {
        return await bienTheModel.update(id, data);
    } catch (err) {
        if (UNIQUE_VIOLATION.includes(err.number)) {
            throw httpError(409, "Biến thể (kích cỡ + màu sắc) này đã tồn tại cho sản phẩm");
        }
        throw err;
    }
}

async function remove(id) {
    const existing = await bienTheModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy biến thể");

    try {
        await bienTheModel.remove(id);
    } catch (err) {
        if (err.number === FK_VIOLATION) {
            throw httpError(409, "Không thể xóa vì biến thể đang có trong giỏ hàng hoặc đơn hàng");
        }
        throw err;
    }
}

module.exports = { getByProductId, getById, create, update, remove };
