require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio Credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Vapi Config
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const ASSISTANT_ID = '0ed118a4-d783-4cb7-894d-69cd0eea7e3d';
const VAPI_ENDPOINT = `https://api.vapi.ai/chat`;

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
    // Send the message to Vapi
    const vapiResponse = await axios.post(
      VAPI_ENDPOINT,
      {
        assistantId: ASSISTANT_ID,
        input: incomingMessage
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Correctly parse the assistant's response
    let aiReply = "Sorry, I couldn't understand.";

    if (vapiResponse.data && Array.isArray(vapiResponse.data.messages)) {
      const assistantMessage = vapiResponse.data.messages.find(
        (m) => m.role === 'assistant' && m.content
      );

      if (assistantMessage) {
        aiReply = assistantMessage.content;
      }
    }

    console.log('AI Reply:', aiReply);

    // Send the AI's reply back via Twilio WhatsApp
    await client.messages.create({
      body: aiReply,
      from: 'whatsapp:+14155238886',
      to: fromNumber
    });

    res.status(200).end();
  } catch (error) {
    console.error('Error communicating with Vapi or Twilio:', error.response?.data || error.message);
    res.status(500).send('Error processing the message.');
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
