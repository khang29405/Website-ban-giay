const { validationResult } = require("express-validator");
const bienTheService = require("../services/bienTheService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function getByProductId(req, res, next) {
    try {
        handleValidation(req);
        const items = await bienTheService.getByProductId(req.params.id);
        res.json({ success: true, data: items });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        handleValidation(req);
        const item = await bienTheService.getById(req.params.id);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        handleValidation(req);
        const item = await bienTheService.create(req.params.id, req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        handleValidation(req);
        const item = await bienTheService.update(req.params.id, req.body);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        handleValidation(req);
        await bienTheService.remove(req.params.id);
        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getByProductId, getById, create, update, remove };
