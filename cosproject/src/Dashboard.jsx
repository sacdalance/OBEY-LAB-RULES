
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [certificateState, setCertificateState] = useState({
        certificates: [], // Start as an empty array
        certificate: {
            serviceStartDate: '',
            serviceEndDate: '',
            serviceRemarks: '',
            actTitle: '',
            actHours: '',
        },
    });

    const navigate = useNavigate();

    // Load user data on mount
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            alert('Please log in to access the dashboard.');
            navigate('/login');
        } else {
            setUser(loggedInUser);
        }
    }, [navigate]);
    
    // Fetch certificates created by the logged-in user
    useEffect(() => {
        if (user) {
            console.log("Fetching certificates for user:", user.instID);
            fetch(`http://localhost:8081/certificates?userID=${user.instID}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("Certificates fetched:", data);
                    setCertificateState((prev) => ({ ...prev, certificates: data }));
                })
                .catch((err) => console.error('Error fetching certificates:', err));
        }
    }, [user]);

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setCertificateState((prev) => ({
            ...prev,
            certificate: { ...prev.certificate, [name]: value },
        }));
    };

    // Handle adding a certificate
    const handleAddCertificate = (e) => {
        e.preventDefault();
    
        const now = new Date(); // Declare the current date and time
    
        // Format the date to MM-DD-YY
        const todayDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)}`;
    
        // Format the time to HH:MM:SS
        const currentTime = now.toTimeString().split(' ')[0];
    
        const newCertificate = {
            ...certificateState.certificate,
            instID: user.instID,
            dateSubmitted: todayDate,
            timeSubmitted: currentTime,
        };
    
        fetch('http://localhost:8081/certificates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCertificate),
        })
            .then((res) => {
                if (res.ok) {
                    alert('Certificate added successfully!');
                    setCertificateState((prev) => ({
                        ...prev,
                        certificate: {
                            serviceStartDate: '',
                            serviceEndDate: '',
                            serviceRemarks: '',
                            actTitle: '',
                            actHours: '',
                        },  
                    }));
                    return res.json();
                } else {
                    throw new Error('Failed to add certificate');
                }
            })
            .then((newCert) => {
                setCertificateState((prev) => ({
                    ...prev,
                    certificates: [...prev.certificates, newCert],
                }));
            })
            .catch((err) => console.error(err));
    };
    

    // Handle deleting a certificate
    const handleDeleteCertificate = (certID) => {
        if (!window.confirm('Are you sure you want to delete this certificate?')) {
            return;
        }

        fetch(`http://localhost:8081/certificates/${certID}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (res.ok) {
                    alert('Certificate deleted successfully');
                    setCertificateState((prev) => ({
                        ...prev,
                        certificates: prev.certificates.filter(
                            (cert) => cert.certID !== certID
                        ),
                    }));
                }
            })
            .catch((err) => console.error(err));
    };

    // Modify a certificate
    const handleNavigateToModify = (certID) => {
        console.log('Navigating to modify with certID:', certID); // Debug
        if (!certID) {
            console.error('certID is undefined! Check the certificates data.');
            return;
        }
        // Save certID to localStorage
        localStorage.setItem('certID', certID);
        navigate(`/modify/${certID}`);
    };



    // Print a certificate
    const print = (certID) => {
        const cert = certificateState.certificates.find((c) => c.certID === certID);
        if (!cert) {
            alert('Certificate not found.');
            return;
        }
    
        // Open a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Certificate</title>
                    <style>
                        /* Hide everything that is not part of the printable certificate */
                        body * {
                            visibility: hidden;
                        }
                        .certificate-container, .certificate-container * {
                            visibility: visible;
                        }
                        .certificate-container {
                            padding: 20px;
                            border: 2px solid #333;
                            width: 80%;
                            margin: 0 auto;
                            text-align: center;
                        }
                        .certificate-container h1 {
                            font-size: 2em;
                            margin-bottom: 20px;
                        }
                        .certificate-container p {
                            font-size: 1.2em;
                            margin: 10px 0;
                        }
                        .signature {
                            margin-top: 40px;
                            font-size: 1.2em;
                            text-align: center;
                        }
                        .signature span {
                            display: block;
                            margin-top: 30px;
                        }
                    </style>
                </head>
                <body>
                    <!-- Printable certificate -->
                    <div class="certificate-container">
                        <h1>Certificate of Completion</h1>
                        <p><strong>Issued By:</strong> ${user.instFirstName} ${user.instLastName}</p>
                        <p><strong>Position:</strong> ${user.instPosition}</p>
                        <p><strong>College:</strong> ${user.instCollege}</p>
                        <p><strong>Campus:</strong> ${user.instCampus}</p>
                        <p><strong>Email:</strong> ${user.instEmail}</p>
    
                        <p><strong>Certificate ID:</strong> ${cert.certID}</p>
                        <p><strong>Date Submitted:</strong> ${cert.dateSubmitted}</p>
                        <p><strong>Service Start Date:</strong> ${cert.serviceStartDate}</p>
                        <p><strong>Service End Date:</strong> ${cert.serviceEndDate}</p>
                        <p><strong>Activity Title:</strong> ${cert.actTitle}</p>
                        <p><strong>Activity Hours:</strong> ${cert.actHours}</p>
                        <p><strong>Remarks:</strong> ${cert.serviceRemarks}</p>
    
                        <div class="signature">
                            <span>Signature of Authorized Personnel</span>
                            <span>Date: ${cert.dateSubmitted}</span>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* User Information Section */}
            {user && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">{`${user.instFirstName} ${user.instLastName}`.toUpperCase()}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>Email:</strong> {user.instEmail}</p>
                        <p><strong>HRIS:</strong> {user.instHRIS}</p>
                        <p><strong>Position:</strong> {user.instPosition}</p>
                        <p><strong>Campus:</strong> {user.instCampus}</p>
                    </div>
                </div>
            )}

            {/* Add Certificate Form */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">ADD CERTIFICATE</h2>
                <form onSubmit={handleAddCertificate} className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Service Start Date</label>
                        <input
                            type="date"
                            name="serviceStartDate"
                            placeholder="Service Start Date"
                            value={certificateState.certificate.serviceStartDate}
                            onChange={handleFormChange}
                            className="border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Service End Date</label>
                        <input
                            type="date"
                            name="serviceEndDate"
                            placeholder="Service End Date"
                            value={certificateState.certificate.serviceEndDate}
                            onChange={handleFormChange}
                            className="border p-2 rounded"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Remarks (e.g., January 5, 2024 to January 8, 2024)</label>
                        <textarea
                            name="serviceRemarks"
                            placeholder="Remarks"
                            value={certificateState.certificate.serviceRemarks}
                            onChange={handleFormChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Non-teaching Activity</label>
                        <input
                            type="text"
                            name="actTitle"
                            placeholder="Activity Title"
                            value={certificateState.certificate.actTitle}
                            onChange={handleFormChange}
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
                            placeholder="Activity Hours"
                            value={certificateState.certificate.actHours}
                            onChange={handleFormChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>

                    <button className="bg-red-900 text-white px-4 py-2 rounded">
                        ADD CERTIFICATE
                    </button>
                </form>
            </div>


            {/* Certificates Table */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">CERTIFICATES</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="border border-gray-300 px-4 py-2">Certificate ID</th>
                            <th className="border border-gray-300 px-4 py-2">Date Submitted</th>
                            <th className="border border-gray-300 px-4 py-2">Time Submitted</th>
                            <th className="border border-gray-300 px-4 py-2">Start Date</th>
                            <th className="border border-gray-300 px-4 py-2">End Date</th>
                            <th className="border border-gray-300 px-4 py-2">Remarks</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificateState.certificates.map((cert) => (
                            <tr key={cert.certID} className="hover:bg-gray-100">
                                <td className="border border-gray-300 px-4 py-2">{cert.certID}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.dateSubmitted}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.timeSubmitted}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.serviceStartDate}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.serviceEndDate}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.serviceRemarks}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <button
                                        onClick={() => handleNavigateToModify(cert.certID)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 my-1"
                                    >
                                        MODIFY
                                    </button>
                                    <button
                                        onClick={() => print(cert.certID)}
                                        className="bg-gray-500 text-white px-2 py-1 rounded mr-2 my-1"
                                    >
                                        PRINT
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCertificate(cert.certID)}
                                        className="bg-red-900 text-white px-2 py-1 rounded my-1"
                                    >
                                        DELETE
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {certificateState.certificates.length === 0 && (
                    <p className="text-center mt-4 text-gray-500">No certificates found.</p>
                )}
            </div>
        </div>
    );

}

export default Dashboard;
