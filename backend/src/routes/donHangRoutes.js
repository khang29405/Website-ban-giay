const express = require("express");
const { body } = require("express-validator");
const donHangController = require("../controllers/donHangController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

const createValidation = [
    body("DiaChiGiaoHang")
        .trim()
        .notEmpty()
        .withMessage("Vui lòng nhập địa chỉ giao hàng")
        .isLength({ max: 255 })
        .withMessage("Địa chỉ giao hàng tối đa 255 ký tự"),
    body("SDTNhan").trim().isMobilePhone("vi-VN").withMessage("Số điện thoại nhận hàng không hợp lệ"),
];

/**
 * @swagger
 * tags:
 *   name: DonHang
 *   description: Dat hang tu gio hang (thanh toan COD)
 */

/**
 * @swagger
 * /don-hang:
 *   post:
 *     summary: Tao don hang moi tu toan bo gio hang hien tai
 *     description: >
 *       Lay tat ca san pham trong gio hang cua nguoi dang dang nhap, kiem tra lai ton kho va trang thai
 *       ban, tao don hang + chi tiet don hang, tru ton kho va xoa cac dong da dat khoi gio hang.
 *       Toan bo thao tac nam trong 1 transaction. Phuong thuc thanh toan mac dinh la COD.
 *     tags: [DonHang]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [DiaChiGiaoHang, SDTNhan]
 *             properties:
 *               DiaChiGiaoHang:
 *                 type: string
 *                 example: 123 Nguyen Trai, Q1, TP.HCM
 *               SDTNhan:
 *                 type: string
 *                 example: "0901234567"
 *     responses:
 *       201:
 *         description: Dat hang thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/DonHang'
 *       400:
 *         description: Gio hang trong, san pham het hang/ngung ban, hoac du lieu khong hop le
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
 */
router.post("/", verifyToken, createValidation, donHangController.createOrder);

module.exports = router;
