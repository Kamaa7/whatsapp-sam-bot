const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/whatsapp', async (req, res) => {
  const userMessage = req.body.Body;
  console.log(`Received WhatsApp message: ${userMessage}`);

  let botReply = "Hi! I am Sam from Kishnani Associates. How can I help you?";

  try {
    // OPTIONAL: Replace this with your real AI endpoint
    const aiResponse = await axios.post('YOUR_AI_ENDPOINT_URL_HERE', {
      userMessage
    });
    botReply = aiResponse.data.reply;
  } catch (error) {
    console.error("AI call failed:", error.message);
    // Fallback message
    botReply = "Hi! I am Sam from Kishnani Associates. Please tell me more.";
  }

  const twiml = new MessagingResponse();
  twiml.message(botReply);
  res.type('text/xml').send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
