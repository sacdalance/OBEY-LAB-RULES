import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from './assets/UP-Seal.png'; // Import the logo

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
        <header className="flex justify items-center p-4 bg-red-900 text-white shadow-md">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <img 
                    src={logo} 
                    alt="UP Seal" 
                    onClick={() => navigate('/dashboard')}
                    className="w-12 h-12 object-contain" // Adjust size as needed
                />
            </div>

            {/* Left: Title */}
            <h1 className="text-xl ml-2 font-bold flex-grow">
                CERTIFICATE OF SERVICE
            </h1>

            {/* Right: Logout Button */}
            <button 
                onClick={handleLogout} 
                className="bg-white text-red-900 py-1 px-2 rounded hover:bg-red-900 hover:text-white focus:outline-none"
            >
                Logout
            </button>
        </header>
    );
}

export default Header;
