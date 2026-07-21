const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Thiếu token hoặc token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { maND: payload.maND, vaiTro: payload.vaiTro, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Thiếu token hoặc token không hợp lệ" });
    }
}

module.exports = verifyToken;
