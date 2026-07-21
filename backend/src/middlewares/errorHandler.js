function errorHandler(err, req, res, next) {
    console.error(err);
    const status = err.status || 500;
    const body = {
        success: false,
        message: err.message || "Lỗi máy chủ",
    };
    if (err.errors) {
        body.errors = err.errors;
    }
    res.status(status).json(body);
}

module.exports = errorHandler;
