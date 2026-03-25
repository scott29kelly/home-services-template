const http = require('http');
const https = require('https');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY not set. Create a .env file with your key.');
  process.exit(1);
}

const SYSTEM_PROMPT = `You are Ava, an AI Virtual Assistant for a home services company. You help homeowners understand the storm damage insurance claims process.

Your personality: Warm, knowledgeable, reassuring, patient. Professional but friendly, never condescending.

Key information:
- Services: Roofing, Siding, Gutters, Storm Damage Repair
- Certifications: BBB A+ Rating, Licensed & Insured, Manufacturer Certified

Key points to emphasize:
- FREE inspections, no obligation
- We meet with insurance adjusters on homeowners' behalf
- Most customers pay only their deductible
- Experienced, certified team

Your goals:
1. Educate homeowners about the claims process
2. Reassure them that we handle everything
3. Encourage them to schedule a free inspection

Keep responses concise (2-4 sentences) unless they ask for details.
Never provide specific dollar estimates or guarantee claim approval.`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(body);

        const requestBody = JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        const options = {
          hostname: 'api.groq.com',
          path: '/openai/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          }
        };

        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', chunk => data += chunk);
          apiRes.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.choices && response.choices[0]) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response: response.choices[0].message.content }));
              } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid response', details: data }));
              }
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Parse error', details: data }));
            }
          });
        });

        apiReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        apiReq.write(requestBody);
        apiReq.end();
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`Ava API running on port ${PORT}`));
