const express = require("express");
const { body, param, query } = require("express-validator");
const lienHeController = require("../controllers/lienHeController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const createValidation = [
    body("HoTen").trim().notEmpty().withMessage("Họ tên không được để trống").isLength({ max: 100 }).withMessage("Họ tên tối đa 100 ký tự"),
    body("Email").trim().isEmail().withMessage("Email không hợp lệ").isLength({ max: 100 }).withMessage("Email tối đa 100 ký tự"),
    body("NoiDung")
        .trim()
        .notEmpty()
        .withMessage("Nội dung không được để trống")
        .isLength({ max: 1000 })
        .withMessage("Nội dung tối đa 1000 ký tự"),
];

const listValidation = [
    query("daXuLy").optional({ values: "falsy" }).isBoolean().withMessage("daXuLy phải là true/false"),
    query("page").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("page phải là số nguyên dương"),
    query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100"),
];

const daXuLyValidation = [body("DaXuLy").isBoolean().withMessage("DaXuLy phải là true/false")];

/**
 * @swagger
 * /lien-he:
 *   post:
 *     summary: Gui loi nhan tu trang Lien he (Public)
 *     tags: [LienHe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [HoTen, Email, NoiDung]
 *             properties:
 *               HoTen: { type: string, example: "Nguyen Van A" }
 *               Email: { type: string, example: "a@test.com" }
 *               NoiDung: { type: string, example: "Toi muon hoi ve size giay..." }
 *     responses:
 *       201:
 *         description: Da gui thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/LienHe'
 *       400:
 *         description: Du lieu khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", createValidation, lienHeController.create);

/**
 * @swagger
 * /lien-he:
 *   get:
 *     summary: Xem danh sach loi nhan lien he (Admin, NhanVien)
 *     description: >
 *       Neu KHONG truyen page thi tra ve TOAN BO ket qua (mang, khong phan trang). Neu CO truyen page thi bat
 *       buoc phan trang, response se co them truong `pagination`.
 *     tags: [LienHe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daXuLy
 *         schema: { type: boolean }
 *         description: Loc theo trang thai da xu ly hay chua
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
 *                     $ref: '#/components/schemas/LienHe'
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
router.get("/", verifyToken, requireRole("Admin", "NhanVien"), listValidation, lienHeController.getAll);

/**
 * @swagger
 * /lien-he/{id}/trang-thai:
 *   patch:
 *     summary: Danh dau da xu ly / chua xu ly (Admin, NhanVien)
 *     tags: [LienHe]
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
 *             required: [DaXuLy]
 *             properties:
 *               DaXuLy: { type: boolean, example: true }
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
 *                   $ref: '#/components/schemas/LienHe'
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
 *         description: Khong tim thay loi nhan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/trang-thai", verifyToken, requireRole("Admin", "NhanVien"), [...idParamValidation, ...daXuLyValidation], lienHeController.updateDaXuLy);

module.exports = router;
