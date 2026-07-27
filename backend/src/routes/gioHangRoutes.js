const express = require("express");
const { body, param } = require("express-validator");
const gioHangController = require("../controllers/gioHangController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const addValidation = [
    body("MaBienThe").isInt({ min: 1 }).withMessage("MaBienThe không hợp lệ"),
    body("SoLuong").isInt({ min: 1 }).withMessage("Số lượng phải là số nguyên dương"),
];

const updateValidation = [body("SoLuong").isInt({ min: 1 }).withMessage("Số lượng phải là số nguyên dương")];

/**
 * @swagger
 * tags:
 *   name: GioHang
 *   description: Gio hang cua khach hang dang dang nhap
 */

/**
 * @swagger
 * /gio-hang:
 *   get:
 *     summary: Xem gio hang cua tai khoan dang dang nhap
 *     tags: [GioHang]
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
 *                     $ref: '#/components/schemas/GioHang'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", verifyToken, gioHangController.getCart);

/**
 * @swagger
 * /gio-hang:
 *   post:
 *     summary: Them bien the vao gio hang (cong don so luong neu da co)
 *     tags: [GioHang]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MaBienThe, SoLuong]
 *             properties:
 *               MaBienThe: { type: integer, example: 1 }
 *               SoLuong: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Them thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/GioHang'
 *       400:
 *         description: Du lieu khong hop le hoac vuot qua ton kho
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
 *         description: Khong tim thay bien the san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", verifyToken, addValidation, gioHangController.addToCart);

/**
 * @swagger
 * /gio-hang/{id}:
 *   put:
 *     summary: Cap nhat so luong 1 dong trong gio hang
 *     tags: [GioHang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: MaGioHang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SoLuong]
 *             properties:
 *               SoLuong: { type: integer, example: 2 }
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
 *                   $ref: '#/components/schemas/GioHang'
 *       400:
 *         description: Du lieu khong hop le hoac vuot qua ton kho
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
 *         description: Khong tim thay dong gio hang nay (hoac khong thuoc ve ban)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyToken, [...idParamValidation, ...updateValidation], gioHangController.updateQuantity);

/**
 * @swagger
 * /gio-hang/{id}:
 *   delete:
 *     summary: Xoa 1 dong khoi gio hang
 *     tags: [GioHang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: MaGioHang
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
 *         description: Khong tim thay dong gio hang nay (hoac khong thuoc ve ban)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyToken, idParamValidation, gioHangController.removeFromCart);

module.exports = router;
