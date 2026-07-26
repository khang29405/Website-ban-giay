const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const danhMucRoutes = require("./danhMucRoutes");
const thuongHieuRoutes = require("./thuongHieuRoutes");
const sanPhamRoutes = require("./sanPhamRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/danh-muc", danhMucRoutes);
router.use("/thuong-hieu", thuongHieuRoutes);
router.use("/san-pham", sanPhamRoutes);

module.exports = router;
