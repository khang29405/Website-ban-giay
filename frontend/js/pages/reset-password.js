const resetToken = new URLSearchParams(window.location.search).get("token");
const resetForm = document.getElementById("reset-password-form");
const errorBox = document.getElementById("form-error");

if (!resetToken) {
    document.getElementById("auth-subtitle").textContent = "Liên kết không hợp lệ hoặc đã thiếu thông tin.";
    resetForm.hidden = true;
    errorBox.textContent = 'Vui lòng yêu cầu link đặt lại mật khẩu mới tại trang "Quên mật khẩu".';
    errorBox.hidden = false;
    document.getElementById("auth-switch").innerHTML = '<a href="quen-mat-khau.html">Yêu cầu link mới</a>';
} else {
    attachLiveValidation(resetForm);

    function validateResetPasswordForm(form) {
        clearFormErrors(form);
        let valid = true;

        const password = form.MatKhauMoi.value;
        if (!password) {
            showFieldError(form.MatKhauMoi, "Vui lòng nhập mật khẩu mới");
            valid = false;
        } else if (password.length < 6) {
            showFieldError(form.MatKhauMoi, "Mật khẩu tối thiểu 6 ký tự");
            valid = false;
        }

        const confirmPassword = form.XacNhanMatKhau.value;
        if (!confirmPassword) {
            showFieldError(form.XacNhanMatKhau, "Vui lòng xác nhận mật khẩu");
            valid = false;
        } else if (confirmPassword !== password) {
            showFieldError(form.XacNhanMatKhau, "Mật khẩu xác nhận không khớp");
            valid = false;
        }

        return valid;
    }

    resetForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const successBox = document.getElementById("form-success");
        errorBox.hidden = true;
        successBox.hidden = true;

        if (!validateResetPasswordForm(form)) return;

        try {
            await apiPost("/auth/dat-lai-mat-khau", {
                Token: resetToken,
                MatKhauMoi: form.MatKhauMoi.value,
            });
            window.location.href = "login.html?reset=1";
        } catch (err) {
            errorBox.textContent = err.message || "Đặt lại mật khẩu thất bại";
            errorBox.hidden = false;
        }
    });
}
