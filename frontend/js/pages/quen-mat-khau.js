function validateQuenMatKhauForm(form) {
    clearFormErrors(form);
    let valid = true;

    const email = form.Email.value.trim();
    if (!email) {
        showFieldError(form.Email, "Vui lòng nhập email");
        valid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(form.Email, "Email không hợp lệ");
        valid = false;
    }

    return valid;
}

const quenMatKhauForm = document.getElementById("quen-mat-khau-form");
attachLiveValidation(quenMatKhauForm);

quenMatKhauForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const errorBox = document.getElementById("form-error");
    const successBox = document.getElementById("form-success");
    errorBox.hidden = true;
    successBox.hidden = true;

    if (!validateQuenMatKhauForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        await apiPost("/auth/quen-mat-khau", { Email: form.Email.value.trim() });
        successBox.textContent = "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (kể cả mục Spam).";
        successBox.hidden = false;
        form.reset();
    } catch (err) {
        errorBox.textContent = err.message || "Gửi yêu cầu thất bại";
        errorBox.hidden = false;
        submitBtn.disabled = false;
    }
});
