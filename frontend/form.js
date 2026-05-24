const API = "http://localhost:3000";

const post = async (endpoint, data) => {
    const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res;
}

const nonEmptyString = str => str === "" ? null : str
