const { validationResult } = require("express-validator");
const authService = require("../services/authService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function register(req, res, next) {
    try {
        handleValidation(req);
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        handleValidation(req);
        const result = await authService.login(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login };
