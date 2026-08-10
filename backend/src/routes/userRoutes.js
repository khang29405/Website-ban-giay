const express = require("express");
const { body, param, query } = require("express-validator");
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const listValidation = [
    query("vaiTro").optional({ values: "falsy" }).isIn(["KhachHang", "NhanVien", "Admin"]).withMessage("vaiTro không hợp lệ"),
    query("q").optional({ values: "falsy" }).isString().trim().isLength({ max: 100 }).withMessage("Từ khóa tìm kiếm tối đa 100 ký tự"),
    query("page").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("page phải là số nguyên dương"),
    query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100"),
];

const roleValidation = [
    body("VaiTro").isIn(["KhachHang", "NhanVien", "Admin"]).withMessage("VaiTro không hợp lệ"),
];

const lockValidation = [body("DaKhoa").isBoolean().withMessage("DaKhoa phải là true/false")];

/**
 * @swagger
 * /nguoi-dung:
 *   get:
 *     summary: Danh sach tai khoan nguoi dung (chi Admin)
 *     description: >
 *       Neu KHONG truyen page thi tra ve TOAN BO ket qua (mang, khong phan trang). Neu CO truyen page thi bat
 *       buoc phan trang, response se co them truong `pagination`.
 *     tags: [NguoiDung]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vaiTro
 *         schema: { type: string, enum: [KhachHang, NhanVien, Admin] }
 *         description: Loc theo vai tro
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Tim theo ho ten hoac email (khop mot phan)
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
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
 *                     $ref: '#/components/schemas/NguoiDung'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
router.get("/", verifyToken, requireRole("Admin"), listValidation, userController.getAll);

/**
 * @swagger
 * /nguoi-dung/{id}/vai-tro:
 *   patch:
 *     summary: Doi vai tro cua 1 tai khoan (chi Admin, khong the tu doi vai tro chinh minh)
 *     tags: [NguoiDung]
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
 *             required: [VaiTro]
 *             properties:
 *               VaiTro:
 *                 type: string
 *                 enum: [KhachHang, NhanVien, Admin]
 *     responses:
 *       200:
 *         description: Doi vai tro thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/NguoiDung'
 *       400:
 *         description: Du lieu khong hop le hoac tu doi vai tro chinh minh
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
 *         description: Khong tim thay nguoi dung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/vai-tro", verifyToken, requireRole("Admin"), [...idParamValidation, ...roleValidation], userController.updateRole);

/**
 * @swagger
 * /nguoi-dung/{id}/khoa:
 *   patch:
 *     summary: Khoa/mo khoa 1 tai khoan (chi Admin, khong the tu khoa chinh minh)
 *     tags: [NguoiDung]
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
 *             required: [DaKhoa]
 *             properties:
 *               DaKhoa:
 *                 type: boolean
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
 *                   $ref: '#/components/schemas/NguoiDung'
 *       400:
 *         description: Du lieu khong hop le hoac tu khoa chinh minh
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
 *         description: Khong tim thay nguoi dung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/khoa", verifyToken, requireRole("Admin"), [...idParamValidation, ...lockValidation], userController.setLocked);

module.exports = router;
