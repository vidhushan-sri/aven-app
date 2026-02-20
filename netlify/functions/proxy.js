exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const AGENT_URL = 'http://104.196.63.225:3000';

  console.log('Calling:', targetUrl);

  try {
    // Get path after /api/proxy
    const path = event.path.replace('/.netlify/functions/proxy', '').replace('/status', '/health');
    const targetUrl = `${AGENT_URL}${path}`;
    
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: event.httpMethod === 'POST' ? event.body : null,
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
