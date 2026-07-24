function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhoneVN(value) {
    return /^(\+?84|0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9\d)\d{7}$/.test(value);
}

function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add("input-error");
    const span = document.createElement("span");
    span.className = "field-error";
    span.textContent = message;
    input.insertAdjacentElement("afterend", span);
}

function clearFieldError(input) {
    input.classList.remove("input-error");
    const next = input.nextElementSibling;
    if (next && next.classList.contains("field-error")) {
        next.remove();
    }
}

function clearFormErrors(form) {
    form.querySelectorAll(".field-error").forEach((el) => el.remove());
    form.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
}

function attachLiveValidation(form) {
    const generalError = document.getElementById("form-error");
    const generalSuccess = document.getElementById("form-success");
    form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            clearFieldError(input);
            if (generalError) generalError.hidden = true;
            if (generalSuccess) generalSuccess.hidden = true;
        });
    });
}
