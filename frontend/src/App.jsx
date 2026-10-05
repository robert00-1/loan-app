
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyLoan from "./pages/ApplyLoan";
import LoanHistory from "./pages/LoanHistory";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import ApplicationSubmitted from "./pages/ApplicationSubmittted";
import Home from "./pages/Home";

function VisitorTracker() {
    const location = useLocation();

    useEffect(() => {
        const trackVisitor = async () => {
            try {
                let visitorId = localStorage.getItem("visitor_id");

                // Create visitor ID for a new visitor
                if (!visitorId) {
                    visitorId = crypto.randomUUID();

                    localStorage.setItem(
                        "visitor_id",
                        visitorId
                    );
                }

                const response = await fetch(
                    "https://loan-app-dzbd.onrender.com/visitors/track",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            visitor_id: visitorId,
                            page: location.pathname,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Visitor tracking failed: ${response.status}`
                    );
                }

                console.log(
                    "Visitor tracked:",
                    visitorId,
                    location.pathname
                );

            } catch (error) {
                console.log(
                    "Visitor tracking error:",
                    error
                );
            }
        };

        trackVisitor();
    }, [location.pathname]);

    return null;
}

function App() {
    return (
        <>
            <Navbar />

            <VisitorTracker />

            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/apply-loan"
                    element={<ApplyLoan />}
                />

                <Route
                    path="/my-loans"
                    element={<LoanHistory />}
                />

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/application-submitted"
                    element={<ApplicationSubmitted />}
                />
            </Routes>
        </>
    );
}

export default App;


