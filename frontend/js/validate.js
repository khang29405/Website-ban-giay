function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhoneVN(value) {
    return /^(\+?84|0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9\d)\d{7}$/.test(value);
}

// Dung cho MOI truong hop dat mat khau moi (dang ky, doi mat khau, dat lai mat khau) -
// khop voi rule backend (matKhauManhValidation trong authRoutes.js). KHONG dung de
// kiem tra mat khau cu/mat khau dang nhap, vi mat khau cu co the da ton tai truoc khi
// co rule nay.
const PASSWORD_RULES = [
    { test: (v) => v.length >= 8, label: "Tối thiểu 8 ký tự" },
    { test: (v) => /[A-Z]/.test(v), label: "Có ít nhất 1 chữ hoa (A-Z)" },
    { test: (v) => /[a-z]/.test(v), label: "Có ít nhất 1 chữ thường (a-z)" },
    { test: (v) => /[0-9]/.test(v), label: "Có ít nhất 1 chữ số (0-9)" },
    { test: (v) => /[^A-Za-z0-9]/.test(v), label: "Có ít nhất 1 ký tự đặc biệt (!@#$%...)" },
];

function isStrongPassword(value) {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}

function firstUnmetPasswordRule(value) {
    return PASSWORD_RULES.find((rule) => !rule.test(value)) || null;
}

// Icon canh label mat khau: hover vao hien tooltip liet ke DAY DU cac dieu kien, noi
// dung co dinh, khong doi theo input (chi hien/an bang CSS :hover, xem components.css).
function renderPasswordChecklist(tooltipEl) {
    if (!tooltipEl) return;
    tooltipEl.innerHTML = `<ul>${PASSWORD_RULES.map((r) => `<li>${escapeHtml(r.label)}</li>`).join("")}</ul>`;
}

// Danh sach nho NGAY DUOI o nhap mat khau: hien du 5 dieu kien ngay tu dau, dieu kien
// nao go dung thi doi sang mau xanh + dau tich, dieu kien chua dat hien mau do. An di
// khi blur khoi o nhap, hien lai (theo gia tri hien tai) khi focus lai vao o.
function initPasswordLiveHint(inputEl, liveHintEl) {
    if (!inputEl || !liveHintEl) return;

    function render() {
        const value = inputEl.value;

        if (!value) {
            liveHintEl.hidden = true;
            liveHintEl.innerHTML = "";
            return;
        }

        liveHintEl.hidden = false;
        liveHintEl.innerHTML = PASSWORD_RULES.map((rule) => {
            const met = rule.test(value);
            const icon = met ? "fa-circle-check" : "fa-circle-xmark";
            return `<div class="password-hint-status${met ? " ok" : ""}"><i class="fa-solid ${icon}"></i> ${escapeHtml(rule.label)}</div>`;
        }).join("");
    }

    inputEl.addEventListener("input", render);
    inputEl.addEventListener("focus", render);
    inputEl.addEventListener("blur", () => {
        liveHintEl.hidden = true;
    });
}

// Icon con mat trong o mat khau: bam de doi qua lai giua an (type=password) va hien
// (type=text) noi dung dang go.
function initPasswordToggle(inputEl, btnEl) {
    if (!inputEl || !btnEl) return;

    btnEl.addEventListener("click", () => {
        const showing = inputEl.type === "text";
        inputEl.type = showing ? "password" : "text";
        btnEl.querySelector("i").className = showing ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
        btnEl.setAttribute("aria-label", showing ? "Hiện mật khẩu" : "Ẩn mật khẩu");
    });
}

// O mat khau co icon con mat, input va button cung nam trong ".password-input-wrap" -
// neu chen span loi ngay sau input thi no lot VAO TRONG wrap (giua input va button), lam
// wrap cao len va day icon (dinh vi absolute top:50% theo chieu cao wrap) thut xuong duoi.
// Vi vay can chen loi ra SAU ca cai wrap, khong phai sau input.
function fieldErrorAnchor(input) {
    return input.parentElement.classList.contains("password-input-wrap") ? input.parentElement : input;
}

function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add("input-error");
    const span = document.createElement("span");
    span.className = "field-error";
    span.textContent = message;
    fieldErrorAnchor(input).insertAdjacentElement("afterend", span);
}

function clearFieldError(input) {
    input.classList.remove("input-error");
    const next = fieldErrorAnchor(input).nextElementSibling;
    if (next && next.classList.contains("field-error")) {
        next.remove();
    }
}

function clearFormErrors(form) {
    form.querySelectorAll(".field-error").forEach((el) => el.remove());
    form.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
}

function attachLiveValidation(form, generalErrorId = "form-error", generalSuccessId = "form-success") {
    const generalError = document.getElementById(generalErrorId);
    const generalSuccess = document.getElementById(generalSuccessId);
    form.querySelectorAll("input, select, textarea").forEach((input) => {
        const clear = () => {
            clearFieldError(input);
            if (generalError) generalError.hidden = true;
            if (generalSuccess) generalSuccess.hidden = true;
        };
        input.addEventListener("input", clear);
        input.addEventListener("change", clear);
    });
}
