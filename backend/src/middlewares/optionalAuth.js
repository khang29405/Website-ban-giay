const jwt = require("jsonwebtoken");

function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { maND: payload.maND, vaiTro: payload.vaiTro, email: payload.email };
        } catch (err) {
            // Token sai/het han: bo qua, coi nhu khach chua dang nhap thay vi chan request
        }
    }
    next();
}

module.exports = optionalAuth;
