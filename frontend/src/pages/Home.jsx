function Home() {
    return (
        <div
            className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-white"
            style={{
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1920&q=80')"
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-6">
                <h1 className="text-6xl font-bold mb-6">
                    Welcome to RobertLend
                </h1>

                <p className="text-2xl mb-8">
                    Fast. Secure. Reliable Loans.
                </p>

                
            </div>
        </div>
    );
}

export default Home;