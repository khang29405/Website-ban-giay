const express = require("express");
const { body, param } = require("express-validator");
const thuongHieuController = require("../controllers/thuongHieuController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const bodyValidation = [
    body("TenThuongHieu")
        .trim()
        .notEmpty()
        .withMessage("Tên thương hiệu không được để trống")
        .isLength({ max: 100 })
        .withMessage("Tên thương hiệu tối đa 100 ký tự"),
];

/**
 * @swagger
 * tags:
 *   name: ThuongHieu
 *   description: Quan ly thuong hieu san pham
 */

/**
 * @swagger
 * /thuong-hieu:
 *   get:
 *     summary: Lay danh sach thuong hieu
 *     tags: [ThuongHieu]
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
 *                     $ref: '#/components/schemas/ThuongHieu'
 */
router.get("/", thuongHieuController.getAll);

/**
 * @swagger
 * /thuong-hieu/{id}:
 *   get:
 *     summary: Lay chi tiet 1 thuong hieu
 *     tags: [ThuongHieu]
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
 *                   $ref: '#/components/schemas/ThuongHieu'
 *       404:
 *         description: Khong tim thay thuong hieu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", idParamValidation, thuongHieuController.getById);

/**
 * @swagger
 * /thuong-hieu:
 *   post:
 *     summary: Tao thuong hieu moi (chi Admin)
 *     tags: [ThuongHieu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenThuongHieu]
 *             properties:
 *               TenThuongHieu:
 *                 type: string
 *                 example: Nike
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
 *                   $ref: '#/components/schemas/ThuongHieu'
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
 *       409:
 *         description: Ten thuong hieu da ton tai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", verifyToken, requireRole("Admin"), bodyValidation, thuongHieuController.create);

/**
 * @swagger
 * /thuong-hieu/{id}:
 *   put:
 *     summary: Cap nhat thuong hieu (chi Admin)
 *     tags: [ThuongHieu]
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
 *             required: [TenThuongHieu]
 *             properties:
 *               TenThuongHieu:
 *                 type: string
 *                 example: Nike
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
 *                   $ref: '#/components/schemas/ThuongHieu'
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
 *         description: Khong tim thay thuong hieu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ten thuong hieu da ton tai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyToken, requireRole("Admin"), [...idParamValidation, ...bodyValidation], thuongHieuController.update);

/**
 * @swagger
 * /thuong-hieu/{id}:
 *   delete:
 *     summary: Xoa thuong hieu (chi Admin)
 *     tags: [ThuongHieu]
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
 *         description: Khong tim thay thuong hieu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dang co san pham su dung thuong hieu nay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyToken, requireRole("Admin"), idParamValidation, thuongHieuController.remove);

module.exports = router;
