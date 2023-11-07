const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000; // Set your desired port

// Configure express-session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

// Store OTP in the session
app.use((req, res, next) => {
    if (!req.session.otp) {
        req.session.otp = generateOTP();
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/generateOTP', (req, res) => {
    // Regenerate and store OTP in the session
    req.session.otp = generateOTP();
    
    // Send OTP to the user's email
    sendEmail(req.body.email, req.session.otp);

    res.send({ otp: req.session.otp });
});

app.post('/verifyEmail', (req, res) => {
    const enteredOTP = req.body.otp;
    const storedOTP = req.session.otp;

    if (enteredOTP === storedOTP) {
        // Email verified
        const name = req.body.name;
        const email = req.body.email;
        // Send a success response or perform any other actions

        res.send(`Email verified for ${name} (${email})`);
    } else {
        res.status(400).send('Invalid OTP');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Function to generate a random 6-digit OTP
function generateOTP() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Function to send an OTP to the user's email
function sendEmail(toEmail, otp) {
    const transporter = nodemailer.createTransport({
        service: 'your-email-service-provider', // e.g., 'Gmail'
        auth: {
            user: 'your-email@gmail.com', // your email
            pass: 'your-email-password' // your email password
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: toEmail,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Error sending email: ${error}`);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}
