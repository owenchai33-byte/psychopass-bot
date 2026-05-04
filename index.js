// Psycho Pass — Instagram DM Chatbot Webhook
// Runtime: Node.js | Deploy: Railway or Render (both free)
// Required env var: GROQ_API_KEY

const express = require('express');
const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `paste your full system prompt here`;

const sessions = {};

app.post('/webhook', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message || !user_id) {
      return res.status(400).json({ error: 'Missing message or user_id' });
    }

    if (!sessions[user_id]) sessions[user_id] = [];
    sessions[user_id].push({ role: 'user', content: message });

    const history = sessions[user_id].slice(-20);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ],
        max_tokens: 1024,
        temperature: 0.75
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "something went wrong, try again?";

    sessions[user_id].push({ role: 'assistant', content: reply });
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/', (req, res) => res.send('Psycho Pass bot is live'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on port ' + PORT));
