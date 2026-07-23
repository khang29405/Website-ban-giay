const API_BASE_URL = "http://localhost:5000/api";

function apiPost(path, body) {
	return fetch(API_BASE_URL + path, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	}).then(async (res) => {
		const json = await res.json().catch(() => null);
		if (!res.ok) {
			const msg = (json && (json.message || (json.errors && json.errors[0] && json.errors[0].msg))) || res.statusText;
			const err = new Error(msg || "Request failed");
			err.response = json;
			throw err;
		}
		return json && json.data;
	});
}

function setAuth(token, user) {
	if (token) localStorage.setItem("token", token);
	if (user) localStorage.setItem("user", JSON.stringify(user));
	renderHeader();
}

function clearAuth() {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	renderHeader();
}

function getUser() {
	const s = localStorage.getItem("user");
	return s ? JSON.parse(s) : null;
}

function renderHeader() {
	const header = document.getElementById("header");
	if (!header) return;
	const user = getUser();
	header.innerHTML = `
		<nav class="nav">
			<a class="brand" href="index.html">ShoeStore</a>
			<div class="nav-links">
				<a href="index.html">Trang chủ</a>
				${user ? `<a href="#" id="logout-link">Đăng xuất (${user.HoTen || user.Email})</a>` : `<a href="login.html">Đăng nhập</a><a href="register.html">Đăng ký</a>`}
			</div>
		</nav>
	`;
	const logoutLink = document.getElementById("logout-link");
	if (logoutLink) {
		logoutLink.addEventListener("click", (e) => {
			e.preventDefault();
			clearAuth();
			window.location.href = "index.html";
		});
	}
}

function renderFooter() {
	const footer = document.getElementById("footer");
	if (!footer) return;
	footer.innerHTML = `<div class="footer-inner">© ${new Date().getFullYear()} ShoeStore</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
	renderHeader();
	renderFooter();
});
