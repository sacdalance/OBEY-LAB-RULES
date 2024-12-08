export const generateCertificateHTML = (cert, user, apprDate, apprTime) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Service</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.4;
            display: flex;
            flex-direction: row;
            overflow-x: hidden; 
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
            padding: 20px;
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
            font-size: 20px;
        }
        #info p{
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table, th, td {
            border: 1px solid #ddd;
        }

        th, td {
            padding: 5px;
            text-align: center;
        }

        h2 {
            font-weight: normal;
        }

        .footer {
            font-size: 15px;
        }

    </style>
</head>
<body>
    <div class="container">
        <!-- Left Half -->
        <div class="half-page">
            <div class="header">
                <img src="Black-UP-Logo.webp" alt="University Logo">
                <div>
                    <h1>UNIVERSITY OF THE PHILIPPINES BAGUIO</h1>
                    <h2>Governor Pack Road, Baguio City</h2>
                </div>
            </div>
            <div class="formCode">
                <p>UP-HR Form No. 0055 (UP Form No. 65-A)</p>
                <p>Revised 12 Oct 2016</p>
                <p>COS No. 000215007</p>
            </div>
            
            <div class="section" id="title">
                <p><strong>CERTIFICATE OF SERVICE</strong></p>
            </div>

            <div class="section" id="info">
                <p>For the month of <u>${cert.month}</u>, <u>${cert.year}</u></p>
                <p>Name: <u>${user.instFirstName} ${user.instMiddleName} ${user.instLastName}</u></p>
                <p>Position: <u>${user.instPosition}</u></p>
                <p>College/Unit: <u>${user.instCollege}</u></p>
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
                        ${cert.activities.map(activity => `
                            <tr>
                                <td>${activity.actTitle}</td>
                                <td>${activity.actHours}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <p>I hereby certify, upon my honor, that I have rendered full service for the period of <u>${cert.serviceStartDate} to ${cert.serviceEndDate}</u>.</p>
                <p><strong>Date & Time Submitted:</strong> ${cert.dateSubmitted} ${cert.timeSubmitted}</p>
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
                        <td>${user.apprFirstName}</td>
                        <td>${cert.serviceRemarks}</td>
                        <td>${apprDate} ${apprTime}</td>
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

        <!-- Right Half -->
        <div class="half-page">
            <!-- Repeat similar structure as left half -->
        </div>
    </div>
</body>
</html>
`;
