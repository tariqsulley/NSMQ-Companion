import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export default API_BASE;

export const makeRequest = axios.create({
    baseURL: `${API_BASE}`,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});
