import API from "./axios";

export const getAllLoans = async () => {
    const token = localStorage.getItem("token");

    return await API.get("/admin/loans", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const approveLoan = async (loanId) => {
    const token = localStorage.getItem("token");

    return await API.put(
        `/admin/loans/${loanId}/approve`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const rejectLoan = async (loanId) => {
    const token = localStorage.getItem("token");

    return await API.put(
        `/admin/loans/${loanId}/reject`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};