import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProfile } from "../api/user";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    const { isLoggedIn, logout } = useContext(AuthContext);

    useEffect(() => {
        if (isLoggedIn) {
            loadUser();
        } else {
            setUser(null);
        }
    }, [isLoggedIn]);

    const loadUser = async () => {
        try {
            const response = await getProfile();

            console.log("PROFILE:", response.data);
            setUser(response.data);
        } catch (err) {
            console.log(err.response?.data);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };


    return (
        <nav className="bg-blue-700 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center p-4">

                <h1 className="text-2xl font-bold">
                    RobertLend
                </h1>

                <div className="flex gap-6 items-center">

                    <Link to="/">Home</Link>

                    {!isLoggedIn ? (
                        <>
                            <Link to="/register">Register</Link>
                            <Link to="/login">Login</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard">Dashboard</Link>

                            <Link to="/apply-loan">
                                Apply Loan
                            </Link>

                            <Link to="/my-loans">
                                My Loans
                            </Link>

                            {user?.is_admin && (
                                <Link to="/admin">
                                    Admin Dashboard
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    )}

                </div>

            </div>
        </nav>
    );
}

export default Navbar;