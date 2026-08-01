const uploadService = require("../services/uploadService");
const httpError = require("../utils/httpError");

async function uploadAnh(req, res, next) {
    try {
        if (!req.file) {
            throw httpError(400, "Vui lòng chọn 1 file ảnh");
        }
        const url = await uploadService.uploadImageBuffer(req.file.buffer);
        res.status(201).json({ success: true, data: { url } });
    } catch (err) {
        next(err);
    }
}

module.exports = { uploadAnh };
