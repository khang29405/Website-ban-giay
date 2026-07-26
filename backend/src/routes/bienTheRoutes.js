const express = require("express");
const { body, param } = require("express-validator");
const bienTheController = require("../controllers/bienTheController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const bodyValidation = [
    body("KichCo").trim().notEmpty().withMessage("Kích cỡ không được để trống").isLength({ max: 10 }).withMessage("Kích cỡ tối đa 10 ký tự"),
    body("MauSac").trim().notEmpty().withMessage("Màu sắc không được để trống").isLength({ max: 50 }).withMessage("Màu sắc tối đa 50 ký tự"),
    body("SoLuongTon").isInt({ min: 0 }).withMessage("Số lượng tồn phải là số nguyên không âm"),
];

/**
 * @swagger
 * tags:
 *   name: BienThe
 *   description: Quan ly bien the san pham (size, mau, ton kho)
 */

/**
 * @swagger
 * /bien-the/{id}:
 *   get:
 *     summary: Lay chi tiet 1 bien the
 *     tags: [BienThe]
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
 *                   $ref: '#/components/schemas/BienThe'
 *       404:
 *         description: Khong tim thay bien the
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", idParamValidation, bienTheController.getById);

/**
 * @swagger
 * /bien-the/{id}:
 *   put:
 *     summary: Cap nhat bien the (chi Admin)
 *     tags: [BienThe]
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
 *             required: [KichCo, MauSac, SoLuongTon]
 *             properties:
 *               KichCo: { type: string, example: "40" }
 *               MauSac: { type: string, example: Den }
 *               SoLuongTon: { type: integer, example: 15 }
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
 *                   $ref: '#/components/schemas/BienThe'
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
 *         description: Khong tim thay bien the
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Bien the (kich co + mau sac) da ton tai cho san pham nay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyToken, requireRole("Admin"), [...idParamValidation, ...bodyValidation], bienTheController.update);

/**
 * @swagger
 * /bien-the/{id}:
 *   delete:
 *     summary: Xoa bien the (chi Admin)
 *     tags: [BienThe]
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
 *         description: Khong tim thay bien the
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dang co trong gio hang hoac don hang
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyToken, requireRole("Admin"), idParamValidation, bienTheController.remove);

module.exports = router;
