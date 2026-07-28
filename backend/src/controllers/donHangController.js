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

module.exports = { createOrder };
