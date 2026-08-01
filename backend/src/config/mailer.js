const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true cho port 465, false cho 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Khong throw neu SMTP chua cau hinh/sai - chi log canh bao, de cac chuc nang
// khac cua backend (khong lien quan email) van chay binh thuong.
transporter.verify().then(
    () => console.log("Đã kết nối SMTP, sẵn sàng gửi email"),
    (err) => console.error("Lỗi kết nối SMTP:", err.message)
);

module.exports = transporter;
