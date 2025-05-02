# Cleo NFT Chat Server

This project sets up a Node.js server that:  
✅ lets you chat with a virtual character (Cleo) via a web interface,  
✅ tracks real-time NFT transfers on Hedera,  
✅ connects with Unity to make a character react based on chat messages.

---

## 🚀 How It Works

The server listens to two streams:  
- chat messages sent from the web interface (via Socket.IO),  
- real-time NFT transfers from Hedera Mirror Node (via REST polling).

When a message contains `@cleo`, it triggers a response from:  
- AI system connected through the **ELISA** endpoint.
- either **OpenAI**,  


All responses are then sent back to:  
- the web interface,  
- Unity, using the provided sample script.

---

## 📦 Installation

1️⃣ Clone the project:  
```bash
git clone <this-repo-url>
cd <this-repo-folder>
```
2️⃣ Install dependencies:
```bash
npm install
```
3️⃣ Create a .env file in the root directory:
```bash
OPENAI_API_KEY=API_KEY_TO_FILL
ELISA_ENDPOINT=IP_TO_FILL
MODEL=OPENAI or ELISA
```
4️⃣ Start the server:
```bash
node server.js
```
The server will run at http://localhost:5005.

## 💬 Web Interface

The web chat interface is available here:
👉 https://github.com/neallausson/WebChatBot

Clone that repository, install it, and connect it to your local server to interact live with Cleo.

## 🎮 Unity Sample

Inside the Sample/ folder, you’ll find a Unity script ready to use.
This script allows you to:

- poll the server regularly,

- make a character react based on incoming chat or NFT events.

Integrate it into your Unity project to bring your characters to life using chat and NFT signals.

## 🛠 Technologies Used
- Node.js + Express

- Socket.IO

- ELISA OS ( + Hedera plugin)

- OpenAI SDK

- Hedera Mirror Node API

- Unity (sample script)

## 📍 Notes
- The Hedera polling interval is set to 5 seconds (you can adjust this in server.js).

- The AI model is selected dynamically via the .env variable → MODEL.