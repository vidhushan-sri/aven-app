exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const AGENT_URL = 'http://104.196.63.225:3000';
  const path = event.path.replace('/.netlify/functions/proxy', '').replace('/status', '/health');
  const targetUrl = `${AGENT_URL}${path}`;
  
  console.log('Event path:', event.path);
  console.log('Calling:', targetUrl);
  
  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: event.httpMethod === 'POST' ? event.body : null,
    });

    const text = await response.text();
    console.log('Response:', text.substring(0, 200));
    
    const data = JSON.parse(text);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.log('Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, path: event.path }),
    };
  }
};
