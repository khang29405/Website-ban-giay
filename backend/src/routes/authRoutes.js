const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Dang ky, dang nhap va xac thuc JWT
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Dang ky tai khoan khach hang
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [HoTen, Email, MatKhau]
 *             properties:
 *               HoTen:
 *                 type: string
 *                 example: Nguyen Van A
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: a@test.com
 *               MatKhau:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *               SDT:
 *                 type: string
 *                 example: "0901234567"
 *               DiaChi:
 *                 type: string
 *                 example: 123 Nguyen Trai, Q1, TP.HCM
 *     responses:
 *       201:
 *         description: Dang ky thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     MaND: { type: integer, example: 1 }
 *                     HoTen: { type: string, example: Nguyen Van A }
 *                     Email: { type: string, example: a@test.com }
 *                     VaiTro: { type: string, example: KhachHang }
 *                     NgayTao: { type: string, format: date-time }
 *       400:
 *         description: Du lieu khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email da duoc su dung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/register",
    [
        body("HoTen").trim().notEmpty().withMessage("Họ tên không được để trống").isLength({ max: 100 }).withMessage("Họ tên tối đa 100 ký tự"),
        body("Email").trim().isEmail().withMessage("Email không hợp lệ").isLength({ max: 100 }).withMessage("Email tối đa 100 ký tự"),
        body("MatKhau").isLength({ min: 6 }).withMessage("Mật khẩu tối thiểu 6 ký tự"),
        body("SDT").optional({ values: "falsy" }).isMobilePhone("vi-VN").withMessage("Số điện thoại không hợp lệ"),
        body("DiaChi").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("Địa chỉ tối đa 255 ký tự"),
    ],
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Dang nhap, tra ve JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Email, MatKhau]
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: a@test.com
 *               MatKhau:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Dang nhap thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         MaND: { type: integer, example: 1 }
 *                         HoTen: { type: string, example: Nguyen Van A }
 *                         Email: { type: string, example: a@test.com }
 *                         VaiTro: { type: string, example: KhachHang }
 *       400:
 *         description: Du lieu khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Email hoac mat khau khong dung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/login",
    [
        body("Email").trim().isEmail().withMessage("Email không hợp lệ"),
        body("MatKhau").notEmpty().withMessage("Mật khẩu không được để trống"),
    ],
    authController.login
);

module.exports = router;
