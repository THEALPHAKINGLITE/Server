const express = require('express');
const cors = require('cors');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    DisconnectReason,
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure sessions directory exists
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir);
}

// Global Stats & Active Connections track
let stats = { bots: 0, users: 0, uptime: "0%" };
const activeRequests = new Map(); // Prevents duplicate pairing requests
const startTime = Date.now();

// Utility: Format Uptime
function getUptime() {
    const diff = Date.now() - startTime;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
}

app.get('/stats', (req, res) => {
    stats.uptime = getUptime();
    res.json(stats);
});

app.get('/pairing', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ message: "Number is required" });

    num = num.replace(/[^0-9]/g, '');

    // 1. Prevent overlapping requests for the same number
    if (activeRequests.has(num)) {
        return res.status(429).json({ message: "Request already in progress for this number." });
    }
    activeRequests.set(num, true);

    try {
        const sessionPath = path.join(sessionsDir, num);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            syncFullHistory: false // Saves memory/data
        });

        // 2. Request Pairing Code
        if (!sock.authState.creds.registered) {
            await delay(2000); // Wait for socket to initialize
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ message: "This number is already linked!" });
        }

        // 3. Connection Monitor
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log(`[SUCCESS] Connected: ${num}`);
                stats.bots++;
                stats.users++;
                activeRequests.delete(num);
                
                await sock.sendMessage(sock.user.id, { 
                    text: `*TUTORIAL-MD LINKED*\n\nYour bot is now active. Stats updated on dashboard.` 
                });
            }

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                activeRequests.delete(num);
                
                // If logged out by user, delete the session folder
                if (reason === DisconnectReason.loggedOut) {
                    console.log(`[LOGOUT] Session deleted for ${num}`);
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    if(stats.bots > 0) stats.bots--;
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (error) {
        console.error("Pairing Error:", error);
        activeRequests.delete(num);
        res.status(500).json({ message: "Server error during pairing" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    =========================================
    🚀 DEPLOYMENT SERVER RUNNING
    🔗 URL: http://localhost:${PORT}
    📁 SESSIONS: ${sessionsDir}
    =========================================
    `);
});
