const userModel = require("../models/userModel");
const httpError = require("../utils/httpError");

async function getAll({ vaiTro, q, page, limit }) {
    return userModel.findAll({ vaiTro, q, page, limit });
}

async function updateRole(maND, vaiTro, nguoiThucHienId) {
    if (Number(maND) === Number(nguoiThucHienId)) {
        throw httpError(400, "Không thể tự đổi vai trò của chính mình");
    }

    const existing = await userModel.findById(maND);
    if (!existing) {
        throw httpError(404, "Không tìm thấy người dùng");
    }

    return userModel.updateRole(maND, vaiTro);
}

async function setLocked(maND, daKhoa, nguoiThucHienId) {
    if (Number(maND) === Number(nguoiThucHienId)) {
        throw httpError(400, "Không thể tự khóa tài khoản của chính mình");
    }

    const existing = await userModel.findById(maND);
    if (!existing) {
        throw httpError(404, "Không tìm thấy người dùng");
    }

    return userModel.setLocked(maND, daKhoa);
}

module.exports = { getAll, updateRole, setLocked };
