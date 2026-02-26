// Set ALLOWED_ORIGIN env var in production to restrict CORS to your domain
export default async function handler(req, res) {
  // Dynamic CORS origin — allows any origin in dev (when ALLOWED_ORIGIN is unset),
  // restricts to configured origin in production
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
  const origin = req.headers.origin
  const corsOrigin = (origin === ALLOWED_ORIGIN || !process.env.ALLOWED_ORIGIN) ? (origin || ALLOWED_ORIGIN) : ALLOWED_ORIGIN
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  /** Default system prompt — overridden by client-sent systemPrompt with page context */
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

Keep responses concise (2-4 sentences) unless they ask for details.
Never provide specific dollar estimates or guarantee claim approval.`;

  try {
    // Client sends dynamic system prompt with page context; falls back to default
    const { messages, systemPrompt } = req.body;

    // Server-side safety cap in addition to the client-side cap
    const capped = (messages || []).slice(-10);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
          ...capped.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({ response: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'Invalid response from AI' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
