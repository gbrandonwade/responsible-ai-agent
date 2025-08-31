// netlify/functions/health.js - LIVE VERSION
// Health check with API connectivity testing

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

  try {
    // Get environment info
    const nodeVersion = process.version;
    
    // Check API credentials
    const githubConfigured = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO_OWNER && process.env.GITHUB_REPO_NAME);
    const twitterConfigured = !!(process.env.TWITTER_BEARER_TOKEN && process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET);
    const openaiConfigured = !!process.env.OPENAI_API_KEY;

    // Test API connectivity (quick checks)
    const apiConnectivity = await testAPIConnectivity();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ResponsibleAI Dashboard API - LIVE SYSTEM',
      environment: {
        node_version: nodeVersion,
        netlify_function: true,
        demo_mode: false
      },
      api_configuration: {
        github_configured: githubConfigured,
        twitter_configured: twitterConfigured,
        openai_configured: openaiConfigured,
        repository: githubConfigured ? `${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}` : 'Not configured'
      },
      api_connectivity: apiConnectivity,
      version: '2.0.0-live',
      features: {
        github_integration: githubConfigured,
        twitter_posting: twitterConfigured,
        real_analytics: githubConfigured,
        live_dashboard: true
      }
    };

    // Determine overall health status
    const criticalIssues = [];
    if (!githubConfigured) criticalIssues.push('GitHub API not configured');
    if (!twitterConfigured) criticalIssues.push('Twitter API not configured');
    
    if (criticalIssues.length > 0) {
      healthStatus.status = 'degraded';
      healthStatus.critical_issues = criticalIssues;
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(healthStatus, null, 2)
    };

  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'ResponsibleAI Dashboard API - LIVE SYSTEM',
        error: error.message,
        demo_mode: false
      })
    };
  }
};

async function testAPIConnectivity() {
  const connectivity = {
    github: { status: 'unchecked', message: '' },
    twitter: { status: 'unchecked', message: '' },
    last_checked: new Date().toISOString()
  };

  // Test GitHub API connectivity (lightweight check)
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO_OWNER && process.env.GITHUB_REPO_NAME) {
    try {
      const githubResponse = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ResponsibleAI-HealthCheck'
          }
        }
      );

      if (githubResponse.ok) {
        connectivity.github = { status: 'connected', message: 'Repository accessible' };
      } else {
        connectivity.github = { status: 'error', message: `HTTP ${githubResponse.status}` };
      }
    } catch (error) {
      connectivity.github = { status: 'error', message: error.message };
    }
  } else {
    connectivity.github = { status: 'not_configured', message: 'Missing GitHub credentials' };
  }

  // Test Twitter API connectivity (lightweight check)
  if (process.env.TWITTER_BEARER_TOKEN) {
    try {
      const twitterResponse = await fetch('https://api.twitter.com/2/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'User-Agent': 'ResponsibleAI-HealthCheck'
        }
      });

      if (twitterResponse.ok) {
        connectivity.twitter = { status: 'connected', message: 'Twitter API accessible' };
      } else {
        connectivity.twitter = { status: 'error', message: `HTTP ${twitterResponse.status}` };
      }
    } catch (error) {
      connectivity.twitter = { status: 'error', message: error.message };
    }
  } else {
    connectivity.twitter = { status: 'not_configured', message: 'Missing Twitter credentials' };
  }

  return connectivity;
}
