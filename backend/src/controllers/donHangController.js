const { validationResult } = require("express-validator");
const donHangService = require("../services/donHangService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function createOrder(req, res, next) {
    try {
        handleValidation(req);
        const order = await donHangService.createOrder(req.user.maND, req.body);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}

async function createDirectOrder(req, res, next) {
    try {
        handleValidation(req);
        const order = await donHangService.createDirectOrder(req.user.maND, req.body);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}

async function getAll(req, res, next) {
    try {
        handleValidation(req);
        const { trangThai, maDon, q, page, limit } = req.query;
        const isAdmin = req.user.vaiTro === "Admin";
        const result = isAdmin
            ? await donHangService.getAllOrders({ trangThai, maDon, q, page, limit })
            : await donHangService.getMyOrders(req.user.maND, { trangThai, page, limit });

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
        const isAdmin = req.user.vaiTro === "Admin";
        const order = await donHangService.getOrderById(req.params.id, req.user.maND, isAdmin);
        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}

async function updateStatus(req, res, next) {
    try {
        handleValidation(req);
        const order = await donHangService.updateStatus(req.params.id, req.body.TrangThai, req.body.LyDoHuy);
        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}

module.exports = { createOrder, createDirectOrder, getAll, getById, updateStatus };
