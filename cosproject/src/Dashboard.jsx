
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
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch certificates');
                    }
                    return res.json();
                })
                .then((data) => {
                    const formattedCertificates = data.map((cert) => ({
                        ...cert,
                        dateSubmittedFormatted: new Date(cert.dateSubmitted).toLocaleDateString(), // Format dateSubmitted
                        serviceStartDateFormatted: new Date(cert.serviceStartDate).toLocaleDateString(),
                        serviceEndDateFormatted: new Date(cert.serviceEndDate).toLocaleDateString(),
                    }));
    
                    console.log("Formatted certificates:", formattedCertificates);
                    setCertificateState((prev) => ({ ...prev, certificates: formattedCertificates }));
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

    const todayDate = now.toISOString().split('T')[0]; // Outputs as YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0]; // Outputs as HH:MM:SS (24-hour format)

    // Extract the month and year from today's date (dateSubmitted)
    const today = new Date();
    const submittedMonth = today.toLocaleString('default', { month: 'long' }); // Full month name
    const submittedYear = today.getFullYear(); // Full year

    const newCertificate = {
        ...certificateState.certificate,
        instID: user.instID,
        dateSubmitted: todayDate,
        timeSubmitted: currentTime,
        month: submittedMonth, // Add month based on dateSubmitted
        year: submittedYear,   // Add year based on dateSubmitted
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Service</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 5px;
            padding: 0;
            line-height: 1.4;
            display: flex;
            flex-direction: row;
            overflow-x: hidden; 
            font-size: 12px;
        }

        .container {
            display: flex;
            flex-direction: row;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        }

        .half-page {
            width: 50%;
            padding: 10px;
            box-sizing: border-box;
            overflow-y: auto; 
            border-right: 1px dashed #ccc;
        }

        .header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .header img {
            width: 80px; 
            height: auto;
            margin-right: 10px;
        }

        .header h1, .header h2 {
            margin: 0;
            line-height: 1.2;
        }

        .formCode p {
            margin: 0;
        }

        .section {
            margin-bottom: 10px;
        }

        #title {
            display: flex;
            justify-content: center; 
            align-items: center; 
            font-weight: bold; 
            font-size: 14px;
        }

        #info p {
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table, th, td {
            border: 1px solid #ddd;
            font-size: 10px;
        }

        th, td {
            padding: 5px;
            text-align: center;
        }

        h1, h2 {
            font-size: 16px;
        }

        h2 {
            font-weight: normal;
        }

        h3 {
            font-size: 12px;
        }

        ul {
            font-size: 12px;
        }

        .footer {
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Left Half -->
        <div class="half-page">
            <div class="header">
                <img src="src/assets/UP-Seal.png" alt="University Logo">
                <div>
                    <h1>UNIVERSITY OF THE PHILIPPINES BAGUIO</h1>
                    <h2>Governor Pack Road, Baguio City</h2>
                </div>
            </div>
            <div class="formCode">
                <p>UP-HR Form No. 0055 (UP Form No. 65-A)</p>
                <p>Revised 12 Oct 2016</p>
                <p>COS No. ${cert.certID}</p>
            </div>
            <div class="section" id="title">
                <p><strong>CERTIFICATE OF SERVICE</strong></p>
            </div>
            <div class="section" id="info">
                <p>For the month of <u>December</u>, <u>2024</u></p>
                <p>Name: <u>${user.instFirstName} ${user.instLastName}</u></p>
                <p>Position: <u>${user.instPosition}</u></p>
                <p>College/Unit: <u>${user.instCollege}</u></p>
                <p>Campus: <u>${user.instCampus}</u></p>
                <p>Email: <u>${user.instEmail}</u></p>
            </div>
            <div class="section">
                <table>
                    <thead>
                        <tr>
                            <th>Activities other than Teaching such as Research etc.</th>
                            <th>Approx. no. of hours per Week</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${cert.actTitle}</td>
                            <td>${cert.actHours}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="section">
                <p>I hereby certify, upon my honor, that I have rendered full service for the period of <u>${cert.serviceStartDateFormatted}</u> to <u>${cert.serviceEndDateFormatted}</u>.</p>
                <p><strong>Date & Time Submitted:</strong> ${cert.dateSubmittedFormatted}</p>
            </div>
            <table>
                <h3>Approval History:</h3>
                <thead>
                    <tr>
                        <th><i>Name</i></th>
                        <th><i>Action</i></th>
                        <th><i>Date/Time</i></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Placeholder Name</td>
                        <td>Placeholder Remark</td>
                        <td>${cert.dateSubmittedFormatted}</td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
                <p><i>This is an HRIS-generated report. Employee's and Approver's signatures not required.</i></p>
                <p>References</p>
                <ul>
                    <li>Administrative Order No. PAEP 16-28, 25 May 2016 "Use of Official UP Mail and Online Release of Service Records, Travel Order, Employment Certification and other Certificates."</li>
                    <li>Memorandum No. NGY 18-42, 07 Mar 2018 "Mandatory Use of UIS for Submission and Approval of Certificate of Service (CoS)"</li>
                </ul>
            </div>
        </div>
        <!-- Right Half (identical content) -->
        <div class="half-page">
            <!-- Duplicate the content from the left half here -->
                        <div class="header">
                <img src="src/assets/UP-Seal.png" alt="University Logo">
                <div>
                    <h1>UNIVERSITY OF THE PHILIPPINES BAGUIO</h1>
                    <h2>Governor Pack Road, Baguio City</h2>
                </div>
            </div>
            <div class="formCode">
                <p>UP-HR Form No. 0055 (UP Form No. 65-A)</p>
                <p>Revised 12 Oct 2016</p>
                <p>COS No. ${cert.certID}</p>
            </div>
            <div class="section" id="title">
                <p><strong>CERTIFICATE OF SERVICE</strong></p>
            </div>
            <div class="section" id="info">
                <p>For the month of <u>December</u>, <u>2024</u></p>
                <p>Name: <u>${user.instFirstName} ${user.instLastName}</u></p>
                <p>Position: <u>${user.instPosition}</u></p>
                <p>College/Unit: <u>${user.instCollege}</u></p>
                <p>Campus: <u>${user.instCampus}</u></p>
                <p>Email: <u>${user.instEmail}</u></p>
            </div>
            <div class="section">
                <table>
                    <thead>
                        <tr>
                            <th>Activities other than Teaching such as Research etc.</th>
                            <th>Approx. no. of hours per Week</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${cert.actTitle}</td>
                            <td>${cert.actHours}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="section">
                <p>I hereby certify, upon my honor, that I have rendered full service for the period of <u>${cert.serviceStartDateFormatted}</u> to <u>${cert.serviceEndDateFormatted}</u>.</p>
                <p><strong>Date & Time Submitted:</strong> ${cert.dateSubmittedFormatted}</p>
            </div>
            <table>
                <h3>Approval History:</h3>
                <thead>
                    <tr>
                        <th><i>Name</i></th>
                        <th><i>Action</i></th>
                        <th><i>Date/Time</i></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>    
                        <td>Placeholder Name</td>
                        <td>Placeholder Remark</td>
                        <td>${cert.dateSubmittedFormatted}</td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
                <p><i>This is an HRIS-generated report. Employee's and Approver's signatures not required.</i></p>
                <p>References</p>
                <ul>
                    <li>Administrative Order No. PAEP 16-28, 25 May 2016 "Use of Official UP Mail and Online Release of Service Records, Travel Order, Employment Certification and other Certificates."</li>
                    <li>Memorandum No. NGY 18-42, 07 Mar 2018 "Mandatory Use of UIS for Submission and Approval of Certificate of Service (CoS)"</li>
                </ul>
            </div>
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
                        <label className="text-sm font-medium">Remarks</label>
                        <textarea
                            name="serviceRemarks"
                            placeholder="(e.g., January 5, 2024 to January 8, 2024)"
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
                                <td className="border border-gray-300 px-4 py-2">{cert.dateSubmittedFormatted}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.timeSubmitted}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.serviceStartDateFormatted}</td>
                                <td className="border border-gray-300 px-4 py-2">{cert.serviceEndDateFormatted}</td>
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
