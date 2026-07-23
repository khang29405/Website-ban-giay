function validateRegisterForm(form) {
    clearFormErrors(form);
    let valid = true;

    const hoTen = form.HoTen.value.trim();
    if (!hoTen) {
        showFieldError(form.HoTen, "Vui lòng nhập họ tên");
        valid = false;
    } else if (hoTen.length > 100) {
        showFieldError(form.HoTen, "Họ tên tối đa 100 ký tự");
        valid = false;
    }

    const email = form.Email.value.trim();
    if (!email) {
        showFieldError(form.Email, "Vui lòng nhập email");
        valid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(form.Email, "Email không hợp lệ");
        valid = false;
    }

    const password = form.MatKhau.value;
    if (!password) {
        showFieldError(form.MatKhau, "Vui lòng nhập mật khẩu");
        valid = false;
    } else if (password.length < 6) {
        showFieldError(form.MatKhau, "Mật khẩu tối thiểu 6 ký tự");
        valid = false;
    }

    const sdt = form.SDT.value.trim();
    if (sdt && !isValidPhoneVN(sdt)) {
        showFieldError(form.SDT, "Số điện thoại không hợp lệ");
        valid = false;
    }

    const diaChi = form.DiaChi.value.trim();
    if (diaChi.length > 255) {
        showFieldError(form.DiaChi, "Địa chỉ tối đa 255 ký tự");
        valid = false;
    }

    return valid;
}

attachLiveValidation(document.getElementById("register-form"));

document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const errorBox = document.getElementById("form-error");
    errorBox.hidden = true;

    if (!validateRegisterForm(form)) return;

    const data = {
        HoTen: form.HoTen.value.trim(),
        Email: form.Email.value.trim(),
        MatKhau: form.MatKhau.value,
        SDT: form.SDT.value.trim() || undefined,
        DiaChi: form.DiaChi.value.trim() || undefined,
    };

    try {
        await apiPost("/auth/register", data);
        window.location.href = "login.html?registered=1";
    } catch (err) {
        errorBox.textContent = err.message || "Đăng ký thất bại";
        errorBox.hidden = false;
    }
});
