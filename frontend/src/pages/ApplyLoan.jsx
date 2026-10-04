
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function ApplyLoan() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        national_id: "",
        gender: "",
        marital_status: "",
        county: "",
        city: "",
        address: "",
        occupation: "",
        employer: "",
        monthly_income: "",
        employment_status: "",
        next_of_kin: "",
        next_of_kin_phone: "",
        amount: "",
        purpose: "",
    });

    const [registrationPaid, setRegistrationPaid] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [loanLoading, setLoanLoading] = useState(false);

    const token = localStorage.getItem("token");

    // Check whether registration fee has already been paid
    const checkRegistrationStatus = async () => {
        try {
            const response = await API.get(
                "/registration-fee/status",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Registration status:",
                response.data
            );

            setRegistrationPaid(
                response.data.registration_fee_paid === true
            );

        } catch (err) {
            console.log(
                "Registration status error:",
                err.response?.data
            );
        }
    };

    // Check status when page opens
    useEffect(() => {
        if (token) {
            checkRegistrationStatus();
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Pay registration fee
    const payRegistrationFee = async () => {
        try {
            setPaymentLoading(true);

            const response = await API.post(
                "/registration-fee/pay",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Registration payment response:",
                response.data
            );

            // IMPORTANT:
            // This means Safaricom accepted the STK request.
            // It does NOT mean the customer has paid yet.
            if (response.data.response?.ResponseCode === "0") {

                alert(
                    "STK Push sent. Please check your phone and enter your M-Pesa PIN. After paying, click 'Check Payment Status'."
                );

            } else {

                alert(
                    "Registration payment could not be started."
                );
            }

        } catch (err) {

            console.log(
                err.response?.data
            );

            alert(
                err.response?.data?.detail ||
                "Registration payment failed."
            );

        } finally {
            setPaymentLoading(false);
        }
    };

    // Check whether M-Pesa callback confirmed payment
    const checkPayment = async () => {
        try {

            setCheckingPayment(true);

            const response = await API.get(
                "/registration-fee/status",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Payment status:",
                response.data
            );

            if (response.data.registration_fee_paid === true) {

                setRegistrationPaid(true);

                alert(
                    "Registration fee payment confirmed successfully."
                );

            } else {

                setRegistrationPaid(false);

                alert(
                    "Payment has not been confirmed yet. Please complete the M-Pesa payment and try again."
                );
            }

        } catch (err) {

            console.log(
                err.response?.data
            );

            alert(
                "Could not check payment status."
            );

        } finally {
            setCheckingPayment(false);
        }
    };

    const submitLoan = async (e) => {
        e.preventDefault();

        // Double-check payment before submitting
        if (!registrationPaid) {

            alert(
                "Please pay the KSh 150 registration fee before submitting your loan application."
            );

            return;
        }

        try {

            setLoanLoading(true);

            // Update profile first
            await API.put(
                "/profile",
                {
                    national_id: formData.national_id,
                    gender: formData.gender,
                    marital_status: formData.marital_status,
                    county: formData.county,
                    city: formData.city,
                    address: formData.address,
                    occupation: formData.occupation,
                    employer: formData.employer,
                    monthly_income: Number(
                        formData.monthly_income
                    ),
                    employment_status:
                        formData.employment_status,
                    next_of_kin:
                        formData.next_of_kin,
                    next_of_kin_phone:
                        formData.next_of_kin_phone,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Apply for loan
            const visitorId = localStorage.getItem("visitor_id");
            await API.post(
                "/loans",
                {
                    amount: Number(formData.amount),
                    purpose: formData.purpose,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "X-Visitor-ID": visitorId,
                    },
                }
            );

            navigate("/application-submitted");

        } catch (err) {

            console.log(
                err.response?.data
            );

            alert(
                err.response?.data?.detail ||
                "Loan Application Failed"
            );

        } finally {

            setLoanLoading(false);
        }
    };

    return (
        <div className="flex justify-center mt-10 mb-10">

            <form
                onSubmit={submitLoan}
                className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl"
            >

                <h2 className="text-3xl font-bold text-blue-700 mb-8">
                    Loan Application
                </h2>

                <h3 className="text-xl font-semibold mb-4">
                    Personal Information
                </h3>

                <input
                    name="national_id"
                    placeholder="National ID"
                    value={formData.national_id}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="gender"
                    placeholder="Gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="marital_status"
                    placeholder="Marital Status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-6"
                />

                <h3 className="text-xl font-semibold mb-4">
                    Address
                </h3>

                <input
                    name="county"
                    placeholder="County"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="address"
                    placeholder="Physical Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-6"
                />

                <h3 className="text-xl font-semibold mb-4">
                    Employment
                </h3>

                <input
                    name="employment_status"
                    placeholder="Employment Status"
                    value={formData.employment_status}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="occupation"
                    placeholder="Occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="employer"
                    placeholder="Employer"
                    value={formData.employer}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="number"
                    name="monthly_income"
                    placeholder="Monthly Income"
                    value={formData.monthly_income}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-6"
                />

                <h3 className="text-xl font-semibold mb-4">
                    Next of Kin
                </h3>

                <input
                    name="next_of_kin"
                    placeholder="Next of Kin"
                    value={formData.next_of_kin}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="next_of_kin_phone"
                    placeholder="Next of Kin Phone"
                    value={formData.next_of_kin_phone}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-6"
                />

                <h3 className="text-xl font-semibold mb-4">
                    Loan Request
                </h3>

                <input
                    type="number"
                    name="amount"
                    placeholder="Loan Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    name="purpose"
                    placeholder="Purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-8"
                />

                {/* Registration Fee */}
                <div className="border rounded-lg p-5 mb-6">

                    <h3 className="text-lg font-semibold mb-2">
                        Registration Fee
                    </h3>

                    <p className="text-gray-600 mb-4">
                        Pay KSh 150 registration fee before
                        submitting your loan application.
                    </p>

                    <button
                        type="button"
                        onClick={payRegistrationFee}
                        disabled={
                            paymentLoading ||
                            registrationPaid
                        }
                        className={`w-full p-4 rounded text-white ${
                            registrationPaid
                                ? "bg-green-600"
                                : "bg-green-700 hover:bg-green-800"
                        }`}
                    >
                        {paymentLoading
                            ? "Sending STK Push..."
                            : registrationPaid
                            ? "Registration Fee Paid ✓"
                            : "Pay KSh 150 Registration Fee"}
                    </button>

                    {/* Check Payment Button */}
                    {!registrationPaid && (
                        <button
                            type="button"
                            onClick={checkPayment}
                            disabled={checkingPayment}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
                        >
                            {checkingPayment
                                ? "Checking..."
                                : "Check Payment Status"}
                        </button>
                    )}

                    {registrationPaid && (
                        <p className="text-green-600 font-semibold mt-3 text-center">
                            Registration payment confirmed ✓
                        </p>
                    )}

                </div>

                {/* Submit Loan */}
                <button
                    type="submit"
                    disabled={
                        !registrationPaid ||
                        loanLoading
                    }
                    className={`w-full p-4 rounded text-white ${
                        !registrationPaid
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-700 hover:bg-blue-800"
                    }`}
                >
                    {loanLoading
                        ? "Submitting..."
                        : "Submit Application"}
                </button>

            </form>

        </div>
    );
}

export default ApplyLoan;
