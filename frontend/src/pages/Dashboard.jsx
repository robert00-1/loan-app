import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../api/user";

function Dashboard() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        console.log("loadProfile is running");

        try {

            const response = await getProfile();

            console.log(response.data);

            setUser(response.data);

        } catch (err) {

            console.log(err);

        }

    };

    if (!user) {

        return (
            <div className="text-center mt-20 text-2xl">
                Loading...
            </div>
        );

    }

    return (

        <div className="min-h-screen bg-gray-100">

            <div className="max-w-6xl mx-auto p-8">

                <h1 className="text-4xl font-bold text-blue-700 mb-8">

                    Welcome {user.full_name} 👋

                </h1>

                {/* Dashboard Cards */}

                <div className="grid md:grid-cols-4 gap-6">

                    {/* Wallet */}

                    <div className="bg-green-100 shadow rounded p-6">

                        <h2 className="font-bold text-xl">
                            Wallet Balance
                        </h2>

                        <p className="text-3xl text-green-700 mt-3">
                            Ksh {user.wallet_balance}
                        </p>

                    </div>

                    {/* Loan Limit */}

                    <div className="bg-white shadow rounded p-6">

                        <h2 className="font-bold text-xl">
                            Loan Limit
                        </h2>

                        <p className="text-3xl text-green-600 mt-3">
                            Ksh {user.loan_limit}
                        </p>

                    </div>

                    {/* Credit Score */}

                    <div className="bg-white shadow rounded p-6">

                        <h2 className="font-bold text-xl">
                            Credit Score
                        </h2>

                        <p className="text-3xl text-blue-600 mt-3">
                            {user.credit_score}
                        </p>

                    </div>

                    {/* Total Loans */}

                    <div className="bg-white shadow rounded p-6">

                        <h2 className="font-bold text-xl">
                            Total Loans
                        </h2>

                        <p className="text-3xl mt-3">
                            {user.total_loans_taken}
                        </p>

                    </div>

                </div>

                {/* Buttons */}

                <div className="mt-10 flex gap-5">

                    <Link
                        to="/apply-loan"
                        className="bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800"
                    >
                        Apply Loan
                    </Link>

                    <Link
                        to="/my-loans"
                        className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800"
                    >
                        My Loans
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;