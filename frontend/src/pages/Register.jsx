
import { useState } from "react";
import API from "../api/axios";

function Register() {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Get the visitor ID created by VisitorTracker
            const visitorId = localStorage.getItem("visitor_id");

            const response = await API.post(
                "/register",
                formData,
                {
                    headers: {
                        "X-Visitor-ID": visitorId,
                    },
                }
            );

            alert("Registration successful!");

            console.log(response.data);

            setFormData({
                full_name: "",
                email: "",
                phone: "",
                password: "",
            });
        } catch (error) {
            console.log(error.response?.data);

            alert("Registration failed");
        }
    };

    return (
        <div className="flex justify-center mt-10">

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-lg p-8 w-96"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
                    Register
                </h2>

                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-6"
                />

                <button
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded"
                >
                    Register
                </button>

            </form>
        </div>
    );
}

export default Register;

