const { validationResult } = require("express-validator");
const lienHeService = require("../services/lienHeService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function create(req, res, next) {
    try {
        handleValidation(req);
        const item = await lienHeService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function getAll(req, res, next) {
    try {
        handleValidation(req);
        const { daXuLy, q, page, limit } = req.query;
        const result = await lienHeService.getAll({ daXuLy, q, page, limit });

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

async function updateDaXuLy(req, res, next) {
    try {
        handleValidation(req);
        const item = await lienHeService.updateDaXuLy(req.params.id, req.body.DaXuLy);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

module.exports = { create, getAll, updateDaXuLy };
