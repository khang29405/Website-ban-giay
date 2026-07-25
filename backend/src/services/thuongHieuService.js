const thuongHieuModel = require("../models/thuongHieuModel");
const httpError = require("../utils/httpError");

const UNIQUE_VIOLATION = [2627, 2601];
const FK_VIOLATION = 547;

async function getAll() {
    return thuongHieuModel.findAll();
}

async function getById(id) {
    const item = await thuongHieuModel.findById(id);
    if (!item) throw httpError(404, "Không tìm thấy thương hiệu");
    return item;
}

async function create({ TenThuongHieu }) {
    try {
        return await thuongHieuModel.create(TenThuongHieu);
    } catch (err) {
        if (UNIQUE_VIOLATION.includes(err.number)) {
            throw httpError(409, "Tên thương hiệu đã tồn tại");
        }
        throw err;
    }
}

async function update(id, { TenThuongHieu }) {
    const existing = await thuongHieuModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy thương hiệu");

    try {
        return await thuongHieuModel.update(id, TenThuongHieu);
    } catch (err) {
        if (UNIQUE_VIOLATION.includes(err.number)) {
            throw httpError(409, "Tên thương hiệu đã tồn tại");
        }
        throw err;
    }
}

async function remove(id) {
    const existing = await thuongHieuModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy thương hiệu");

    try {
        await thuongHieuModel.remove(id);
    } catch (err) {
        if (err.number === FK_VIOLATION) {
            throw httpError(409, "Không thể xóa vì đang có sản phẩm sử dụng thương hiệu này");
        }
        throw err;
    }
}

module.exports = { getAll, getById, create, update, remove };
