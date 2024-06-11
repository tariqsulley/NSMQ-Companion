import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/v1";
// const API_BASE = "http://16.16.53.56/api/v1"
export default API_BASE;

export const makeRequest = axios.create({
    baseURL: `${API_BASE}`,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});
