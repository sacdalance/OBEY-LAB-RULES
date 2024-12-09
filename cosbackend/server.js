
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // To handle JSON requests

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'obeylabrules',
});

// Test connection
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to the database.");
});

app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body);
    
    // Ensure that req.body contains email and password
    const email = req.body.email;
    const password = req.body.password;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password are required.' });
    }
    
    const sql = `
            SELECT instID, instFirstName, instMiddleName, instLastName, instPosition, instCollege, instCampus, instEmail, instHRIS
                FROM instructors 
                WHERE instEmail = ? AND instPassword = ?
    `;
    db.query(sql, [email, password], (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (data.length > 0) {
            return res.json({ success: true, message: "Login Successfully", user: data[0] });
        } else {
            return res.json({ success: false, message: "Login Failed" });
        }
    });

});



// Get all instructors
app.get('/instructors', (req, res) => {
    const sql = `
        SELECT i.instID, i.instFirstName, i.instMiddleName, i.instLastName, 
               i.instPosition, i.instCollege, i.instCampus, i.instEmail, i.instHRIS
        FROM instructors i
    `;
    db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching instructors" });
        }
        return res.json(data);
    });
});

// Get certificates created by a specific instructor with nonteach details
app.get('/certificates', (req, res) => {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sql = `
        SELECT 
            c.certID, c.dateSubmitted, c.timeSubmitted, 
            c.serviceStartDate, c.serviceEndDate, c.serviceRemarks, 
            c.instID, n.actTitle, n.actHours
        FROM certificates c
        LEFT JOIN nonteach n ON c.certID = n.certID
        WHERE c.instID = ?
    `;

    db.query(sql, [userID], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching certificates" });
        }

        // Return an array of certificates, with or without nonteach details
        return res.json(data || []);
    });
});



// Get all instructors
app.get('/approvers', (req, res) => {
    const sql = `
        SELECT i.instID, i.instFirstName, i.instMiddleName, i.instLastName, 
               i.instPosition, i.instCollege, i.instCampus, i.instEmail, i.instHRIS
        FROM instructors i
    `;
    db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching instructors" });
        }
        return res.json(data);
    });
});

// Add a new certificate with optional nonteach details
app.post('/certificates', (req, res) => {
    const { 
        dateSubmitted, 
        timeSubmitted, 
        serviceStartDate, 
        serviceEndDate, 
        serviceRemarks, 
        instID, 
        actTitle, 
        actHours 
    } = req.body;

    // Validate required fields
    if (!dateSubmitted || !timeSubmitted || !serviceStartDate || !serviceEndDate || !instID) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert certificate details
    const certificateSQL = `
        INSERT INTO certificates (dateSubmitted, timeSubmitted, serviceStartDate, serviceEndDate, serviceRemarks, instID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
        certificateSQL,
        [dateSubmitted, timeSubmitted, serviceStartDate, serviceEndDate, serviceRemarks || 'No remarks', instID],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error adding certificate" });
            }

            // If nonteach details are provided, insert them into the `nonteach` table
            const certID = result.insertId; // Get the inserted certificate ID
            if (actTitle && actHours) {
                const nonteachSQL = `
                    INSERT INTO nonteach (certID, actTitle, actHours)
                    VALUES (?, ?, ?)
                `;
                db.query(nonteachSQL, [certID, actTitle, actHours], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Error adding nonteach details" });
                    }

                    // Respond with success message and the full data
                    return res.status(201).json({
                        message: "Certificate and nonteach details added successfully",
                        certID,
                        dateSubmitted,
                        timeSubmitted,
                        serviceStartDate,
                        serviceEndDate,
                        serviceRemarks,
                        actTitle,
                        actHours,
                    });
                });
            } else {
                // If no nonteach details, just return certificate success
                return res.status(201).json({
                    message: "Certificate added successfully without nonteach details",
                    certID,
                    dateSubmitted,
                    timeSubmitted,
                    serviceStartDate,
                    serviceEndDate,
                    serviceRemarks,
                });
            }
        }
    );
});


// Delete a certificate by ID
app.delete('/certificates/:id', (req, res) => {
    const certID = req.params.id;
    const sql = "DELETE FROM certificates WHERE certID = ?";

    db.query(sql, [certID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting certificate');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Certificate not found');
        }

        return res.send('Certificate deleted successfully');
    });
});

// Delete an instructor by ID
app.delete('/instructors/:id', (req, res) => {
    const instID = req.params.id;
    const sql = "DELETE FROM instructors WHERE instID = ?";

    db.query(sql, [instID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting instructor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Instructor not found');
        }

        return res.send('Instructor deleted successfully');
    });
});

// Fetch a certificate by ID
app.get('/certificates/:id', (req, res) => {
    const certID = req.params.id;

    const certificateSQL = `
        SELECT c.certID, c.dateSubmitted, c.timeSubmitted, 
               c.serviceStartDate, c.serviceEndDate, c.serviceRemarks, 
               c.instID, n.actTitle, n.actHours 
        FROM certificates c
        LEFT JOIN nonteach n ON c.certID = n.certID
        WHERE c.certID = ?
    `;

    db.query(certificateSQL, [certID], (err, results) => {
        if (err) {
            console.error("Error fetching certificate:", err);
            return res.status(500).json({ error: "Error fetching certificate" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Certificate not found" });
        }

        return res.json(results[0]); // Return the certificate details
    });
});

// Update a certificate by ID
app.put('/certificates/:id', (req, res) => {
    const certID = req.params.id;
    const {
        dateSubmitted,
        timeSubmitted,
        serviceStartDate,
        serviceEndDate,
        serviceRemarks,
        instID,
        actTitle,
        actHours,
    } = req.body;

    // Validate required fields
    if (!dateSubmitted || !timeSubmitted || !serviceStartDate || !serviceEndDate || !instID) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Update certificate details
    const certificateSQL = `
        UPDATE certificates 
        SET dateSubmitted = ?, 
            timeSubmitted = ?, 
            serviceStartDate = ?, 
            serviceEndDate = ?, 
            serviceRemarks = ?, 
            instID = ?
        WHERE certID = ?
    `;

    db.query(
        certificateSQL,
        [
            dateSubmitted,
            timeSubmitted,
            serviceStartDate,
            serviceEndDate,
            serviceRemarks || 'No remarks', // Provide default value if no remarks
            instID,
            certID,
        ],
        (err, result) => {
            if (err) {
                console.error("Error updating certificates table:", err);
                return res.status(500).json({ error: "Error updating certificate" });
            }

            // If no rows were updated, respond with an error
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Certificate not found" });
            }

            // Check and update nonteach details if provided
            if (actTitle && actHours) {
                const nonteachSQL = `
                    UPDATE nonteach 
                    SET actTitle = ?, 
                        actHours = ?
                    WHERE certID = ?
                `;
                db.query(nonteachSQL, [actTitle, actHours, certID], (err, nonteachResult) => {
                    if (err) {
                        console.error("Error updating nonteach table:", err);
                        return res.status(500).json({ error: "Error updating nonteach details" });
                    }

                    // If no rows were updated, log the info (optional)
                    if (nonteachResult.affectedRows === 0) {
                        console.warn("Nonteach details not found for certID:", certID);
                    }

                    return res.json({ message: "Certificate and nonteach details updated successfully" });
                });
            } else {
                // If no nonteach details, respond with success for certificate update
                return res.json({ message: "Certificate updated successfully without nonteach details" });
            }
        }
    );
});

// Start server
app.listen(8081, () => {
    console.log("Server is running on port 8081");
});
