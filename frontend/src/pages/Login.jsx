import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../api/user";


function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: "",
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
        // 1. Login
        const loginResponse = await API.post("/login", formData);

        console.log("LOGIN RESPONSE:", loginResponse);
        console.log("LOGIN DATA:", loginResponse.data);

        const accessToken = loginResponse.data.access_token;

        // 2. Save token
        localStorage.setItem("token", accessToken);

        // 3. Update AuthContext
        login(accessToken);

        // 4. Get profile
        const profileResponse = await getProfile();

        console.log("PROFILE RESPONSE:", profileResponse);
        console.log("PROFILE DATA:", profileResponse.data);

        // 5. Check admin status
        const user = profileResponse.data;

        console.log("LOGGED-IN USER:", user);
        console.log("IS ADMIN:", user.is_admin);

        alert("Login Successful!");

        if (user.is_admin === true) {
            navigate("/admin");
        } else {
            navigate("/dashboard");
        }

    } catch (error) {
        console.log("ERROR:", error);
        console.log("ERROR RESPONSE:", error.response);
        console.log("ERROR DATA:", error.response?.data);

        alert("Login failed. Please check your email and password.");
    }
};

    return (

    <div className="flex justify-center mt-20">
        <form 
         onSubmit={handleSubmit}
         className="bg-white shadow-lg rounded-lg p-8 w-96"
            
         >
            <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
                Login
            </h2>

            <input type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
            />

            <input type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-6"
            />
            <button className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded">
                Login
            </button>
         </form>
    </div>

    );
}

export default Login;