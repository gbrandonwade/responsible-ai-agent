// netlify/functions/health.js
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

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ResponsibleAI Dashboard API',
    environment: {
      node_version: process.version,
      netlify_function: true,
      openai_configured: !!process.env.OPENAI_API_KEY
    },
    version: '2.0.0'
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(healthData, null, 2)
  };
};
