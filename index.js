require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Together AI
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_ENDPOINT = 'https://api.together.xyz/v1/chat/completions';

// Your Knowledge Base
const KNOWLEDGE_BASE = `
Kishnani Associates offers the following services:
- Taxation (ITR filing, GST registration, GST returns, advisory)
- Compliance (ROC filings, company incorporation)
- Auditing (internal, statutory)
- Financial & legal consulting (NRI/HNI support)
`;

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
    const response = await axios.post(
      TOGETHER_ENDPOINT,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1", // or any Together-supported model!
        messages: [
          {
            role: "system",
            content: `You are a professional assistant for Kishnani Associates. Use this knowledge base to answer questions as helpfully as possible: ${KNOWLEDGE_BASE}`
          },
          {
            role: "user",
            content: incomingMessage
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = response.data.choices[0].message.content.trim();

    console.log('AI Reply:', aiReply);

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
