const express = require("express");
const { body, param } = require("express-validator");
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
 *     tags: [DonHang]
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
 *                     $ref: '#/components/schemas/DonHang'
 *       401:
 *         description: Chua dang nhap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", verifyToken, donHangController.getAll);

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
 *       Neu chuyen trang thai sang DaHuy thi tu dong hoan lai ton kho cho cac bien the trong don hang do.
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
