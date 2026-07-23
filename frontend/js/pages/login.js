document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
        const successBox = document.getElementById("form-success");
        successBox.textContent = "Đăng ký thành công! Vui lòng đăng nhập.";
        successBox.hidden = false;
    }

    attachLiveValidation(document.getElementById("login-form"));
});

function validateLoginForm(form) {
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

    const password = form.MatKhau.value;
    if (!password) {
        showFieldError(form.MatKhau, "Vui lòng nhập mật khẩu");
        valid = false;
    }

    return valid;
}

document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const errorBox = document.getElementById("form-error");
    errorBox.hidden = true;

    if (!validateLoginForm(form)) return;

    const data = {
        Email: form.Email.value.trim(),
        MatKhau: form.MatKhau.value,
    };

    try {
        const result = await apiPost("/auth/login", data);
        setAuth(result.token, result.user);
        window.location.href = "index.html";
    } catch (err) {
        errorBox.textContent = err.message || "Đăng nhập thất bại";
        errorBox.hidden = false;
    }
});
