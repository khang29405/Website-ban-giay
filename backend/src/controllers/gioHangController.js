const { validationResult } = require("express-validator");
const gioHangService = require("../services/gioHangService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function getCart(req, res, next) {
    try {
        const items = await gioHangService.getCart(req.user.maND);
        res.json({ success: true, data: items });
    } catch (err) {
        next(err);
    }
}

async function addToCart(req, res, next) {
    try {
        handleValidation(req);
        const item = await gioHangService.addToCart(req.user.maND, req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function updateQuantity(req, res, next) {
    try {
        handleValidation(req);
        const item = await gioHangService.updateQuantity(req.user.maND, req.params.id, req.body.SoLuong);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function removeFromCart(req, res, next) {
    try {
        handleValidation(req);
        await gioHangService.removeFromCart(req.user.maND, req.params.id);
        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getCart, addToCart, updateQuantity, removeFromCart };
