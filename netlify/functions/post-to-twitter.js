// netlify/functions/post-to-twitter.js - FIXED FOR TWITTER API v2
// Posts approved content using Twitter API v2 with proper authentication

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
    // Get Twitter API v2 credentials (prioritize OAuth 2.0)
    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
    const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN; 
    const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
    const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
    const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;

    // Check if we have required credentials
    if (!TWITTER_BEARER_TOKEN && (!TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET)) {
      throw new Error('Twitter API credentials not properly configured. Need either BEARER_TOKEN or ACCESS_TOKEN+ACCESS_SECRET');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { content, entryId, githubIssueNumber } = body;

    if (!content) {
      throw new Error('Content is required');
    }

    if (content.length > 280) {
      throw new Error(`Content exceeds Twitter character limit: ${content.length}/280 characters`);
    }

    console.log('Posting to Twitter via API v2:', content.substring(0, 50) + '...');

    // Prepare the tweet data
    const tweetData = {
      text: content
    };

    let tweetResponse;

    // Try OAuth 2.0 Bearer token first (app-only auth)
    if (TWITTER_BEARER_TOKEN) {
      console.log('Attempting with Bearer Token...');
      
      tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ResponsibleAI-Bot/2.0'
        },
        body: JSON.stringify(tweetData)
      });

      // Bearer token might not work for posting, try OAuth 1.0a
      if (!tweetResponse.ok && (TWITTER_ACCESS_TOKEN && TWITTER_ACCESS_SECRET)) {
        console.log('Bearer token failed, trying OAuth 1.0a...');
        tweetResponse = await postWithOAuth1(tweetData, {
          TWITTER_API_KEY,
          TWITTER_API_SECRET, 
          TWITTER_ACCESS_TOKEN,
          TWITTER_ACCESS_SECRET
        });
      }
    } else if (TWITTER_ACCESS_TOKEN && TWITTER_ACCESS_SECRET) {
      // Use OAuth 1.0a directly
      console.log('Using OAuth 1.0a...');
      tweetResponse = await postWithOAuth1(tweetData, {
        TWITTER_API_KEY,
        TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN, 
        TWITTER_ACCESS_SECRET
      });
    }

    if (!tweetResponse.ok) {
      const errorData = await tweetResponse.json().catch(() => ({}));
      console.error('Twitter API v2 error:', errorData);
      throw new Error(`Twitter API error: ${tweetResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const responseData = await tweetResponse.json();
    
    if (!responseData.data || !responseData.data.id) {
      throw new Error('Invalid response from Twitter API - no tweet ID returned');
    }

    console.log('Tweet posted successfully:', responseData.data.id);

    // Get Twitter username for URL (you should set this to your actual handle)
    const twitterHandle = process.env.TWITTER_HANDLE || 'ResponsibleAI';
    const tweetUrl = `https://twitter.com/${twitterHandle}/status/${responseData.data.id}`;

    // Update GitHub issue with posting confirmation
    try {
      await updateGitHubWithPosting(entryId, githubIssueNumber, {
        id: responseData.data.id,
        text: content,
        url: tweetUrl,
        created_at: new Date().toISOString()
      });
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
        message: 'Content posted to Twitter successfully via API v2',
        tweet: {
          id: responseData.data.id,
          url: tweetUrl,
          posted_at: new Date().toISOString(),
          content: content,
          character_count: content.length,
          api_version: 'v2'
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
        timestamp: new Date().toISOString(),
        api_version: 'v2'
      })
    };
  }
};

// OAuth 1.0a posting function (for when Bearer token isn't sufficient)
async function postWithOAuth1(tweetData, credentials) {
  const crypto = require('crypto');
  
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = credentials;
  
  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
    throw new Error('Missing OAuth 1.0a credentials');
  }

  // Generate OAuth signature
  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY,
    oauth_token: TWITTER_ACCESS_TOKEN,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };

  // Create signature base string
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
    .join('&');

  const baseString = `POST&${encodeURIComponent('https://api.twitter.com/2/tweets')}&${encodeURIComponent(paramString)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(TWITTER_API_SECRET)}&${encodeURIComponent(TWITTER_ACCESS_SECRET)}`;
  
  // Generate signature
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
  oauthParams.oauth_signature = signature;

  // Create authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'User-Agent': 'ResponsibleAI-Bot/2.0'
    },
    body: JSON.stringify(tweetData)
  });
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
    `**Tweet URL:** ${tweetData.url}\n` +
    `**Posted at:** ${tweetData.created_at}\n` +
    `**Tweet ID:** ${tweetData.id}\n` +
    `**Character Count:** ${tweetData.text.length}/280\n` +
    `**API Version:** Twitter API v2\n\n` +
    `**Content Posted:**\n> ${tweetData.text}\n\n` +
    `---\n*Automatically posted via ResponsibleAI Dashboard*`;

  const commentResponse = await fetch(commentUrl, {
    method: 'POST',
    headers: githubHeaders,
    body: JSON.stringify({ body: commentBody })
  });

  if (!commentResponse.ok) {
    console.warn('Failed to add comment to GitHub issue');
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
