import { Link} from "react-router-dom";

function ApplicationSubmitted() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-10">

            <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w">
                <div className="text-6xl mb-6">
                     ✅
                </div>
                <h1 className="text-3xl font-bold text-green-700 mb-4">
                    Application Submitted Successfully
                </h1>

                <p className="text-gray-600 mb-6">
                    Thank you choosing RobertLend
                </p>

                <p className="text-gray-700 mb-6">
                    Your loan application is currently being reviewed

                    <br /><br />
                    Please wait approximately <strong>3 minutes</strong> 
                    then visit <strong>My Loans</strong> to check whether
                    your loan has been approved

                </p>
                <Link 
                to="/my-loans"
                className="bg-blue-700 text-white px-8 py-3 rounded">
                    Go to My Loans
                </Link>
            </div>
        </div>
    )
}

export default ApplicationSubmitted;