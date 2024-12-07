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
            return res.json({ success: true, message: "Login Successfully" });
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

// Get all certificates with instructors
app.get('/certificates', (req, res) => {
    const sql = `
        SELECT c.certID, c.dateSubmitted, c.timeSubmitted, c.serviceStartDate, 
               c.serviceEndDate, c.serviceRemarks, i.instID, i.instFirstName, 
               i.instLastName, i.instPosition
        FROM certificates c
        INNER JOIN instructors i ON c.instID = i.instID
    `;
    db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching certificates" });
        }
        return res.json(data);
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

// Add a new certificate
app.post('/certificates', (req, res) => {
    const { dateSubmitted, timeSubmitted, serviceStartDate, serviceEndDate, serviceRemarks, instID } = req.body;

    if (!dateSubmitted || !timeSubmitted || !serviceStartDate || !serviceEndDate || !instID) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        INSERT INTO certificates (dateSubmitted, timeSubmitted, serviceStartDate, serviceEndDate, serviceRemarks, instID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [dateSubmitted, timeSubmitted, serviceStartDate, serviceEndDate, serviceRemarks || 'No remarks', instID], 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error adding certificate" });
            }
            return res.status(201).json({ message: "Certificate added successfully" });
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

// Start server
app.listen(8081, () => {
    console.log("Server is running on port 8081");
});
