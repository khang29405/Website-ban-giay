const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const SALT_ROUNDS = 10;

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function register({ HoTen, Email, MatKhau, SDT, DiaChi }) {
    const existing = await userModel.findByEmail(Email);
    if (existing) {
        throw httpError(409, "Email đã được sử dụng");
    }

    const MatKhauHash = await bcrypt.hash(MatKhau, SALT_ROUNDS);
    const user = await userModel.createUser({ HoTen, Email, MatKhauHash, SDT, DiaChi });
    return user;
}

async function login({ Email, MatKhau }) {
    const user = await userModel.findByEmail(Email);
    if (!user) {
        throw httpError(401, "Email hoặc mật khẩu không đúng");
    }

    const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
    if (!isMatch) {
        throw httpError(401, "Email hoặc mật khẩu không đúng");
    }

    const token = jwt.sign(
        { maND: user.MaND, vaiTro: user.VaiTro, email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return {
        token,
        user: {
            MaND: user.MaND,
            HoTen: user.HoTen,
            Email: user.Email,
            VaiTro: user.VaiTro,
        },
    };
}

module.exports = { register, login };
