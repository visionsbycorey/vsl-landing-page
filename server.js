const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Form submission endpoint
app.post('/api/submit-form', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            businessName,
            businessType,
            phone,
            city,
            revenue,
            challenge,
            submittedAt
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !businessName || !phone || !city) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create email content
        const emailContent = `
            <h2>New Local Authority Program Application</h2>
            <hr>
            <p><strong>Submitted:</strong> ${new Date(submittedAt).toLocaleString()}</p>
            <hr>
            
            <h3>Applicant Information</h3>
            <p><strong>First Name:</strong> ${firstName}</p>
            <p><strong>Last Name:</strong> ${lastName}</p>
            <p><strong>Business Name:</strong> ${businessName}</p>
            <p><strong>Business Type:</strong> ${businessType}</p>
            <p><strong>Phone Number:</strong> ${phone}</p>
            <p><strong>City:</strong> ${city}</p>
            
            <h3>Business Information</h3>
            <p><strong>Current Monthly Revenue:</strong> ${revenue}</p>
            <p><strong>Biggest Challenge Right Now:</strong></p>
            <p>${challenge}</p>
            
            <hr>
            <p><em>This is an automated email from your Visions By Corey landing page.</em></p>
        `;

        console.log('Attempting to send email to:', 'info@visionsbycorey.com');

        // Send email using Resend's verified domain
        const emailResponse = await resend.emails.send({
            from: 'Local Authority Program <onboarding@resend.dev>',
            to: 'info@visionsbycorey.com',
            subject: `New Application: ${firstName} ${lastName} - ${businessName}`,
            html: emailContent
        });

        console.log('Email response:', emailResponse);

        if (emailResponse.error) {
            console.error('Resend error:', emailResponse.error);
            throw new Error(emailResponse.error.message);
        }

        console.log('Email sent successfully:', emailResponse.id);

        res.json({ 
            success: true, 
            message: 'Application submitted successfully' 
        });

    } catch (error) {
        console.error('Error submitting form:', error.message);
        res.status(500).json({ 
            error: 'Failed to submit application. Please try again.',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Serve index.html for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8889;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Resend API Key configured: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`);
});
