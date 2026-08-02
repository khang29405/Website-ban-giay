const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userModel = require("../models/userModel");
const mailService = require("./mailService");
const httpError = require("../utils/httpError");

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRES_MINUTES = 15;

function hashResetToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
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

async function getProfile(maND) {
    const user = await userModel.findById(maND);
    if (!user) {
        throw httpError(404, "Không tìm thấy người dùng");
    }
    return user;
}

async function updateProfile(maND, { HoTen, SDT, DiaChi }) {
    const user = await userModel.updateUser(maND, { HoTen, SDT, DiaChi });
    if (!user) {
        throw httpError(404, "Không tìm thấy người dùng");
    }
    return user;
}

async function changePassword(maND, { MatKhauCu, MatKhauMoi }) {
    const hash = await userModel.getPasswordHash(maND);
    if (!hash) {
        throw httpError(404, "Không tìm thấy người dùng");
    }

    const isMatch = await bcrypt.compare(MatKhauCu, hash);
    if (!isMatch) {
        throw httpError(401, "Mật khẩu hiện tại không đúng");
    }

    if (MatKhauMoi === MatKhauCu) {
        throw httpError(400, "Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    const newHash = await bcrypt.hash(MatKhauMoi, SALT_ROUNDS);
    await userModel.updatePassword(maND, newHash);
}

// Luon tra ve thanh cong du Email co ton tai hay khong, tranh lo tai khoan nao dang dung
// (user enumeration). Chi thuc su tao token + gui mail khi tim thay user.
async function forgotPassword(email) {
    const user = await userModel.findByEmail(email);
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);
    await userModel.setResetToken(user.MaND, hashResetToken(rawToken), expiry);

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:8080"}/html/reset-password.html?token=${rawToken}`;
    try {
        await mailService.sendResetPasswordEmail({
            to: user.Email,
            hoTen: user.HoTen,
            resetUrl,
            expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES,
        });
    } catch (err) {
        console.error("Gửi email đặt lại mật khẩu thất bại:", err.message);
    }
}

async function resetPassword(token, matKhauMoi) {
    const user = await userModel.findByResetToken(hashResetToken(token));
    if (!user) {
        throw httpError(400, "Token không hợp lệ hoặc đã hết hạn");
    }

    const newHash = await bcrypt.hash(matKhauMoi, SALT_ROUNDS);
    await userModel.updatePasswordAndClearResetToken(user.MaND, newHash);
}

module.exports = { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword };
