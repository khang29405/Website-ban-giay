const express = require("express");
const { body, param, query } = require("express-validator");
const sanPhamController = require("../controllers/sanPhamController");
const bienTheController = require("../controllers/bienTheController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");
const optionalAuth = require("../middlewares/optionalAuth");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const bodyValidation = [
    body("TenSP").trim().notEmpty().withMessage("Tên sản phẩm không được để trống").isLength({ max: 200 }).withMessage("Tên sản phẩm tối đa 200 ký tự"),
    body("Gia").isFloat({ min: 0 }).withMessage("Giá phải là số không âm"),
    body("MoTa").optional({ values: "falsy" }).isString(),
    body("HinhAnh").optional({ values: "falsy" }).isString().isLength({ max: 255 }).withMessage("Đường dẫn hình ảnh tối đa 255 ký tự"),
    body("MaDM").isInt({ min: 1 }).withMessage("Danh mục không hợp lệ"),
    body("MaTH").isInt({ min: 1 }).withMessage("Thương hiệu không hợp lệ"),
];

const trangThaiValidation = [body("TrangThai").isBoolean().withMessage("TrangThai phải là true/false")];

const bienTheBodyValidation = [
    body("KichCo").trim().notEmpty().withMessage("Kích cỡ không được để trống").isLength({ max: 10 }).withMessage("Kích cỡ tối đa 10 ký tự"),
    body("MauSac").trim().notEmpty().withMessage("Màu sắc không được để trống").isLength({ max: 50 }).withMessage("Màu sắc tối đa 50 ký tự"),
    body("SoLuongTon").isInt({ min: 0 }).withMessage("Số lượng tồn phải là số nguyên không âm"),
];

const searchValidation = [
    query("ten").optional({ values: "falsy" }).isString().trim().isLength({ max: 200 }).withMessage("Từ khóa tìm kiếm tối đa 200 ký tự"),
    query("danhMuc").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("danhMuc không hợp lệ"),
    query("thuongHieu").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("thuongHieu không hợp lệ"),
    query("sapXep").optional({ values: "falsy" }).isIn(["gia_tang", "gia_giam"]).withMessage("sapXep không hợp lệ"),
    query("page").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("page phải là số nguyên dương"),
    query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100"),
];

/**
 * @swagger
 * tags:
 *   name: SanPham
 *   description: Quan ly san pham
 */

/**
 * @swagger
 * /san-pham:
 *   get:
 *     summary: Lay danh sach san pham, co the tim kiem/loc
 *     tags: [SanPham]
 *     parameters:
 *       - in: query
 *         name: ten
 *         schema: { type: string }
 *         description: Tim theo ten san pham (khong phan biet hoa thuong, khop mot phan)
 *         example: nike
 *       - in: query
 *         name: danhMuc
 *         schema: { type: integer }
 *         description: Loc theo MaDM
 *       - in: query
 *         name: thuongHieu
 *         schema: { type: integer }
 *         description: Loc theo MaTH
 *       - in: query
 *         name: sapXep
 *         schema: { type: string, enum: [gia_tang, gia_giam] }
 *         description: Sap xep theo gia tang dan hoac giam dan
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *         description: >
 *           So trang (bat dau tu 1). Neu KHONG truyen page, tra ve TOAN BO ket qua (mang, khong co phan trang) -
 *           dung cho cac noi can lay het du lieu (vd san pham lien quan). Neu CO truyen page thi bat buoc phan trang,
 *           response se co them truong `pagination`.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 12 }
 *         description: So san pham moi trang (chi co tac dung khi co truyen page)
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
 *                     $ref: '#/components/schemas/SanPham'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Tham so tim kiem khong hop le
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 */
router.get("/", optionalAuth, searchValidation, sanPhamController.getAll);


/**
 * @swagger
 * /san-pham/{id}:
 *   get:
 *     summary: Lay chi tiet 1 san pham
 *     tags: [SanPham]
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
 *                   $ref: '#/components/schemas/SanPham'
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", optionalAuth, idParamValidation, sanPhamController.getById);

/**
 * @swagger
 * /san-pham:
 *   post:
 *     summary: Tao san pham moi (chi Admin)
 *     tags: [SanPham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenSP, Gia, MaDM, MaTH]
 *             properties:
 *               TenSP: { type: string, example: Nike Air Max 270 }
 *               MoTa: { type: string, example: Giay the thao dem khi em ai }
 *               Gia: { type: number, example: 3200000 }
 *               HinhAnh: { type: string, example: https://example.com/anh.jpg }
 *               MaDM: { type: integer, example: 1 }
 *               MaTH: { type: integer, example: 1 }
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
 *                   $ref: '#/components/schemas/SanPham'
 *       400:
 *         description: Du lieu khong hop le hoac danh muc/thuong hieu khong ton tai
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
router.post("/", verifyToken, requireRole("Admin"), bodyValidation, sanPhamController.create);

/**
 * @swagger
 * /san-pham/{id}:
 *   put:
 *     summary: Cap nhat san pham (chi Admin)
 *     tags: [SanPham]
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
 *             required: [TenSP, Gia, MaDM, MaTH]
 *             properties:
 *               TenSP: { type: string, example: Nike Air Max 270 }
 *               MoTa: { type: string, example: Giay the thao dem khi em ai }
 *               Gia: { type: number, example: 3200000 }
 *               HinhAnh: { type: string, example: https://example.com/anh.jpg }
 *               MaDM: { type: integer, example: 1 }
 *               MaTH: { type: integer, example: 1 }
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
 *                   $ref: '#/components/schemas/SanPham'
 *       400:
 *         description: Du lieu khong hop le hoac danh muc/thuong hieu khong ton tai
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
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyToken, requireRole("Admin"), [...idParamValidation, ...bodyValidation], sanPhamController.update);

/**
 * @swagger
 * /san-pham/{id}/trang-thai:
 *   patch:
 *     summary: An hoac hien lai san pham (chi Admin)
 *     tags: [SanPham]
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
 *             required: [TrangThai]
 *             properties:
 *               TrangThai:
 *                 type: boolean
 *                 description: "true = dang ban, false = an/ngung ban"
 *                 example: false
 *     responses:
 *       200:
 *         description: Cap nhat trang thai thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
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
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/trang-thai", verifyToken, requireRole("Admin"), [...idParamValidation, ...trangThaiValidation], sanPhamController.setTrangThai);

/**
 * @swagger
 * /san-pham/{id}:
 *   delete:
 *     summary: Xoa san pham (chi Admin)
 *     tags: [SanPham]
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
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dang co bien the hoac don hang lien quan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyToken, requireRole("Admin"), idParamValidation, sanPhamController.remove);

/**
 * @swagger
 * /san-pham/{id}/bien-the:
 *   get:
 *     summary: Lay danh sach bien the (size/mau/ton kho) cua 1 san pham
 *     tags: [SanPham]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: MaSP
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
 *                     $ref: '#/components/schemas/BienThe'
 *       404:
 *         description: Khong tim thay san pham
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id/bien-the", idParamValidation, bienTheController.getByProductId);

/**
 * @swagger
 * /san-pham/{id}/bien-the:
 *   post:
 *     summary: Them bien the moi cho san pham (chi Admin)
 *     tags: [SanPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: MaSP
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
 *               SoLuongTon: { type: integer, example: 20 }
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
 *         description: Khong tim thay san pham
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
router.post("/:id/bien-the", verifyToken, requireRole("Admin"), [...idParamValidation, ...bienTheBodyValidation], bienTheController.create);

module.exports = router;
