// netlify/functions/entries.js - LIVE VERSION
// Connects to GitHub Issues API for real content entries

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
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username'; // Set in Netlify env vars
    const REPO_NAME = process.env.GITHUB_REPO_NAME || 'responsible-ai-agent';

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured in environment variables');
    }

    // GitHub API headers
    const githubHeaders = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ResponsibleAI-Dashboard'
    };

    if (event.httpMethod === 'GET') {
      // Get content review issues from GitHub
      const issuesUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=content-review,needs-human-review&state=open&sort=created&direction=desc`;
      
      console.log('Fetching issues from:', issuesUrl);
      
      const response = await fetch(issuesUrl, {
        headers: githubHeaders
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issues = await response.json();
      
      // Parse issues into content entries
      const entries = issues.map(issue => parseGitHubIssueToEntry(issue));
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          entries: entries,
          count: entries.length,
          timestamp: new Date().toISOString(),
          demo_mode: false,
          source: 'github_issues'
        }, null, 2)
      };
    }

    if (event.httpMethod === 'POST') {
      // Handle entry status updates
      const body = JSON.parse(event.body || '{}');
      const { entryId, status, feedback, approvedOption } = body;
      
      // Update the GitHub issue
      const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${entryId}`;
      
      let updateData = {
        labels: status === 'approved' ? ['content-review', 'approved'] : ['content-review', 'rejected']
      };

      // Add comment with feedback
      if (feedback || approvedOption) {
        const commentUrl = `${updateUrl}/comments`;
        const commentBody = `## Review Decision: ${status.toUpperCase()}\n\n` +
          (approvedOption ? `**Approved Option:** ${approvedOption}\n\n` : '') +
          (feedback ? `**Feedback:** ${feedback}\n\n` : '') +
          `**Reviewed at:** ${new Date().toISOString()}\n` +
          `**Reviewed via:** ResponsibleAI Dashboard`;

        await fetch(commentUrl, {
          method: 'POST',
          headers: githubHeaders,
          body: JSON.stringify({ body: commentBody })
        });
      }

      // Update issue status
      if (status === 'approved') {
        updateData.state = 'closed';
        updateData.state_reason = 'completed';
      }

      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: githubHeaders,
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update GitHub issue: ${updateResponse.status}`);
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          message: 'Entry status updated successfully',
          entry_id: entryId,
          new_status: status,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Method not allowed
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

  } catch (error) {
    console.error('Live entries function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        entries: [],
        demo_mode: false
      })
    };
  }
};

// Parse GitHub issue into content entry format
function parseGitHubIssueToEntry(issue) {
  try {
    // Extract content from issue body
    const bodyLines = issue.body.split('\n');
    let content = '';
    let qualityScore = 0;
    let researchContext = { trending_topics: [], news_articles_count: 0 };

    // Parse the issue body for content and metadata
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim();
      
      if (line.includes('## Generated Content')) {
        // Find the content in the next few lines
        for (let j = i + 1; j < bodyLines.length && j < i + 10; j++) {
          const contentLine = bodyLines[j].trim();
          if (contentLine && !contentLine.startsWith('#') && !contentLine.startsWith('-') && !contentLine.startsWith('*')) {
            content = contentLine;
            break;
          }
        }
      }
      
      if (line.includes('Quality Score:')) {
        const scoreMatch = line.match(/(\d+\.?\d*)/);
        if (scoreMatch) {
          qualityScore = parseFloat(scoreMatch[1]);
        }
      }
    }

    // Create content options (GitHub issue has one option)
    const contentOptions = [{
      option_number: 1,
      content: content || 'Content not found in issue body',
      score: qualityScore || 0,
      voice_score: qualityScore * 0.9 || 0, // Estimate voice score
      recommended: true,
      character_count: content.length
    }];

    return {
      id: issue.number.toString(),
      created_at: issue.created_at,
      status: 'pending_review',
      github_issue_url: issue.html_url,
      research_context: researchContext,
      content_options: contentOptions,
      pipeline_metadata: {
        generation_time: 'N/A',
        research_sources: ['GitHub Issues'],
        model_used: 'gpt-3.5-turbo',
        issue_number: issue.number,
        issue_title: issue.title
      }
    };

  } catch (error) {
    console.error('Error parsing GitHub issue:', error);
    return {
      id: issue.number.toString(),
      created_at: issue.created_at,
      status: 'pending_review',
      content_options: [{
        option_number: 1,
        content: 'Error parsing content from GitHub issue',
        score: 0,
        voice_score: 0,
        recommended: false
      }],
      error: error.message
    };
  }
}
