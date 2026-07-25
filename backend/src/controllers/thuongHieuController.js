const { validationResult } = require("express-validator");
const thuongHieuService = require("../services/thuongHieuService");

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
        const items = await thuongHieuService.getAll();
        res.json({ success: true, data: items });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        handleValidation(req);
        const item = await thuongHieuService.getById(req.params.id);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        handleValidation(req);
        const item = await thuongHieuService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        handleValidation(req);
        const item = await thuongHieuService.update(req.params.id, req.body);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        handleValidation(req);
        await thuongHieuService.remove(req.params.id);
        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove };
