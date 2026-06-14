const API = "http://redistest-frontend:3000";

const post = async (endpoint, data) => {
    const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res;
}

const get = async (endpoint) => {
    const res = await fetch(`${API}/${endpoint}`);
    return res;
}

const nonEmptyString = str => str === "" ? null : str
