const { validationResult } = require("express-validator");
const userService = require("../services/userService");

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
        const { vaiTro, q } = req.query;
        const users = await userService.getAll({ vaiTro, q });
        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
}

async function updateRole(req, res, next) {
    try {
        handleValidation(req);
        const user = await userService.updateRole(req.params.id, req.body.VaiTro, req.user.maND);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

async function setLocked(req, res, next) {
    try {
        handleValidation(req);
        const user = await userService.setLocked(req.params.id, req.body.DaKhoa, req.user.maND);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, updateRole, setLocked };
