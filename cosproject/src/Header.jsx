import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const location = useLocation(); // Get current path

    const handleLogout = () => {
        // Remove login state from localStorage
        localStorage.removeItem('isLoggedIn');

        // Redirect to login page
        navigate('/');
    };

    // Don't render the Header on the Login page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <h1 className="m-0 text-xl">Certificate of Service</h1>
            <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-400 focus:outline-none"
            >
                Logout
            </button>
        </header>
    );
}

export default Header;
