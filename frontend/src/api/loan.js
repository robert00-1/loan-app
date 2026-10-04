import API from "./axios";

export const getMyLoans = async () => {
    const token = localStorage.getItem("token");


    return await API.get("/loans", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};