const express = require("express");
const { body, param } = require("express-validator");
const sanPhamController = require("../controllers/sanPhamController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const bodyValidation = [
    body("TenSP").trim().notEmpty().withMessage("Tên sản phẩm không được để trống").isLength({ max: 200 }).withMessage("Tên sản phẩm tối đa 200 ký tự"),
    body("Gia").isFloat({ min: 0 }).withMessage("Giá phải là số không âm"),
    body("MoTa").optional({ values: "falsy" }).isString(),
    body("HinhAnh").optional({ values: "falsy" }).isString().isLength({ max: 255 }).withMessage("Đường dẫn hình ảnh tối đa 255 ký tự"),
    body("MaDM").isInt({ min: 1 }).withMessage("Danh mục không hợp lệ"),
    body("MaTH").isInt({ min: 1 }).withMessage("Thương hiệu không hợp lệ"),
];

const trangThaiValidation = [body("TrangThai").isBoolean().withMessage("TrangThai phải là true/false")];

/**
 * @swagger
 * tags:
 *   name: SanPham
 *   description: Quan ly san pham
 */

/**
 * @swagger
 * /san-pham:
 *   get:
 *     summary: Lay danh sach san pham
 *     tags: [SanPham]
 *     responses:
 *       200:
 *         description: Thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SanPham'
 */
router.get("/", sanPhamController.getAll);

/**
 * @swagger
 * /san-pham/{id}:
 *   get:
 *     summary: Lay chi tiet 1 san pham
 *     tags: [SanPham]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", idParamValidation, sanPhamController.getById);

/**
 * @swagger
 * /san-pham:
 *   post:
 *     summary: Tao san pham moi (chi Admin)
 *     tags: [SanPham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenSP, Gia, MaDM, MaTH]
 *             properties:
 *               TenSP: { type: string, example: Nike Air Max 270 }
 *               MoTa: { type: string, example: Giay the thao dem khi em ai }
 *               Gia: { type: number, example: 3200000 }
 *               HinhAnh: { type: string, example: https://example.com/anh.jpg }
 *               MaDM: { type: integer, example: 1 }
 *               MaTH: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Tao thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       400:
 *         description: Du lieu khong hop le hoac danh muc/thuong hieu khong ton tai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Khong co quyen (khong phai Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", verifyToken, requireRole("Admin"), bodyValidation, sanPhamController.create);

/**
 * @swagger
 * /san-pham/{id}:
 *   put:
 *     summary: Cap nhat san pham (chi Admin)
 *     tags: [SanPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenSP, Gia, MaDM, MaTH]
 *             properties:
 *               TenSP: { type: string, example: Nike Air Max 270 }
 *               MoTa: { type: string, example: Giay the thao dem khi em ai }
 *               Gia: { type: number, example: 3200000 }
 *               HinhAnh: { type: string, example: https://example.com/anh.jpg }
 *               MaDM: { type: integer, example: 1 }
 *               MaTH: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Cap nhat thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       400:
 *         description: Du lieu khong hop le hoac danh muc/thuong hieu khong ton tai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Khong co quyen (khong phai Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyToken, requireRole("Admin"), [...idParamValidation, ...bodyValidation], sanPhamController.update);

/**
 * @swagger
 * /san-pham/{id}/trang-thai:
 *   patch:
 *     summary: An hoac hien lai san pham (chi Admin)
 *     tags: [SanPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TrangThai]
 *             properties:
 *               TrangThai:
 *                 type: boolean
 *                 description: "true = dang ban, false = an/ngung ban"
 *                 example: false
 *     responses:
 *       200:
 *         description: Cap nhat trang thai thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       400:
 *         description: Du lieu khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Khong co quyen (khong phai Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/trang-thai", verifyToken, requireRole("Admin"), [...idParamValidation, ...trangThaiValidation], sanPhamController.setTrangThai);

/**
 * @swagger
 * /san-pham/{id}:
 *   delete:
 *     summary: Xoa san pham (chi Admin)
 *     tags: [SanPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xoa thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { nullable: true, example: null }
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Khong co quyen (khong phai Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dang co bien the hoac don hang lien quan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyToken, requireRole("Admin"), idParamValidation, sanPhamController.remove);

module.exports = router;
