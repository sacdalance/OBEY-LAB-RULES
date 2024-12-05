import React, { useEffect, useState } from 'react';

function Dashboard() {
    const [instructors, setInstructors] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [certificate, setCertificate] = useState({
        dateSubmitted: '',
        timeSubmitted: '',
        serviceStartDate: '',
        serviceEndDate: '',
        serviceRemarks: '',
        instID: '',
    });
    const [editing, setEditing] = useState(false);
    const [editingCertID, setEditingCertID] = useState(null);

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
        const method = editing ? 'PUT' : 'POST';
        const url = editing
            ? `http://localhost:8081/certificates/${editingCertID}`
            : 'http://localhost:8081/certificates';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(certificate),
        })
            .then((res) => {
                if (res.ok) {
                    alert(`Certificate ${editing ? 'updated' : 'added'} successfully!`);
                    setCertificate({
                        dateSubmitted: '',
                        timeSubmitted: '',
                        serviceStartDate: '',
                        serviceEndDate: '',
                        serviceRemarks: '',
                        instID: '',
                    });
                    setEditing(false);
                    setEditingCertID(null);
                    return res.json();
                } else {
                    alert(`Failed to ${editing ? 'update' : 'add'} certificate`);
                }
            })
            .then((updatedCert) => {
                if (editing) {
                    setCertificates((prev) =>
                        prev.map((cert) =>
                            cert.certID === editingCertID ? updatedCert : cert
                        )
                    );
                } else {
                    setCertificates((prev) => [...prev, updatedCert]);
                }
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

    // Handle editing a certificate
    const handleModifyCertificate = (cert) => {
        setEditing(true);
        setEditingCertID(cert.certID);
        setCertificate({
            dateSubmitted: cert.dateSubmitted,
            timeSubmitted: cert.timeSubmitted,
            serviceStartDate: cert.serviceStartDate,
            serviceEndDate: cert.serviceEndDate,
            serviceRemarks: cert.serviceRemarks,
            instID: cert.instID,
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-4">Certificate of Service</h1>

            {/* Add/Modify Certificate Form */}
            <div className="mb-8">
                <h2 className="text-xl mb-4">{editing ? 'Edit Certificate' : 'Add Certificate'}</h2>
                <form onSubmit={handleAddCertificate}>
                    <input
                        type="date"
                        placeholder="Date Submitted"
                        value={certificate.dateSubmitted}
                        onChange={(e) =>
                            setCertificate((prev) => ({ ...prev, dateSubmitted: e.target.value }))
                        }
                        className="border p-2 rounded mr-2"
                        required
                    />
                    <input
                        type="time"
                        placeholder="Time Submitted"
                        value={certificate.timeSubmitted}
                        onChange={(e) =>
                            setCertificate((prev) => ({ ...prev, timeSubmitted: e.target.value }))
                        }
                        className="border p-2 rounded mr-2"
                        required
                    />
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
                        {editing ? 'Update Certificate' : 'Add Certificate'}
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
                                    onClick={() => handleModifyCertificate(cert)}
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
