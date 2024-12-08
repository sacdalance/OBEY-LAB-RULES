import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();

        const loginData = { email, password };

        fetch('http://localhost:8081/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    localStorage.setItem('isLoggedIn', 'true'); // Save login state
                    localStorage.setItem('user', JSON.stringify(data.user)); // Store all user data
                    navigate('/dashboard'); // Redirect to dashboard
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Login failed due to a server error.');
            });
    };

    return (
        <div className="min-h-screen bg-red-900 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold text-center text-red-900 mb-6">CERTIFICATE OF SERVICE</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-red-900 text-white font-semibold rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
