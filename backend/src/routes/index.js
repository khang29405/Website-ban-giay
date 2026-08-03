const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const danhMucRoutes = require("./danhMucRoutes");
const thuongHieuRoutes = require("./thuongHieuRoutes");
const sanPhamRoutes = require("./sanPhamRoutes");
const bienTheRoutes = require("./bienTheRoutes");
const gioHangRoutes = require("./gioHangRoutes");
const donHangRoutes = require("./donHangRoutes");
const lienHeRoutes = require("./lienHeRoutes");
const uploadRoutes = require("./uploadRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/danh-muc", danhMucRoutes);
router.use("/thuong-hieu", thuongHieuRoutes);
router.use("/san-pham", sanPhamRoutes);
router.use("/bien-the", bienTheRoutes);
router.use("/gio-hang", gioHangRoutes);
router.use("/don-hang", donHangRoutes);
router.use("/lien-he", lienHeRoutes);
router.use("/upload", uploadRoutes);
router.use("/nguoi-dung", userRoutes);

module.exports = router;
