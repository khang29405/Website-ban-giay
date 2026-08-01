const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

function handleUpload(req, res, next) {
    upload.single("anh")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            const message = err.code === "LIMIT_FILE_SIZE" ? "Ảnh vượt quá dung lượng tối đa 5MB" : err.message;
            return res.status(400).json({ success: false, message });
        }
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}

/**
 * @swagger
 * /upload/anh:
 *   post:
 *     summary: Upload 1 anh len Cloudinary, tra ve URL de dung cho truong HinhAnh cua san pham
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               anh:
 *                 type: string
 *                 format: binary
 *             required: [anh]
 *     responses:
 *       201:
 *         description: Upload thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: "https://res.cloudinary.com/demo/image/upload/v1/shoestore/san-pham/abc123.jpg" }
 *       400:
 *         description: Thieu file, sai dinh dang (chi nhan JPG/PNG/WEBP/GIF) hoac vuot qua 5MB
 *       401:
 *         description: Thieu token hoac token khong hop le
 *       403:
 *         description: Khong co quyen (chi Admin)
 *       502:
 *         description: Cloudinary tu choi/loi khi upload
 */
router.post("/anh", verifyToken, requireRole("Admin"), handleUpload, uploadController.uploadAnh);

module.exports = router;
