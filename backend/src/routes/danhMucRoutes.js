const express = require("express");
const { body, param } = require("express-validator");
const danhMucController = require("../controllers/danhMucController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const bodyValidation = [
    body("TenDanhMuc")
        .trim()
        .notEmpty()
        .withMessage("Tên danh mục không được để trống")
        .isLength({ max: 100 })
        .withMessage("Tên danh mục tối đa 100 ký tự"),
];

/**
 * @swagger
 * /danh-muc:
 *   get:
 *     summary: Lay danh sach danh muc
 *     tags: [DanhMuc]
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
 *                     $ref: '#/components/schemas/DanhMuc'
 */
router.get("/", danhMucController.getAll);

/**
 * @swagger
 * /danh-muc/{id}:
 *   get:
 *     summary: Lay chi tiet 1 danh muc
 *     tags: [DanhMuc]
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
 *                   $ref: '#/components/schemas/DanhMuc'
 *       404:
 *         description: Khong tim thay danh muc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", idParamValidation, danhMucController.getById);

/**
 * @swagger
 * /danh-muc:
 *   post:
 *     summary: Tao danh muc moi (chi Admin)
 *     tags: [DanhMuc]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenDanhMuc]
 *             properties:
 *               TenDanhMuc:
 *                 type: string
 *                 example: Giay chay bo
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
 *                   $ref: '#/components/schemas/DanhMuc'
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
 */
router.post("/", verifyToken, requireRole("Admin"), bodyValidation, danhMucController.create);

/**
 * @swagger
 * /danh-muc/{id}:
 *   put:
 *     summary: Cap nhat danh muc (chi Admin)
 *     tags: [DanhMuc]
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
 *             required: [TenDanhMuc]
 *             properties:
 *               TenDanhMuc:
 *                 type: string
 *                 example: Giay chay bo
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
 *                   $ref: '#/components/schemas/DanhMuc'
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
 *         description: Khong tim thay danh muc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyToken, requireRole("Admin"), [...idParamValidation, ...bodyValidation], danhMucController.update);

/**
 * @swagger
 * /danh-muc/{id}:
 *   delete:
 *     summary: Xoa danh muc (chi Admin)
 *     tags: [DanhMuc]
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
 *         description: Khong tim thay danh muc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dang co san pham su dung danh muc nay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyToken, requireRole("Admin"), idParamValidation, danhMucController.remove);

module.exports = router;
