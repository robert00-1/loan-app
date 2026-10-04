import { useEffect, useState } from "react";
import API from "../api/axios";

function LoanHistory() {

    const [loans, setLoans] = useState([]);

    const [installments, setInstallments] = useState([]);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await API.get("/loans", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLoans(response.data);

        } catch (err) {
            console.log(err.response?.data);
        }

    };
    const loadInstallments  = async (loanId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get(
                `/loans/${loanId}/installments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setInstallments(response.data);
        } catch (err) {
            console.log(err.response?.data);
        }
    };
    const payInstallment = async (installmentId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.post(
                `/installments/${installmentId}/stk`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("M-PESA STK Push sent. Check your phone.");

            console.log(response.data);
        } catch (err) {
            console.log(err.response?.data);
            alert("payment failed")
        }
    };

    return (

        <div className="p-8">

            <h1 className="text-4xl font-bold text-blue-700 mb-8">
                My Loans
            </h1>

            <table className="w-full bg-white shadow rounded">

                <thead>

                    <tr className="bg-blue-700 text-white">

                        <th className="p-3">Amount</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Balance</th>

                    </tr>

                </thead>

                <tbody>

                    {loans.map((loan) => (

                        <tr key={loan.id}
                        className="border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => loadInstallments(loan.id)}
                        >

                            <td className="p-3">
                                Ksh {loan.amount}
                            </td>

                            <td>
                                {loan.purpose}
                            </td>

                            <td>
                                {loan.status}
                            </td>

                            <td>
                                Ksh {loan.balance}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-5">
                    Repayment Schedule
                </h2>
                <table className="w-full bg-white shadow rounded">
                    <thead>
                        <tr className="bg-green-700 text-white">
                            <th className="p-3">
                                Installment
                            </th>
                            <th>Amount</th>
                            <th>Due date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {installments.map((item) =>(
                          <tr key={item.id} className="border-b">

    <td className="p-3">
        {item.installment_number}
    </td>

    <td>
        Ksh {item.amount}
    </td>

    <td>
        {item.due_date.substring(0,10)}
    </td>

    <td>
        {item.is_paid ? "Paid ✅" : "Pending"}
    </td>

    <td>
        <button
        onClick={() => payInstallment(item.id)}
        className="bg-green-600 text-white px-3 py-1 rounded">
            Pay with M-PESA
        </button>
    </td>

</tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>

    );

}

export default LoanHistory;