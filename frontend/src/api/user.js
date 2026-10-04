import API from "./axios";

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    const response = await API.get("/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    console.log("FULL PROFILE RESPONSE:", response);
    console.log("PROFILE DATA:", response.data);

    return response;
};