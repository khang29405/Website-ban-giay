const { validationResult } = require("express-validator");
const sanPhamService = require("../services/sanPhamService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function getAll(req, res, next) {
    try {
        handleValidation(req);
        const { ten, maSp, danhMuc, thuongHieu, sapXep, page, limit } = req.query;
        const isAdmin = req.user && req.user.vaiTro === "Admin";
        const result = await sanPhamService.getAll({
            ten,
            maSp,
            maDM: danhMuc,
            maTH: thuongHieu,
            sapXep,
            chiHienThi: !isAdmin,
            page,
            limit,
        });

        if (page) {
            res.json({
                success: true,
                data: result.items,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
                },
            });
        } else {
            res.json({ success: true, data: result });
        }
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        handleValidation(req);
        const isAdmin = req.user && req.user.vaiTro === "Admin";
        const item = await sanPhamService.getById(req.params.id, isAdmin);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        handleValidation(req);
        const item = await sanPhamService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        handleValidation(req);
        const item = await sanPhamService.update(req.params.id, req.body);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function setTrangThai(req, res, next) {
    try {
        handleValidation(req);
        const item = await sanPhamService.setTrangThai(req.params.id, req.body.TrangThai);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        handleValidation(req);
        await sanPhamService.remove(req.params.id);
        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, setTrangThai, remove };
