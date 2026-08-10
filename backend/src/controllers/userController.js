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
        const { vaiTro, q, page, limit } = req.query;
        const result = await userService.getAll({ vaiTro, q, page, limit });

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
