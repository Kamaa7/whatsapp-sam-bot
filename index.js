require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Detailed Knowledge Base
const KNOWLEDGE_BASE = `
Kishnani Associates, led by CA Gagan Gupta, offers full-spectrum financial and legal services for individuals, NRIs, HNIs, and companies.

✅ Services:
- Taxation (ITR filing, GST registration, GST returns, advisory)
- Compliance (ROC filings, company incorporation)
- Auditing (internal, statutory)
- Financial & legal consulting
- RBI/FEMA matters
- Startup consulting
- Global expansion support

✅ Tools & Automation:
- Botpress for chatbot automation
- Make.com/Zapier for workflows
- Google Calendar for auto-scheduling
- Zoho CRM for task and invoice management
- AI Calling APIs for reminders and updates
- Email automation to reply, flag, and follow up

✅ Email Automation:
- AI reads and filters emails
- Replies to common queries
- Flags important mails for review
- Sends follow-up reminders after 5–10 days

✅ Meeting Management:
- AI blocks Google Calendar slots
- Checks for conflicts
- Sends 30–60 min reminders
- Provides day-end meeting digest

✅ Client Support:
- Secure CRM login to track tasks, upload/download documents, view invoices
- Encrypted data storage
- Real-time WhatsApp or email updates
- AI escalates complex queries to CA Gagan Gupta for direct follow-up

✅ Document Handling:
- Upload documents via WhatsApp, chatbot, or email
- All docs reviewed by CA Gagan Gupta or team
- Automated status updates on processing

✅ RBI/FEMA Compliance:
- Guidance on FDI policy, ODI, ECB filings
- Full support for NRO/NRE accounts, fund repatriation, property purchase

✅ Litigation Support:
- Representation before Income Tax Appellate Tribunals (ITAT) and GST bodies
- Preparation of submissions, appeals, expert tax opinions
- Live tracking of case progress via CRM

✅ Payment & Follow-Ups:
- Automated reminders for unpaid invoices
- Thank-you messages post-payment
- Alerts if client documents are pending

✅ Client Onboarding:
- AI guides step-by-step for new enquiries
- GST registration help with required documents
- Company incorporation & IP (trademark, copyright) filings

✅ Human Assistance:
- For urgent or complex matters, chatbot connects you to CA Gagan Gupta directly via call or email

✅ Contact:
- WhatsApp: +91 83779 00058 (start by sending "Hi")
- Direct call: +91 9899511905
- Email: cagagangupta94@gmail.com
- Website: www.kishnani-and-associates.com
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
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: `You are a professional assistant for Kishnani Associates. Use ONLY this knowledge to answer user questions accurately and helpfully: ${KNOWLEDGE_BASE}`
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
