function validateContactForm(form) {
    clearFormErrors(form);
    let valid = true;

    const hoTen = form.HoTen.value.trim();
    if (!hoTen) {
        showFieldError(form.HoTen, "Vui lòng nhập họ tên");
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

    const noiDung = form.NoiDung.value.trim();
    if (!noiDung) {
        showFieldError(form.NoiDung, "Vui lòng nhập nội dung");
        valid = false;
    } else if (noiDung.length > 1000) {
        showFieldError(form.NoiDung, "Nội dung tối đa 1000 ký tự");
        valid = false;
    }

    return valid;
}

const contactForm = document.getElementById("contact-form");

const user = getCurrentUser();
if (user) {
    if (user.HoTen) contactForm.HoTen.value = user.HoTen;
    if (user.Email) contactForm.Email.value = user.Email;
}

attachLiveValidation(contactForm);

contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const form = e.target;
    const errorBox = document.getElementById("form-error");
    const successBox = document.getElementById("form-success");
    errorBox.hidden = true;
    successBox.hidden = true;

    if (!validateContactForm(form)) return;

    successBox.hidden = false;
    showToast("Đã gửi lời nhắn thành công!", "success");
    form.reset();
    if (user) {
        if (user.HoTen) form.HoTen.value = user.HoTen;
        if (user.Email) form.Email.value = user.Email;
    }
});
