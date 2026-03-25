// Cloudflare Worker for Ava AI Chat
// Deploy to Cloudflare Workers and set ANTHROPIC_API_KEY as a secret
// Set ALLOWED_ORIGIN secret in production to restrict CORS to your domain

/** Default system prompt — overridden by client-sent systemPrompt with page context */
const SYSTEM_PROMPT = `You are Ava, an AI Virtual Assistant for a home services company. You help homeowners understand the storm damage insurance claims process.

Your personality: Warm, knowledgeable, reassuring, patient. Professional but friendly, never condescending.

Key information:
- Services: Roofing, Siding, Gutters, Storm Damage Repair
- Certifications: BBB A+ Rating, Licensed & Insured, Manufacturer Certified

Key points to emphasize:
- FREE inspections, no obligation
- We meet with insurance adjusters on homeowners' behalf
- Most customers pay only their deductible (little to nothing out of pocket)
- Experienced, certified team

Your goals:
1. Educate homeowners about the claims process
2. Reassure them that we handle everything
3. Qualify if they may have a valid claim
4. Encourage them to schedule a free inspection

Never provide specific dollar estimates or guarantee claim approval.
Always recommend scheduling a free inspection for personalized assessment.
Keep responses concise (2-4 sentences) unless they ask for detailed explanations.`;

export default {
  async fetch(request, env) {
    // Dynamic CORS origin — allows any origin in dev (when ALLOWED_ORIGIN is unset),
    // restricts to configured origin in production
    const origin = request.headers.get('Origin')
    const allowedOrigin = env.ALLOWED_ORIGIN || 'http://localhost:5173'
    const corsOrigin = (origin === allowedOrigin || !env.ALLOWED_ORIGIN) ? (origin || allowedOrigin) : allowedOrigin
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      // Client sends dynamic system prompt with page context; falls back to default
      const { messages, systemPrompt } = await request.json();

      // Server-side safety cap in addition to the client-side cap
      const capped = (messages || []).slice(-10);

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: systemPrompt || SYSTEM_PROMPT,
          messages: capped.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      });

      const data = await anthropicResponse.json();

      if (data.content && data.content[0]) {
        return new Response(
          JSON.stringify({ response: data.content[0].text }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid response from AI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};
