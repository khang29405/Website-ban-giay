async function handleApiResponse(res) {
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = (json && (json.message || (json.errors && json.errors[0] && json.errors[0].msg))) || res.statusText;
        const err = new Error(msg || "Yêu cầu thất bại");
        err.response = json;
        err.status = res.status;
        throw err;
    }
    return json && json.data;
}

function authHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(path, params) {
    let url = API_BASE_URL + path;
    if (params) {
        const cleaned = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
        if (cleaned.length) {
            url += "?" + new URLSearchParams(cleaned).toString();
        }
    }
    return url;
}

function apiGet(path, params) {
    return fetch(buildUrl(path, params), { headers: authHeaders() }).then(handleApiResponse);
}

// Dung cho cac endpoint co ho tro phan trang (?page=&limit=): tra ve ca `pagination`,
// vi handleApiResponse mac dinh chi tra ve `data` nen se lam mat truong nay.
function apiGetPaged(path, params) {
    return fetch(buildUrl(path, params), { headers: authHeaders() })
        .then(async (res) => {
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                const msg = (json && (json.message || (json.errors && json.errors[0] && json.errors[0].msg))) || res.statusText;
                const err = new Error(msg || "Yêu cầu thất bại");
                err.response = json;
                err.status = res.status;
                throw err;
            }
            return json;
        })
        .then((json) => ({ items: (json && json.data) || [], pagination: (json && json.pagination) || null }));
}

function apiSend(method, path, body) {
    return fetch(API_BASE_URL + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(handleApiResponse);
}

function apiPost(path, body) {
    return apiSend("POST", path, body);
}

function apiPut(path, body) {
    return apiSend("PUT", path, body);
}

function apiPatch(path, body) {
    return apiSend("PATCH", path, body);
}

function apiDelete(path) {
    return apiSend("DELETE", path);
}

// Dung cho upload file (multipart/form-data) - khong dat Content-Type thu cong vi
// trinh duyet phai tu sinh boundary, dat tay se lam server khong doc duoc file.
function apiUpload(path, formData) {
    return fetch(API_BASE_URL + path, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
    }).then(handleApiResponse);
}
