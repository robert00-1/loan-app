import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [loans, setLoans] = useState([]);
    const [visitors, setVisitors] = useState([]);

    useEffect(() => {
        loadStats();
        loadLoans();
        loadVisitors();
    }, []);

    // =========================
    // LOAD VISITOR STATS
    // =========================
    const loadStats = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get(
                "/admin/visitor-stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Visitor stats:", response.data);

            setStats(response.data);

        } catch (err) {
            console.log(
                "Visitor stats error:",
                err.response?.data
            );
        }
    };

    // =========================
    // LOAD LOANS
    // =========================
    const loadLoans = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get(
                "/admin/loans",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLoans(response.data);

        } catch (err) {
            console.log(
                "Loans error:",
                err.response?.data
            );
        }
    };

    // =========================
    // LOAD VISITORS
    // =========================
    const loadVisitors = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get(
                "/admin/visitors",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Visitors:", response.data);

            setVisitors(response.data);

        } catch (err) {
            console.log(
                "Visitors error:",
                err.response?.data
            );
        }
    };

    // =========================
    // APPROVE LOAN
    // =========================
    const handleApprove = async (loanId) => {
        try {
            const token = localStorage.getItem("token");

            await API.put(
                `/admin/loans/${loanId}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Loan Approved");

            loadLoans();
            loadStats();

        } catch (err) {
            console.log(
                "Approve error:",
                err.response?.data
            );
        }
    };

    // =========================
    // REJECT LOAN
    // =========================
    const handleReject = async (loanId) => {
        try {
            const token = localStorage.getItem("token");

            await API.put(
                `/admin/loans/${loanId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Loan Rejected");

            loadLoans();
            loadStats();

        } catch (err) {
            console.log(
                "Reject error:",
                err.response?.data
            );
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">

            {/* =========================
                DASHBOARD TITLE
            ========================= */}

            <h1 className="text-4xl font-bold text-blue-700 mb-8">
                Admin Dashboard
            </h1>


            {/* =========================
                VISITOR STATISTICS
            ========================= */}

            <h2 className="text-2xl font-bold mb-5">
                Visitor Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                {/* TOTAL VISITORS */}

                <div className="bg-white shadow rounded-lg p-6">

                    <p className="text-gray-500">
                        Total Visitors
                    </p>

                    <h3 className="text-3xl font-bold text-blue-700 mt-2">
                        {stats.total_visitors || 0}
                    </h3>

                </div>


                {/* REGISTERED VISITORS */}

                <div className="bg-white shadow rounded-lg p-6">

                    <p className="text-gray-500">
                        Registered Visitors
                    </p>

                    <h3 className="text-3xl font-bold text-green-600 mt-2">
                        {stats.registered_visitors || 0}
                    </h3>

                </div>


                {/* LOAN APPLICANTS */}

                <div className="bg-white shadow rounded-lg p-6">

                    <p className="text-gray-500">
                        Loan Applicants
                    </p>

                    <h3 className="text-3xl font-bold text-purple-600 mt-2">
                        {stats.loan_applicants || 0}
                    </h3>

                </div>

            </div>


            {/* =========================
                VISITOR TABLE
            ========================= */}

            <div className="mb-12">

                <h2 className="text-2xl font-bold mb-5">
                    Visitor Activity
                </h2>

                <div className="overflow-x-auto">

                    <table className="w-full bg-white shadow rounded">

                        <thead>

                            <tr className="bg-blue-700 text-white">

                                <th className="p-3 text-left">
                                    Visitor ID
                                </th>

                                <th className="p-3 text-left">
                                    First Seen
                                </th>

                                <th className="p-3 text-left">
                                    Last Seen
                                </th>

                                <th className="p-3 text-left">
                                    Last Page
                                </th>

                                <th className="p-3 text-left">
                                    Registered
                                </th>

                                <th className="p-3 text-left">
                                    Applied
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {visitors.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No visitors found
                                    </td>

                                </tr>

                            ) : (

                                visitors.map((visitor) => (

                                    <tr
                                        key={visitor.id}
                                        className="border-b"
                                    >

                                        <td className="p-3 text-sm">
                                            {visitor.visitor_id}
                                        </td>

                                        <td className="p-3 text-sm">
                                            {new Date(
                                                visitor.first_seen
                                            ).toLocaleString()}
                                        </td>

                                        <td className="p-3 text-sm">
                                            {new Date(
                                                visitor.last_seen
                                            ).toLocaleString()}
                                        </td>

                                        <td className="p-3">
                                            {visitor.last_page}
                                        </td>

                                        <td className="p-3">

                                            {visitor.registered ? (

                                                <span className="text-green-600 font-semibold">
                                                    Yes ✓
                                                </span>

                                            ) : (

                                                <span className="text-gray-500">
                                                    No
                                                </span>

                                            )}

                                        </td>

                                        <td className="p-3">

                                            {visitor.applied_for_loan ? (

                                                <span className="text-green-600 font-semibold">
                                                    Yes ✓
                                                </span>

                                            ) : (

                                                <span className="text-gray-500">
                                                    No
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =========================
                LOAN APPLICATIONS
            ========================= */}

            <div className="mt-10">

                <h2 className="text-2xl font-bold mb-5">
                    Loan Applications
                </h2>

                <div className="overflow-x-auto">

                    <table className="w-full bg-white shadow rounded">

                        <thead>

                            <tr className="bg-blue-700 text-white">

                                <th className="p-3">
                                    ID
                                </th>

                                <th>
                                    User
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Purpose
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loans.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No loan applications found
                                    </td>

                                </tr>

                            ) : (

                                loans.map((loan) => (

                                    <tr
                                        key={loan.id}
                                        className="border-b"
                                    >

                                        <td className="p-3">
                                            {loan.id}
                                        </td>

                                        <td>
                                            {loan.user_id}
                                        </td>

                                        <td>
                                            Ksh {loan.amount}
                                        </td>

                                        <td>
                                            {loan.purpose}
                                        </td>

                                        <td>
                                            {loan.status}
                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    handleApprove(loan.id)
                                                }
                                                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleReject(loan.id)
                                                }
                                                className="bg-red-600 text-white px-3 py-1 rounded"
                                            >
                                                Reject
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;
