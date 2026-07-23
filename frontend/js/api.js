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
            const err = new Error(msg || "Yêu cầu thất bại");
            err.response = json;
            throw err;
        }
        return json && json.data;
    });
}
