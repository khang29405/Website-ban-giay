function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.vaiTro)) {
            return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
        }
        next();
    };
}

module.exports = requireRole;
