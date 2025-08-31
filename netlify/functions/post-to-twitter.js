// netlify/functions/post-to-twitter.js - UPDATED FOR OAUTH 2.0 & API v2
// Posts approved content using Twitter API v2 with OAuth 2.0

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
    // Get Twitter API v2 credentials
    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
    const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
    const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
    const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN; // OAuth 2.0 access token
    const TWITTER_REFRESH_TOKEN = process.env.TWITTER_REFRESH_TOKEN;

    if (!TWITTER_BEARER_TOKEN && !TWITTER_ACCESS_TOKEN) {
      throw new Error('Twitter API credentials not configured. Need either BEARER_TOKEN or ACCESS_TOKEN');
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

    console.log('Posting to Twitter via API v2:', content.substring(0, 50) + '...');

    let tweetResponse;
    let authHeader;

    // Try OAuth 2.0 access token first (preferred)
    if (TWITTER_ACCESS_TOKEN) {
      authHeader = `Bearer ${TWITTER_ACCESS_TOKEN}`;
    } else if (TWITTER_BEARER_TOKEN) {
      // Fallback to Bearer token (app-only auth)
      authHeader = `Bearer ${TWITTER_BEARER_TOKEN}`;
    } else {
      throw new Error('No valid Twitter authentication method available');
    }

    // Post using Twitter API v2
    tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'ResponsibleAI-Bot/2.0'
      },
      body: JSON.stringify({
        text: content
      })
    });

    if (!tweetResponse.ok) {
      const errorData = await tweetResponse.json();
      console.error('Twitter API v2 error:', errorData);
      
      // If access token failed, try bearer token
      if (tweetResponse.status === 401 && TWITTER_ACCESS_TOKEN && TWITTER_BEARER_TOKEN) {
        console.log('Retrying with Bearer token...');
        
        tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: content
          })
        });
        
        if (!tweetResponse.ok) {
          const retryError = await tweetResponse.json();
          throw new Error(`Twitter API v2 error: ${tweetResponse.status} - ${JSON.stringify(retryError)}`);
        }
      } else {
        throw new Error(`Twitter API v2 error: ${tweetResponse.status} - ${JSON.stringify(errorData)}`);
      }
    }

    const tweetData = await tweetResponse.json();
    
    if (!tweetData.data || !tweetData.data.id) {
      throw new Error('Invalid response from Twitter API - no tweet ID returned');
    }

    console.log('Tweet posted successfully:', tweetData.data.id);

    // Get Twitter username for URL (default to ResponsibleAI)
    const twitterHandle = 'ResponsibleAI'; // Update this if your handle is different
    const tweetUrl = `https://twitter.com/${twitterHandle}/status/${tweetData.data.id}`;

    // Update GitHub issue with posting confirmation
    try {
      await updateGitHubWithPosting(entryId, githubIssueNumber, {
        id: tweetData.data.id,
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
          id: tweetData.data.id,
          url: tweetUrl,
          posted_at: new Date().toISOString(),
          content: content,
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
    `**API Version:** Twitter API v2\n\n` +
    `**Content Posted:**\n${tweetData.text}\n\n` +
    `---\n*Automatically posted via ResponsibleAI Dashboard (OAuth 2.0)*`;

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
