const sanPhamModel = require("../models/sanPhamModel");
const uploadService = require("./uploadService");
const httpError = require("../utils/httpError");

const FK_VIOLATION = 547;

async function getAll(filters) {
    return sanPhamModel.findAll(filters);
}

async function getById(id, isAdmin) {
    const item = await sanPhamModel.findById(id);
    if (!item || (!item.TrangThai && !isAdmin)) {
        throw httpError(404, "Không tìm thấy sản phẩm");
    }
    return item;
}

async function create(data) {
    try {
        return await sanPhamModel.create(data);
    } catch (err) {
        if (err.number === FK_VIOLATION) {
            throw httpError(400, "Danh mục hoặc thương hiệu không tồn tại");
        }
        throw err;
    }
}

async function update(id, data) {
    const existing = await sanPhamModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy sản phẩm");

    try {
        const updated = await sanPhamModel.update(id, data);
        if (existing.HinhAnh && existing.HinhAnh !== updated.HinhAnh) {
            await uploadService.deleteImageIfManaged(existing.HinhAnh);
        }
        return updated;
    } catch (err) {
        if (err.number === FK_VIOLATION) {
            throw httpError(400, "Danh mục hoặc thương hiệu không tồn tại");
        }
        throw err;
    }
}

async function setTrangThai(id, trangThai) {
    const existing = await sanPhamModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy sản phẩm");
    return sanPhamModel.updateTrangThai(id, trangThai);
}

async function remove(id) {
    const existing = await sanPhamModel.findById(id);
    if (!existing) throw httpError(404, "Không tìm thấy sản phẩm");

    try {
        await sanPhamModel.remove(id);
        await uploadService.deleteImageIfManaged(existing.HinhAnh);
    } catch (err) {
        if (err.number === FK_VIOLATION) {
            throw httpError(409, "Không thể xóa vì sản phẩm đang có biến thể hoặc đơn hàng liên quan");
        }
        throw err;
    }
}

module.exports = { getAll, getById, create, update, setTrangThai, remove };
