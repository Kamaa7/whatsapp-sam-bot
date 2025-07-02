require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Knowledge base
const KNOWLEDGE_BASE = `
Kishnani Associates offers:
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
    const togetherResponse = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: "mistralai/Mistral-7B-Instruct-v0.2",  // ✅ SERVERLESS MODEL
        messages: [
          {
            role: "system",
            content: `You are a professional assistant for Kishnani Associates. Use ONLY this knowledge to answer: ${KNOWLEDGE_BASE}`
          },
          {
            role: "user",
            content: incomingMessage
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = togetherResponse.data.choices[0].message.content.trim();
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
