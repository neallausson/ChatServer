require('dotenv').config();
const express = require('express');
const http = require('http');
const { OpenAI } = require('openai');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

let lastCleoMessage = '';

app.get('/', (req, res) => {
  res.send('ping');
});

app.get('/cleo-latest', (req, res) => {
  res.json({ message: lastCleoMessage });
  lastCleoMessage = ''; // Reset after sending
});

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"]
  }
});

const openai = new OpenAI(process.env.OPENAI_API_KEY);
const modelType = process.env.MODEL;
const elisaEndpoint = process.env.ELISA_ENDPOINT;

const content = "You are Cleo from Legends of the Past.Born in 69 BC in Alexandria, Cleo never cared much for scrolls — she turned them into punching bags to train her fists. While others studied in the Great Library, she was already building her legend with every strike. Sent to the Alexandria Boxing Club, she quickly became its only member — no one dared face her.Hungry for greater challenges, she left Egypt to enter the Roman Pugilist Tournament. One by one, she defeated every opponent and was crowned the strongest fighter in the known world by the age of 17. Political factions tried to win her over, but she despised their cowardice — none of them dared step into the ring.She sent Pompey flying to Brindisi with a single punch and knocked Caesar across the Rubicon. “The die is cast,” he said. “Egypt belongs to Cléo.”Returning to her homeland, she was hailed as Queen — not for her bloodline, but for her strength, her pride, and her unbreakable will.Now, she fights among legends — where only the greatest belong. , answer with a short answer in english";

let lastSeenTimestamp = 0;

// === Poll Hedera NFT transfers ===
setInterval(async () => {
  try {
    const res = await fetch('https://mainnet-public.mirrornode.hedera.com/api/v1/transactions?transactiontype=cryptotransfer&order=desc&limit=15');
    const data = await res.json();

    if (data.transactions && data.transactions.length > 0) {
      for (let i = data.transactions.length - 1; i >= 0; i--) {
        const tx = data.transactions[i];
        if (tx.consensus_timestamp >= lastSeenTimestamp) {
          lastSeenTimestamp = tx.consensus_timestamp;
          if (tx.nft_transfers && tx.nft_transfers.length > 0) {
            tx.nft_transfers.forEach(nft => {
              console.log('NFT Transfer Detected:', {
                token_id: nft.token_id,
                serial_number: nft.serial_number,
                sender: nft.sender_account_id,
                receiver: nft.receiver_account_id,
                timestamp: tx.consensus_timestamp
              });
              lastCleoMessage = "One Cleo NFT just got bought!";
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching NFT transfers:', err);
  }
}, 5000);

// === Socket.IO chat ===
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté :', socket.id);

  socket.on('chat message', async (msg) => {
    console.log(`Message reçu de ${socket.id} : ${msg}`);

    io.emit('chat message', msg);

    if (msg.includes('@cleo')) {
      try {
        let reply = '';

        if (modelType === 'OPENAI') {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: content },
              { role: "user", content: msg }
            ],
            store: true,
          });

          reply = response.choices[0].message.content;
        } else if (modelType === 'ELISA') {
          const res = await fetch(elisaEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: msg })
          });
          const data = await res.json();
          reply = data.reply || 'Elisa has no response.';
        } else {
          reply = 'Invalid MODEL configuration in .env';
        }

        console.log(reply);
        let chatResponse = reply.split(':');
        lastCleoMessage = chatResponse[chatResponse.length - 1];
        io.emit('chat message', `Cleo: ${lastCleoMessage}`);
      } catch (error) {
        console.error("Erreur lors de l'appel au modèle :", error);
        io.emit('chat message', "Cleo: Sorry, I am currently sleeping");
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté :', socket.id);
  });
});

// === Start server ===
const PORT = 5005;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
