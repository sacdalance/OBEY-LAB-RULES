import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [instructors, setInstructors] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [certificate, setCertificate] = useState({
        serviceStartDate: '',
        serviceEndDate: '',
        serviceRemarks: '',
        instID: '',
    });

    const navigate = useNavigate();

    // Fetch all instructors
    useEffect(() => {
        fetch('http://localhost:8081/instructors')
            .then((res) => res.json())
            .then((data) => setInstructors(data))
            .catch((err) => console.error(err));
    }, []);

    // Fetch all certificates
    useEffect(() => {
        fetch('http://localhost:8081/certificates')
            .then((res) => res.json())
            .then((data) => setCertificates(data))
            .catch((err) => console.error(err));
    }, []);

    // Handle adding a certificate
    const handleAddCertificate = (e) => {
        e.preventDefault();

        // Get the current date and time
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const currentTime = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

        // Add current date and time to the certificate object
        const newCertificate = {
            ...certificate,
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
                    setCertificate({
                        serviceStartDate: '',
                        serviceEndDate: '',
                        serviceRemarks: '',
                        instID: '',
                    });
                    return res.json();
                } else {
                    alert('Failed to add certificate');
                }
            })
            .then((newCert) => {
                setCertificates((prev) => [...prev, newCert]);
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
                    setCertificates((prev) => prev.filter((cert) => cert.certID !== certID));
                } else {
                    alert('Failed to delete certificate');
                }
            })
            .catch((err) => console.error(err));
    };

    // Redirect to the Modify page
    const handleNavigateToModify = (certID) => {
        navigate(`/modify/${certID}`);
    };

    return (
        <div className="p-6">

            {/* Add Certificate Form */}
            <div className="mb-8">
                <h2 className="text-xl mb-4">Add Certificate</h2>
                <form onSubmit={handleAddCertificate}>
                    <input
                        type="date"
                        placeholder="Service Start Date"
                        value={certificate.serviceStartDate}
                        onChange={(e) =>
                            setCertificate((prev) => ({
                                ...prev,
                                serviceStartDate: e.target.value,
                            }))
                        }
                        className="border p-2 rounded mr-2"
                        required
                    />
                    <input
                        type="date"
                        placeholder="Service End Date"
                        value={certificate.serviceEndDate}
                        onChange={(e) =>
                            setCertificate((prev) => ({
                                ...prev,
                                serviceEndDate: e.target.value,
                            }))
                        }
                        className="border p-2 rounded mr-2"
                        required
                    />
                    <textarea
                        placeholder="Remarks"
                        value={certificate.serviceRemarks}
                        onChange={(e) =>
                            setCertificate((prev) => ({
                                ...prev,
                                serviceRemarks: e.target.value,
                            }))
                        }
                        className="border p-2 rounded w-full mb-2"
                    />
                    <select
                        value={certificate.instID}
                        onChange={(e) =>
                            setCertificate((prev) => ({ ...prev, instID: e.target.value }))
                        }
                        className="border p-2 rounded w-full mb-2"
                        required
                    >
                        <option value="">Select Instructor</option>
                        {instructors.map((inst) => (
                            <option key={inst.instID} value={inst.instID}>
                                {inst.instFirstName} {inst.instLastName}
                            </option>
                        ))}
                    </select>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">
                        Add Certificate
                    </button>
                </form>
            </div>

            {/* Certificate List */}
            <h2 className="text-xl mb-4">Certificates</h2>
            <table className="table-auto w-full border-collapse border border-gray-400">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-400 px-4 py-2">Certificate ID</th>
                        <th className="border border-gray-400 px-4 py-2">Instructor Name</th>
                        <th className="border border-gray-400 px-4 py-2">Date Submitted</th>
                        <th className="border border-gray-400 px-4 py-2">Start Date</th>
                        <th className="border border-gray-400 px-4 py-2">End Date</th>
                        <th className="border border-gray-400 px-4 py-2">Remark</th>
                        <th className="border border-gray-400 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {certificates.map((cert) => (
                        <tr key={cert.certID}>
                            <td className="border border-gray-400 px-4 py-2">{cert.certID}</td>
                            <td className="border border-gray-400 px-4 py-2">
                                {cert.instFirstName} {cert.instLastName}
                            </td>
                            <td className="border border-gray-400 px-4 py-2">{cert.dateSubmitted}</td>
                            <td className="border border-gray-400 px-4 py-2">{cert.serviceStartDate}</td>
                            <td className="border border-gray-400 px-4 py-2">{cert.serviceEndDate}</td>
                            <td className="border border-gray-400 px-4 py-2">{cert.serviceRemarks}</td>
                            <td className="border border-gray-400 px-4 py-2">
                                <button
                                    onClick={() => handleNavigateToModify(cert.certID)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={() => handleDeleteCertificate(cert.certID)}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Dashboard;
