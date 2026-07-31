// Doi mac dinh sang/toi cho ca site: chi can sua dong nay.
window.DEFAULT_THEME = "dark"; // light or dark

document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || window.DEFAULT_THEME);
