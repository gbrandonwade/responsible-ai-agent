// netlify/functions/twitter-callback.js
// OAuth 2.0 callback handler for Twitter app setup

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: ''
    };
  }

  // Simple callback handler
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ResponsibleAI - Twitter OAuth Callback</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 2rem;
            }
            .container {
                background: rgba(255,255,255,0.1);
                padding: 2rem;
                border-radius: 12px;
                backdrop-filter: blur(10px);
                max-width: 500px;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            p {
                margin-bottom: 1rem;
                opacity: 0.9;
            }
            .btn {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background: rgba(255,255,255,0.2);
                border: 2px solid white;
                border-radius: 6px;
                color: white;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                margin-top: 1rem;
            }
            .btn:hover {
                background: white;
                color: #667eea;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🐦</div>
            <h1>Twitter OAuth Callback</h1>
            <p>This is the OAuth 2.0 callback endpoint for the ResponsibleAI Twitter app.</p>
            <p>This page is used during Twitter app setup and OAuth flows.</p>
            <p><strong>For content management, use the main dashboard:</strong></p>
            <a href="/.netlify/functions/dashboard" class="btn">
                🤖 Open ResponsibleAI Dashboard
            </a>
        </div>
        
        <script>
            // Handle OAuth callback if needed
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            
            if (error) {
                console.error('OAuth error:', error);
                document.querySelector('.container').innerHTML += 
                    '<p style="color: #ff6b6b; margin-top: 1rem;">OAuth Error: ' + error + '</p>';
            }
            
            if (code) {
                console.log('OAuth code received:', code);
                document.querySelector('.container').innerHTML += 
                    '<p style="color: #51cf66; margin-top: 1rem;">✅ OAuth authorization successful!</p>';
            }
        </script>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
    body: html
  };
};
