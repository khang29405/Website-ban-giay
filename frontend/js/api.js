async function handleApiResponse(res) {
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = (json && (json.message || (json.errors && json.errors[0] && json.errors[0].msg))) || res.statusText;
        const err = new Error(msg || "Yêu cầu thất bại");
        err.response = json;
        throw err;
    }
    return json && json.data;
}

function apiGet(path, params) {
    let url = API_BASE_URL + path;
    if (params) {
        const cleaned = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
        if (cleaned.length) {
            url += "?" + new URLSearchParams(cleaned).toString();
        }
    }
    return fetch(url).then(handleApiResponse);
}

function apiPost(path, body) {
    return fetch(API_BASE_URL + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    }).then(handleApiResponse);
}
