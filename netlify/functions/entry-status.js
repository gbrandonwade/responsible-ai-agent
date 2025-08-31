// netlify/functions/entry-status.js - LIVE VERSION
// Handles individual entry status updates (approve/reject) with GitHub integration

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
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username';
    const REPO_NAME = process.env.GITHUB_REPO_NAME || 'responsible-ai-agent';

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured in environment variables');
    }

    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { entryId, status, feedback } = body;

    // Extract entry ID from path if it's a path parameter
    const pathParts = event.path.split('/');
    const entryIdFromPath = pathParts[pathParts.length - 2]; // .../entries/{id}/status

    const finalEntryId = entryId || entryIdFromPath;

    if (!finalEntryId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Entry ID is required'
        })
      };
    }

    const githubHeaders = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ResponsibleAI-Dashboard'
    };

    // Update the GitHub issue
    const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${finalEntryId}`;
    
    console.log('Updating GitHub issue:', finalEntryId, 'Status:', status);

    // Prepare update data based on status
    let updateData = {
      labels: status === 'approved' 
        ? ['content-review', 'approved'] 
        : ['content-review', 'rejected']
    };

    // Add comment with feedback
    if (feedback) {
      const commentUrl = `${updateUrl}/comments`;
      const commentBody = `## Review Decision: ${status.toUpperCase()}\n\n` +
        `**Feedback:** ${JSON.stringify(feedback, null, 2)}\n\n` +
        `**Reviewed at:** ${new Date().toISOString()}\n` +
        `**Reviewed via:** ResponsibleAI Dashboard`;

      const commentResponse = await fetch(commentUrl, {
        method: 'POST',
        headers: githubHeaders,
        body: JSON.stringify({ body: commentBody })
      });

      if (!commentResponse.ok) {
        console.warn('Failed to add comment to GitHub issue');
      }
    }

    // Close issue if approved or rejected (but not if posting to Twitter)
    if (status === 'approved' || status === 'rejected') {
      if (!feedback?.posted_to_twitter) {
        // Only close if not posting to Twitter (posting function will close it)
        updateData.state = 'closed';
        updateData.state_reason = status === 'approved' ? 'completed' : 'not_planned';
      }
    }

    // Update the issue
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: githubHeaders,
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`GitHub API error: ${updateResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const updatedIssue = await updateResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Entry status updated successfully',
        data: {
          entry_id: finalEntryId,
          old_status: 'pending_review',
          new_status: status,
          updated_at: new Date().toISOString(),
          feedback: feedback || null,
          github_issue_url: updatedIssue.html_url
        },
        timestamp: new Date().toISOString(),
        demo_mode: false
      })
    };

  } catch (error) {
    console.error('Entry status update error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to update entry status in GitHub',
        demo_mode: false
      })
    };
  }
};
