import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Modify() {
    const navigate = useNavigate();
    
    // Retrieve certID from localStorage
    const certID = localStorage.getItem('certID');
    console.log('Retrieved certID from localStorage:', certID); // Debugging log

    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState(null);

    // Fetch the certificate data from the server
    useEffect(() => {
        if (!certID) {
            setError('Certificate ID not found.');
            return;
        }

        setError(null); // Reset error state before fetching

        fetch(`http://localhost:8081/certificates/${certID}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch certificate');
                }
                return res.json();
            })
            .then((data) => setCertificate(data))
            .catch((err) => setError(err.message));
    }, [certID]);

    // Handle input changes to update state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCertificate((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission to update the certificate
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8081/certificates/${certID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(certificate),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to update certificate');
                }
                alert('Certificate updated successfully!');
                navigate('/dashboard');  // Navigate back to the dashboard after successful update
            })
            .catch((err) => setError(err.message));
    };

    // Display error if any
    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    // Display loading state while fetching data
    if (!certificate) {
        return <p>Loading...</p>;
    }

    // Display form with certificate details
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">MODIFY CERTIFICATE</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Service Start Date</label>
                    <input
                        type="date"
                        name="serviceStartDate"
                        value={certificate.serviceStartDate || ''}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />
                </div>
                
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Service End Date</label>
                    <input
                        type="date"
                        name="serviceEndDate"
                        value={certificate.serviceEndDate || ''}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Except Date</label>
                    <textarea
                        name="serviceExceptDate"
                        value={certificate.serviceRemarks || ''}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Non-teaching Activity</label>
                    <input
                        type="text"
                        name="actTitle"
                        value={certificate.actTitle || ''}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Non-teaching Activity Hours</label>
                    <input
                        type="number"
                        min="0"
                        name="actHours"
                        value={certificate.actHours || ''}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>

                <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">
                    UPDATE CERTIFICATE
                </button>
            </form>
        </div>


            {/* Go Back Button */}
            <div className="text-center mt-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    GO BACK TO DASHBOARD
                </button>
            </div>
    </div>
    );
}

export default Modify;