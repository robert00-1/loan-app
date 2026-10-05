import axios from "axios";

const API = axios.create({
    baseURL: "https://loan-app-dzbd.onrender.com",
});

export default API;