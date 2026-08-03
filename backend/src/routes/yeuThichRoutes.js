const express = require("express");
const { body, param } = require("express-validator");
const yeuThichController = require("../controllers/yeuThichController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

const addValidation = [body("MaSP").isInt({ min: 1 }).withMessage("MaSP không hợp lệ")];
const maSpParamValidation = [param("maSp").isInt({ min: 1 }).withMessage("MaSP không hợp lệ")];

/**
 * @swagger
 * /yeu-thich:
 *   get:
 *     summary: Xem danh sach san pham yeu thich cua tai khoan dang dang nhap
 *     tags: [YeuThich]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/YeuThich'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", verifyToken, yeuThichController.getMyFavorites);

/**
 * @swagger
 * /yeu-thich:
 *   post:
 *     summary: Them 1 san pham vao danh sach yeu thich
 *     tags: [YeuThich]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MaSP]
 *             properties:
 *               MaSP: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Them thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { nullable: true, example: null }
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
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: San pham da co trong danh sach yeu thich
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", verifyToken, addValidation, yeuThichController.addFavorite);

/**
 * @swagger
 * /yeu-thich/{maSp}:
 *   delete:
 *     summary: Xoa 1 san pham khoi danh sach yeu thich
 *     tags: [YeuThich]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maSp
 *         required: true
 *         schema: { type: integer }
 *         description: MaSP
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
 *       404:
 *         description: San pham khong co trong danh sach yeu thich
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:maSp", verifyToken, maSpParamValidation, yeuThichController.removeFavorite);

module.exports = router;
