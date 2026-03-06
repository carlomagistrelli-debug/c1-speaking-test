// Cloudflare Worker proxy for C1 Speaking Test app
// Deployment steps:
// 1. Create free Cloudflare account at cloudflare.com
// 2. Go to Workers & Pages → Create Worker → paste this file
// 3. In Worker Settings → Variables → add secrets:
//    - ANTHROPIC_KEY  (your Anthropic API key)
//    - OPENAI_KEY     (your OpenAI API key)
//    - SHARED_PASSWORD (short password shared with friends)
// 4. Deploy; copy the *.workers.dev URL into PROXY_URL in index.html
// 5. Push index.html to GitHub Pages
// 6. Share the SHARED_PASSWORD value with friends privately

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

    const auth = request.headers.get('Authorization') || '';
    if (auth !== `Bearer ${env.SHARED_PASSWORD}`) {
      return cors(new Response('Unauthorized', { status: 401 }));
    }

    const url = new URL(request.url);
    const body = await request.text();

    if (url.pathname === '/anthropic') {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body,
      });
      return cors(new Response(resp.body, {
        status: resp.status,
        headers: { 'content-type': resp.headers.get('content-type') },
      }));
    }

    if (url.pathname === '/openai-tts') {
      const resp = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      return cors(new Response(resp.body, {
        status: resp.status,
        headers: { 'content-type': 'audio/mpeg' },
      }));
    }

    return cors(new Response('Not found', { status: 404 }));
  },
};

function cors(response) {
  const r = new Response(response.body, response);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return r;
}
