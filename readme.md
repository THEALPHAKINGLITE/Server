# 🚀 TUTORIAL-MD Hybrid Auto-Deployment Server

http://googleusercontent.com/image_collection/image_retrieval/13858417238949816106_0

> **The ultimate multi-platform bridge between WhatsApp, Telegram, and Web Management.**

TUTORIAL-MD is a sophisticated deployment engine that allows users to link WhatsApp bots via a modern Web Dashboard or a Telegram Bot interface. Built on **Node.js**, **Express**, and **Baileys**, it simplifies bot scaling and session persistence.

---

## 🌟 Key Features

- **🌐 Dual-Entry Pairing:** Generate pairing codes via the Glassmorphism Web UI or Telegram `/pair` command.
- **🔄 Auto-Reconnection:** Intelligent session monitoring that restores bot connections after server restarts or network blips.
- **📊 Real-Time Analytics:** Live dashboard tracking active bot instances, total users, and system uptime.
- **🛡️ Session Security:** Isolated file-based authentication with automatic cleanup for logged-out accounts.
- **☁️ Cloud Ready:** Optimized for VPS, Render, and Railway deployments with persistent storage support.

---

## 🛠️ System Architecture



The system acts as a centralized controller. The **Express API** handles the web frontend, the **Telegram API** handles remote commands, and the **Baileys Engine** spawns independent socket connections for every linked number.

---

## 🚀 Deployment Methods

### 1. VPS / Dedicated Server (Recommended)
*Best for maximum stability and zero-latency response.*

**Prerequisites:** Ubuntu 20.04+, Node.js 18+, PHP 7.4+

```bash
# Clone the repository
git clone [https://github.com/THEALPHAKINGLITE/Server.git](https://github.com/THEALPHAKINGLITE/Server.git)
cd Server

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file and add:
# TELEGRAM_TOKEN=your_token_here
# PORT=3000

# Start the server with PM2 for 24/7 uptime
npm install pm2 -g
pm2 start index.js --name "tutorial-md"
