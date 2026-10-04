import { useState } from "react";
import API from "../api/axios";


function Profile() {

    const [profile, setProfile] = useState({
        national_id: "",
        gender: "",
        marital_status:"",
        county: "",
        city: "",
        address: "",
        occupation:"",
        employer: "",
        monthly_income:"",
        employment_status: "",
        next_of_kin: "",
        next_of_kin_phone: "",
    });

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,

        });
    };

    const saveProfile = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");


            await API.put(
                "/profile",
                profile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Profile Updated  Successfully");
        } catch (err) {
            console.log(err.response?.data);
            alert("Failed to update profile");
        }
    };

    return (
    <div className="mwx-w-3xl mx-auto mt-10 bg-white shadow-lg rounded p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">
            Complete Your Profile
        </h1>
        <form onSubmit={saveProfile} className="grid md:grid-cols-2 gap-4">

            <input name="national_id"
            placeholder="National ID"
            onChange={handleChange}
            className="border p-3 rounded"
            />

            <input name="gender" 
            placeholder="Gender"
            onChange={handleChange}
            className="border p-3 rounded"
            />

            <input name="marital_status"
            placeholder="Marital Status"
            onChange={handleChange}
            className="border p-3 rounded"
            />

            <input name="county"
            placeholder="County"
            onChange={handleChange}
            className="border p-3 rounded"
            />
            <input name="city"
            placeholder="City"
            onChange={handleChange}
            className="border p-3 rounded"
            
            />
            <input name="address"
            placeholder="Address"
            onChange={handleChange}
            className="border p-3 rounded"
            />
            <input name="occupation" 
            placeholder="Occupation"
            onChange={handleChange}
            className="border p-3 rounded"
            />

            <input type="number"
            name="monthly_income"
            placeholder="Monthly Income"
            onChange={handleChange}
            className="border p-3 rounded"

            />

            <input name="employment_status"
            placeholder="Employment Status"
            onChange={handleChange}
            className="border p-3 rounded"
            />
            <input name="next_of_kin"
            placeholder="Next of kin"
            onChange={handleChange}
            className="border p-3 rounded"
            />

            <input name="next_of_kin_phone"
            placeholder="Next of Kin Phone"
            onChange={handleChange}
            className="border p-3 rounded"
            />

            <button className="bg-blue-700 text-white p-3 rounded md:col-span-2">
                Save Profile
            </button>
        </form>
    </div>

    );
}

export default Profile;
