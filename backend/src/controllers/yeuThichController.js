const { validationResult } = require("express-validator");
const yeuThichService = require("../services/yeuThichService");

function handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = errors.array();
        throw err;
    }
}

async function getMyFavorites(req, res, next) {
    try {
        const items = await yeuThichService.getMyFavorites(req.user.maND);
        res.json({ success: true, data: items });
    } catch (err) {
        next(err);
    }
}

async function addFavorite(req, res, next) {
    try {
        handleValidation(req);
        await yeuThichService.addFavorite(req.user.maND, req.body.MaSP);
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

async function removeFavorite(req, res, next) {
    try {
        handleValidation(req);
        await yeuThichService.removeFavorite(req.user.maND, req.params.maSp);
        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getMyFavorites, addFavorite, removeFavorite };
