const express = require('express');
const fs = require('fs');
const app = express();

// Trust proxy agar aap Vercel ya Render par deploy kar rahe hain taaki real IP mile
app.set('trust proxy', true);

const TARGET_URL = 'https://youtu.be/e3xcr35mVvQ?si=Icbxs2yjD-yWsZgj'; // Yahan apna target link daalein jahan user ko bhejna hai

app.get('/', (req, res) => {
    // Visitor ka IP address nikalna
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();

    // Log data taiyar karna
    const logData = `[${timestamp}] | IP: ${ip} | User-Agent: ${userAgent}\n`;

    // Console mein print karna
    console.log(logData);

    // File mein save karna (optional, agar cloud par file system writable ho)
    fs.appendFile('logs.txt', logData, (err) => {
        if (err) console.log('Error saving log');
    });

    // User ko target URL par redirect kar dena bina kisi warning ke
    res.redirect(TARGET_URL);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
