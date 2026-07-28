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

async function getAll(req, res, next) {
    try {
        const isAdmin = req.user.vaiTro === "Admin";
        const orders = isAdmin
            ? await donHangService.getAllOrders()
            : await donHangService.getMyOrders(req.user.maND);
        res.json({ success: true, data: orders });
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
        const order = await donHangService.updateStatus(req.params.id, req.body.TrangThai);
        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}

module.exports = { createOrder, getAll, getById, updateStatus };
