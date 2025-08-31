// netlify/functions/post-to-twitter.js - LIVE VERSION
// Posts approved content directly to Twitter

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

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    // Get Twitter API credentials from environment
    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
    const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
    const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
    const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
    const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

    if (!TWITTER_BEARER_TOKEN || !TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
      throw new Error('Twitter API credentials not configured');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { content, entryId, githubIssueNumber } = body;

    if (!content) {
      throw new Error('Content is required');
    }

    if (content.length > 280) {
      throw new Error('Content exceeds Twitter character limit (280)');
    }

    // Create OAuth 1.0a signature for Twitter API v1.1
    const oauth = createOAuthHeader({
      method: 'POST',
      url: 'https://api.twitter.com/1.1/statuses/update.json',
      consumerKey: TWITTER_API_KEY,
      consumerSecret: TWITTER_API_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessTokenSecret: TWITTER_ACCESS_SECRET,
      params: { status: content }
    });

    // Post to Twitter
    console.log('Posting to Twitter:', content.substring(0, 50) + '...');
    
    const twitterResponse = await fetch('https://api.twitter.com/1.1/statuses/update.json', {
      method: 'POST',
      headers: {
        'Authorization': oauth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        status: content
      })
    });

    if (!twitterResponse.ok) {
      const errorData = await twitterResponse.json();
      throw new Error(`Twitter API error: ${twitterResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const tweetData = await twitterResponse.json();
    
    console.log('Tweet posted successfully:', tweetData.id_str);

    // Update GitHub issue with posting confirmation (if GitHub credentials available)
    try {
      await updateGitHubWithPosting(entryId, githubIssueNumber, tweetData);
    } catch (githubError) {
      console.warn('Failed to update GitHub issue:', githubError.message);
      // Don't fail the whole request if GitHub update fails
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Content posted to Twitter successfully',
        tweet: {
          id: tweetData.id_str,
          url: `https://twitter.com/ResponsibleAI/status/${tweetData.id_str}`,
          posted_at: tweetData.created_at,
          content: tweetData.text
        },
        entry_id: entryId,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Twitter posting error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Create OAuth 1.0a authorization header for Twitter API
function createOAuthHeader({ method, url, consumerKey, consumerSecret, accessToken, accessTokenSecret, params }) {
  const crypto = require('crypto');
  
  // OAuth parameters
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    oauth_version: '1.0'
  };

  // Combine OAuth params with request params
  const allParams = { ...oauthParams, ...params };
  
  // Create parameter string
  const paramString = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');

  // Create signature base string
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  // Add signature to OAuth params
  oauthParams.oauth_signature = signature;

  // Create authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return authHeader;
}

// Update GitHub issue with posting confirmation
async function updateGitHubWithPosting(entryId, githubIssueNumber, tweetData) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
  const REPO_NAME = process.env.GITHUB_REPO_NAME;

  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME || !githubIssueNumber) {
    throw new Error('GitHub credentials or issue number missing');
  }

  const githubHeaders = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ResponsibleAI-Dashboard'
  };

  // Add comment with posting confirmation
  const commentUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${githubIssueNumber}/comments`;
  const commentBody = `## ✅ Content Posted to Twitter\n\n` +
    `**Tweet URL:** https://twitter.com/ResponsibleAI/status/${tweetData.id_str}\n` +
    `**Posted at:** ${tweetData.created_at}\n` +
    `**Tweet ID:** ${tweetData.id_str}\n\n` +
    `**Content Posted:**\n${tweetData.text}\n\n` +
    `---\n*Automatically posted via ResponsibleAI Dashboard*`;

  const response = await fetch(commentUrl, {
    method: 'POST',
    headers: githubHeaders,
    body: JSON.stringify({ body: commentBody })
  });

  if (!response.ok) {
    throw new Error(`GitHub comment failed: ${response.status}`);
  }

  // Add "posted" label and close issue
  const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${githubIssueNumber}`;
  await fetch(updateUrl, {
    method: 'PATCH',
    headers: githubHeaders,
    body: JSON.stringify({
      labels: ['content-review', 'approved', 'posted'],
      state: 'closed',
      state_reason: 'completed'
    })
  });
}
