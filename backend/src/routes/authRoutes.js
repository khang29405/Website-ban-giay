const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

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
 *       403:
 *         description: Tai khoan da bi Admin khoa
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Lay thong tin ca nhan cua tai khoan dang dang nhap
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thong tin tai khoan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     MaND: { type: integer, example: 1 }
 *                     HoTen: { type: string, example: Nguyen Van A }
 *                     Email: { type: string, example: a@test.com }
 *                     SDT: { type: string, nullable: true, example: "0901234567" }
 *                     DiaChi: { type: string, nullable: true, example: 123 Nguyen Trai, Q1, TP.HCM }
 *                     VaiTro: { type: string, example: KhachHang }
 *                     NgayTao: { type: string, format: date-time }
 *       401:
 *         description: Chua dang nhap hoac token khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", verifyToken, authController.me);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Cap nhat thong tin ca nhan (ho ten, SDT, dia chi)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [HoTen]
 *             properties:
 *               HoTen:
 *                 type: string
 *                 example: Nguyen Van A
 *               SDT:
 *                 type: string
 *                 example: "0901234567"
 *               DiaChi:
 *                 type: string
 *                 example: 123 Nguyen Trai, Q1, TP.HCM
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
 *                   type: object
 *                   properties:
 *                     MaND: { type: integer, example: 1 }
 *                     HoTen: { type: string, example: Nguyen Van A }
 *                     Email: { type: string, example: a@test.com }
 *                     SDT: { type: string, nullable: true, example: "0901234567" }
 *                     DiaChi: { type: string, nullable: true, example: 123 Nguyen Trai, Q1, TP.HCM }
 *                     VaiTro: { type: string, example: KhachHang }
 *                     NgayTao: { type: string, format: date-time }
 *       400:
 *         description: Du lieu khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chua dang nhap hoac token khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    "/me",
    verifyToken,
    [
        body("HoTen").trim().notEmpty().withMessage("Họ tên không được để trống").isLength({ max: 100 }).withMessage("Họ tên tối đa 100 ký tự"),
        body("SDT").optional({ values: "falsy" }).isMobilePhone("vi-VN").withMessage("Số điện thoại không hợp lệ"),
        body("DiaChi").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("Địa chỉ tối đa 255 ký tự"),
    ],
    authController.updateMe
);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Doi mat khau cho tai khoan dang dang nhap
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MatKhauCu, MatKhauMoi]
 *             properties:
 *               MatKhauCu:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               MatKhauMoi:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Doi mat khau thanh cong
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
 *         description: Chua dang nhap hoac mat khau hien tai khong dung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    "/change-password",
    verifyToken,
    [
        body("MatKhauCu").notEmpty().withMessage("Vui lòng nhập mật khẩu hiện tại"),
        body("MatKhauMoi").isLength({ min: 6 }).withMessage("Mật khẩu mới tối thiểu 6 ký tự"),
    ],
    authController.changePassword
);

/**
 * @swagger
 * /auth/quen-mat-khau:
 *   post:
 *     summary: Gui email dat lai mat khau (khong yeu cau dang nhap)
 *     description: >
 *       Luon tra ve 200 voi cung 1 thong bao du Email co ton tai trong he thong hay khong
 *       (tranh lo email nao da dang ky). Neu ton tai, mot link dat lai mat khau (chua token,
 *       het han sau 15 phut) se duoc gui qua email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Email]
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: a@test.com
 *     responses:
 *       200:
 *         description: Da xu ly yeu cau (khong tiet lo email co ton tai hay khong)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu" }
 *       400:
 *         description: Du lieu khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/quen-mat-khau",
    [body("Email").trim().isEmail().withMessage("Email không hợp lệ")],
    authController.quenMatKhau
);

/**
 * @swagger
 * /auth/dat-lai-mat-khau:
 *   post:
 *     summary: Dat lai mat khau bang token nhan tu email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Token, MatKhauMoi]
 *             properties:
 *               Token:
 *                 type: string
 *                 example: 3f2a8e1c9b7d4a6f5e0c1b2a3d4e5f6a...
 *               MatKhauMoi:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Dat lai mat khau thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Đặt lại mật khẩu thành công" }
 *       400:
 *         description: Du lieu khong hop le, hoac token khong hop le/da het han
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/dat-lai-mat-khau",
    [
        body("Token").notEmpty().withMessage("Thiếu token"),
        body("MatKhauMoi").isLength({ min: 6 }).withMessage("Mật khẩu mới tối thiểu 6 ký tự"),
    ],
    authController.datLaiMatKhau
);

module.exports = router;
