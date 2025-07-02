// index.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Static Knowledge Base
const KNOWLEDGE_BASE = `
Kishnani Associates offers the following services:
- Taxation (ITR filing, GST registration, GST returns, advisory)
- Compliance (ROC filings, company incorporation)
- Auditing (internal, statutory)
- Financial & legal consulting (NRI/HNI support)
`;

// Health Check Route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// WhatsApp Webhook Handler
app.post('/whatsapp', async (req, res) => {
  const incomingMessage = req.body.Body;
  const fromNumber = req.body.From;

  console.log('Incoming message:', incomingMessage);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful and professional assistant for a CA firm named Kishnani Associates. Use the following knowledge base to answer questions accurately:\n\n${KNOWLEDGE_BASE}`
        },
        {
          role: "user",
          content: incomingMessage
        }
      ]
    });

    const aiReply = response.choices[0].message.content.trim();

    console.log('AI Reply:', aiReply);

    // Send reply on WhatsApp
    await client.messages.create({
      body: aiReply,
      from: 'whatsapp:+14155238886', // Twilio sandbox or purchased number
      to: fromNumber
    });

    res.status(200).end();
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('Error processing the message.');
  }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
