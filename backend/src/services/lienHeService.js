const lienHeModel = require("../models/lienHeModel");
const httpError = require("../utils/httpError");

async function create(data) {
    return lienHeModel.create(data);
}

async function getAll(filters) {
    return lienHeModel.findAll(filters);
}

async function updateDaXuLy(id, daXuLy) {
    const item = await lienHeModel.findById(id);
    if (!item) {
        throw httpError(404, "Không tìm thấy lời nhắn");
    }
    return lienHeModel.updateDaXuLy(id, daXuLy);
}

module.exports = { create, getAll, updateDaXuLy };
