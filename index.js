require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio Credentials (load from environment)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Vapi Config (load from environment)
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const ASSISTANT_ID = '7d6e2303-fecc-4a32-bf2c-d3479916ad33';
const KNOWLEDGE_BASE_ID = '4040947b-8a58-4355-b700-affb341be65b';
const VAPI_ENDPOINT = 'https://api.vapi.ai/chat';

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
    // Send to Vapi
    const vapiResponse = await axios.post(
      VAPI_ENDPOINT,
      {
        assistantId: ASSISTANT_ID,
        input: incomingMessage,
        knowledgeBaseId: KNOWLEDGE_BASE_ID
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiReply = vapiResponse.data.reply || "Sorry, I couldn't understand.";

    console.log('AI Reply:', aiReply);

    // Send back to WhatsApp
    await client.messages.create({
      body: aiReply,
      from: 'whatsapp:+14155238886',
      to: fromNumber,
    });

    res.status(200).end();
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('Error processing the message.');
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
