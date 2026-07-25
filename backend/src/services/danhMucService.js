const danhMucModel = require("../models/danhMucModel");
const httpError = require("../utils/httpError");

const FK_VIOLATION = 547;

async function getAll() {
    return danhMucModel.findAll();
}

async function getById(id) {
    const item = await danhMucModel.findById(id);
    if (!item) throw httpError(404, "Không tìm thấy danh mục");
    return item;
}

async function create({ TenDanhMuc }) {
    return danhMucModel.create(TenDanhMuc);
}

async function update(id, { TenDanhMuc }) {
    const existing = await danhMucModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy danh mục");
    return danhMucModel.update(id, TenDanhMuc);
}

async function remove(id) {
    const existing = await danhMucModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy danh mục");

    try {
        await danhMucModel.remove(id);
    } catch (err) {
        if (err.number === FK_VIOLATION) {
            throw httpError(409, "Không thể xóa vì đang có sản phẩm sử dụng danh mục này");
        }
        throw err;
    }
}

module.exports = { getAll, getById, create, update, remove };
