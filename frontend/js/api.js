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

function apiGet(path, params) {
    let url = API_BASE_URL + path;
    if (params) {
        const cleaned = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
        if (cleaned.length) {
            url += "?" + new URLSearchParams(cleaned).toString();
        }
    }
    return fetch(url, { headers: authHeaders() }).then(handleApiResponse);
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
