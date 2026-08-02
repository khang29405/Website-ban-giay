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

async function me(req, res, next) {
    try {
        const user = await authService.getProfile(req.user.maND);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

async function updateMe(req, res, next) {
    try {
        handleValidation(req);
        const user = await authService.updateProfile(req.user.maND, req.body);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        handleValidation(req);
        await authService.changePassword(req.user.maND, req.body);
        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

async function quenMatKhau(req, res, next) {
    try {
        handleValidation(req);
        await authService.forgotPassword(req.body.Email);
        res.json({
            success: true,
            message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu",
        });
    } catch (err) {
        next(err);
    }
}

async function datLaiMatKhau(req, res, next) {
    try {
        handleValidation(req);
        await authService.resetPassword(req.body.Token, req.body.MatKhauMoi);
        res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, me, updateMe, changePassword, quenMatKhau, datLaiMatKhau };
