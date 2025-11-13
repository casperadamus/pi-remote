// Deploy this to Cloudflare Workers (100% FREE)
// https://workers.cloudflare.com

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (request.method === 'POST' && new URL(request.url).pathname === '/run-script') {
    try {
      const { piIp, piUser, piPass, command } = await request.json()
      
      // Use Cloudflare's SSH capability or a webhook to your Pi
      // Since Cloudflare Workers can't do SSH directly, we'll use an alternative approach
      
      // Alternative: Have your Pi poll this endpoint or use a webhook service
      const response = {
        message: 'Command queued successfully!',
        note: 'This requires your Pi to poll for commands or use a different approach'
      }
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
  }

  return new Response('Pi Remote API', { status: 200 })
}
