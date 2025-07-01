// index.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio Credentials (replace these with your real ones)
const accountSid = 'AC338b734314a41b1d0d65c6c96f186952';
const authToken = '3de0091c39fd943caf7c35672b2c2274';
const client = twilio(accountSid, authToken);

// Vapi Config
const VAPI_PRIVATE_KEY = 'YOUR_VAPI_PRIVATE_KEY';
const ASSISTANT_ID = '0ed118a4-d783-4cb7-894d-69cd0eea7e3d';
const VAPI_ENDPOINT = `https://api.vapi.ai/assistant/${ASSISTANT_ID}/chat`;

// Health Check
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// WhatsApp Webhook
app.post('/whatsapp', async (req, res) => {
  const incomingMessage = req.body.Body;
  const fromNumber = req.body.From;

  console.log('Incoming message:', incomingMessage);

  try {
    // 1️⃣ Send the incoming message to VAPI
    const vapiResponse = await axios.post(
      VAPI_ENDPOINT,
      { message: incomingMessage },
      {
        headers: {
          Authorization: `Bearer ${c77f6f13-afe8-4748-baaa-39d0000e6172}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2️⃣ Get the AI's reply
    const aiReply = vapiResponse.data.reply || "Sorry, I couldn't understand.";

    console.log('AI Reply:', aiReply);

    // 3️⃣ Send reply back via Twilio WhatsApp
    await client.messages.create({
      body: aiReply,
      from: 'whatsapp:+14155238886',
      to: fromNumber,
    });

    res.status(200).end();
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error processing the message.');
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

