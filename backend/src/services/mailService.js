const transporter = require("../config/mailer");

function resetPasswordTemplate({ hoTen, resetUrl, expiresInMinutes }) {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1f1f1f;">
        <h2 style="color: #ff6600;">MyShoes</h2>
        <p>Xin chào ${hoTen || "bạn"},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản MyShoes gắn với email này.</p>
        <p style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background: #ff6600; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Đặt lại mật khẩu
            </a>
        </p>
        <p>Liên kết có hiệu lực trong <strong>${expiresInMinutes} phút</strong>. Nếu nút bấm không hoạt động, sao chép đường dẫn sau vào trình duyệt:</p>
        <p style="word-break: break-all; color: #555;">${resetUrl}</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — mật khẩu của bạn vẫn an toàn.</p>
        <p style="margin-top: 32px; color: #888; font-size: 12px;">Email tự động từ MyShoes, vui lòng không trả lời.</p>
    </div>`;
}

async function sendResetPasswordEmail({ to, hoTen, resetUrl, expiresInMinutes = 15 }) {
    await transporter.sendMail({
        from: `"MyShoes" <${process.env.SMTP_USER}>`,
        to,
        subject: "Đặt lại mật khẩu MyShoes",
        html: resetPasswordTemplate({ hoTen, resetUrl, expiresInMinutes }),
    });
}

module.exports = { sendResetPasswordEmail };
