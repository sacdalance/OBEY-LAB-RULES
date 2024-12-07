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
        <header style={styles.header}>
            <h1 style={styles.title}>Certificate of Service</h1>
            <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
            </button>
        </header>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: '#fff',
    },
    title: {
        margin: 0,
    },
    logoutButton: {
        backgroundColor: '#ff4d4d',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Header;
