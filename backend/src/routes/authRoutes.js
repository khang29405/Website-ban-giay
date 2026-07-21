const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

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

router.post(
    "/login",
    [
        body("Email").trim().isEmail().withMessage("Email không hợp lệ"),
        body("MatKhau").notEmpty().withMessage("Mật khẩu không được để trống"),
    ],
    authController.login
);

module.exports = router;
