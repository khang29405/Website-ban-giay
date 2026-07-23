function setAuth(token, user) {
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

function getAuthToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
