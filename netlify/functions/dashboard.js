// netlify/functions/dashboard.js
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

  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResponsibleAI Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem 0;
        }
        .success {
            background: rgba(16, 185, 129, 0.2);
            border: 2px solid #10b981;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 ResponsibleAI Dashboard</h1>
        <div class="status success">
            <h2>✅ Functions Working!</h2>
            <p>Your Netlify Functions are now deploying correctly.</p>
            <p><strong>Function URL:</strong> /.netlify/functions/dashboard</p>
            <p><strong>Deploy Time:</strong> ${new Date().toISOString()}</p>
        </div>
        
        <div class="status">
            <h3>Next Steps:</h3>
            <ul style="text-align: left; display: inline-block;">
                <li>Convert remaining Python functions to Node.js</li>
                <li>Set up proper API endpoints</li>
                <li>Connect to your Python agent via GitHub Actions</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
    body: dashboardHtml
  };
};
