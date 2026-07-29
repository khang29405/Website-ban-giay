const express = require("express");
const { body, param, query } = require("express-validator");
const donHangController = require("../controllers/donHangController");
const verifyToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

const idParamValidation = [param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ")];

const createValidation = [
    body("DiaChiGiaoHang")
        .trim()
        .notEmpty()
        .withMessage("Vui lòng nhập địa chỉ giao hàng")
        .isLength({ max: 255 })
        .withMessage("Địa chỉ giao hàng tối đa 255 ký tự"),
    body("SDTNhan").trim().isMobilePhone("vi-VN").withMessage("Số điện thoại nhận hàng không hợp lệ"),
];

const statusValidation = [
    body("TrangThai")
        .isIn(["ChoXuLy", "DangGiao", "HoanThanh", "DaHuy"])
        .withMessage("Trạng thái không hợp lệ (chỉ nhận ChoXuLy, DangGiao, HoanThanh, DaHuy)"),
    body("LyDoHuy")
        .optional({ values: "falsy" })
        .isString()
        .isLength({ max: 255 })
        .withMessage("Lý do hủy tối đa 255 ký tự"),
];

const listValidation = [
    query("trangThai")
        .optional({ values: "falsy" })
        .isIn(["ChoXuLy", "DangGiao", "HoanThanh", "DaHuy"])
        .withMessage("trangThai không hợp lệ"),
    query("maDon")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 20 })
        .withMessage("Mã đơn tìm kiếm tối đa 20 ký tự"),
    query("q")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Từ khóa tìm kiếm tối đa 100 ký tự"),
    query("page").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("page phải là số nguyên dương"),
    query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100"),
];

const directOrderValidation = [
    body("MaBienThe").isInt({ min: 1 }).withMessage("MaBienThe không hợp lệ"),
    body("SoLuong").isInt({ min: 1 }).withMessage("Số lượng phải là số nguyên dương"),
    ...createValidation,
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

/**
 * @swagger
 * /don-hang/mua-ngay:
 *   post:
 *     summary: Mua ngay 1 bien the (khong qua gio hang)
 *     description: >
 *       Dat hang truc tiep cho 1 bien the + so luong chi dinh, hoan toan KHONG dung/dung cham toi gio hang
 *       cua nguoi dung (khong them, khong xoa). Dung cho nut "Mua ngay" o trang chi tiet san pham, tranh
 *       tinh trang huy dat hang giua chung van de lai san pham trong gio hang.
 *     tags: [DonHang]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MaBienThe, SoLuong, DiaChiGiaoHang, SDTNhan]
 *             properties:
 *               MaBienThe: { type: integer, example: 1 }
 *               SoLuong: { type: integer, example: 1 }
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
 *         description: San pham het hang/ngung ban, hoac du lieu khong hop le
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
router.post("/mua-ngay", verifyToken, directOrderValidation, donHangController.createDirectOrder);

/**
 * @swagger
 * /don-hang:
 *   get:
 *     summary: Xem danh sach don hang
 *     description: >
 *       Khach hang (KhachHang) chi thay don hang cua chinh minh. Admin thay TOAN BO don hang cua moi khach hang.
 *       Neu KHONG truyen page thi tra ve TOAN BO ket qua (mang, khong phan trang). Neu CO truyen page thi bat
 *       buoc phan trang, response se co them truong `pagination`.
 *     tags: [DonHang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trangThai
 *         schema: { type: string, enum: [ChoXuLy, DangGiao, HoanThanh, DaHuy] }
 *         description: Loc theo trang thai don hang
 *       - in: query
 *         name: maDon
 *         schema: { type: string }
 *         description: >
 *           Tim theo MaDH (khop mot phan, vd "10" khop don #10 va #110 nhung KHONG khop ten/email khach hang).
 *           CHI co tac dung khi nguoi goi la Admin.
 *         example: "10"
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: >
 *           Tim theo ten khach hang hoac email (khong phan biet hoa thuong, khop mot phan). Co the dung cung
 *           luc voi maDon (AND). CHI co tac dung khi nguoi goi la Admin (khach hang tu xem don cua minh khong
 *           can tim theo ten/email).
 *         example: "nguyen"
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *         description: So trang (bat dau tu 1)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         description: So don hang moi trang (chi co tac dung khi co truyen page)
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
 *                     $ref: '#/components/schemas/DonHang'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Tham so khong hop le
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
router.get("/", verifyToken, listValidation, donHangController.getAll);

/**
 * @swagger
 * /don-hang/{id}:
 *   get:
 *     summary: Xem chi tiet 1 don hang
 *     description: Khach hang chi xem duoc don cua chinh minh (404 neu xem don nguoi khac). Admin xem duoc moi don.
 *     tags: [DonHang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: MaDH
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
 *                   $ref: '#/components/schemas/DonHang'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Khong tim thay don hang (hoac khong phai don cua ban)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", verifyToken, idParamValidation, donHangController.getById);

/**
 * @swagger
 * /don-hang/{id}/trang-thai:
 *   patch:
 *     summary: Cap nhat trang thai don hang (chi Admin)
 *     description: >
 *       Neu chuyen trang thai sang DaHuy thi bat buoc phai co LyDoHuy, va tu dong hoan lai ton kho
 *       cho cac bien the trong don hang do.
 *     tags: [DonHang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: MaDH
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TrangThai]
 *             properties:
 *               TrangThai:
 *                 type: string
 *                 enum: [ChoXuLy, DangGiao, HoanThanh, DaHuy]
 *                 example: DangGiao
 *               LyDoHuy:
 *                 type: string
 *                 description: Bat buoc khi TrangThai la DaHuy
 *                 example: Khach hang doi y, khong muon mua nua
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
 *                   $ref: '#/components/schemas/DonHang'
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
 *         description: Khong tim thay don hang
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    "/:id/trang-thai",
    verifyToken,
    requireRole("Admin"),
    [...idParamValidation, ...statusValidation],
    donHangController.updateStatus
);

module.exports = router;
