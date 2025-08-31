// netlify/functions/entries.js - DIAGNOSTIC VERSION
// Helps debug GitHub Issues loading problems

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  try {
    console.log('🔍 Diagnostic: Starting entries function...');
    
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO_NAME;

    console.log('🔍 Environment check:');
    console.log('- GITHUB_TOKEN exists:', !!GITHUB_TOKEN);
    console.log('- REPO_OWNER:', REPO_OWNER);
    console.log('- REPO_NAME:', REPO_NAME);

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured');
    }

    if (!REPO_OWNER || !REPO_NAME) {
      throw new Error('Repository owner or name not configured');
    }

    const githubHeaders = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ResponsibleAI-Dashboard'
    };

    // Test basic GitHub API access first
    const repoUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
    console.log('🔍 Testing repository access:', repoUrl);
    
    const repoResponse = await fetch(repoUrl, { headers: githubHeaders });
    console.log('🔍 Repository response status:', repoResponse.status);
    
    if (!repoResponse.ok) {
      const errorData = await repoResponse.json();
      console.log('🔍 Repository error:', errorData);
      throw new Error(`Repository access failed: ${repoResponse.status} - ${errorData.message}`);
    }

    // Get all issues (not just content-review ones) to see what's there
    const allIssuesUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=20`;
    console.log('🔍 Fetching all issues:', allIssuesUrl);
    
    const allIssuesResponse = await fetch(allIssuesUrl, { headers: githubHeaders });
    console.log('🔍 All issues response status:', allIssuesResponse.status);
    
    if (!allIssuesResponse.ok) {
      const errorData = await allIssuesResponse.json();
      console.log('🔍 All issues error:', errorData);
      throw new Error(`Issues API failed: ${allIssuesResponse.status} - ${errorData.message}`);
    }

    const allIssues = await allIssuesResponse.json();
    console.log('🔍 Total issues found:', allIssues.length);
    
    // Log issue details for debugging
    allIssues.forEach((issue, index) => {
      if (index < 3) { // Only log first 3 to avoid spam
        console.log(`🔍 Issue ${index + 1}:`, {
          number: issue.number,
          title: issue.title,
          state: issue.state,
          labels: issue.labels.map(l => l.name)
        });
      }
    });

    // Filter for content-review issues
    const contentIssues = allIssues.filter(issue => 
      issue.labels && issue.labels.some(label => label.name === 'content-review')
    );
    
    console.log('🔍 Content review issues found:', contentIssues.length);

    // Filter for open content-review issues
    const openContentIssues = contentIssues.filter(issue => issue.state === 'open');
    console.log('🔍 Open content review issues:', openContentIssues.length);

    // Parse issues into entries
    const entries = openContentIssues.map(issue => parseIssueToEntry(issue));
    
    console.log('🔍 Parsed entries:', entries.length);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        entries: entries,
        count: entries.length,
        debug_info: {
          total_issues_in_repo: allIssues.length,
          content_review_issues: contentIssues.length,
          open_content_issues: openContentIssues.length,
          repo_owner: REPO_OWNER,
          repo_name: REPO_NAME,
          github_token_configured: !!GITHUB_TOKEN
        },
        timestamp: new Date().toISOString(),
        demo_mode: false,
        source: 'github_issues'
      }, null, 2)
    };

  } catch (error) {
    console.error('❌ Entries function error:', error);
    
    return {
      statusCode: 200, // Return 200 so dashboard doesn't fail
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        entries: [],
        error: error.message,
        debug_info: {
          github_token_exists: !!process.env.GITHUB_TOKEN,
          repo_owner: process.env.GITHUB_REPO_OWNER,
          repo_name: process.env.GITHUB_REPO_NAME
        },
        timestamp: new Date().toISOString(),
        demo_mode: false
      })
    };
  }
};

function parseIssueToEntry(issue) {
  try {
    console.log('🔍 Parsing issue:', issue.number, issue.title);
    
    // Extract content from issue body
    const body = issue.body || '';
    console.log('🔍 Issue body length:', body.length);
    console.log('🔍 Issue body preview:', body.substring(0, 200));
    
    const lines = body.split('\n'); // Use actual newlines, not escaped
    console.log('🔍 Body split into', lines.length, 'lines');
    
    let content = '';
    let qualityScore = 0;
    
    // Look for content after "## Generated Content"
    let inContentSection = false;
    let contentLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '## Generated Content') {
        console.log('🔍 Found Generated Content section at line', i);
        inContentSection = true;
        continue;
      }
      
      if (inContentSection) {
        // Stop at next section header
        if (line.startsWith('##')) {
          console.log('🔍 End of content section at line', i, 'with header:', line);
          break;
        }
        
        // Skip empty lines and markdown formatting
        if (line.length > 0 && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('**')) {
          contentLines.push(line);
          console.log('🔍 Added content line:', line);
        }
      }
      
      // Look for quality score
      if (line.includes('Quality Score:')) {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) {
          qualityScore = parseFloat(match[1]);
          console.log('🔍 Found quality score:', qualityScore);
        }
      }
    }
    
    // Join content lines with actual newlines
    content = contentLines.join('\n');
    console.log('🔍 Final parsed content:', content);
    console.log('🔍 Content length:', content.length);
    
    // If no structured content found, try alternative parsing
    if (!content || content.length < 10) {
      console.log('🔍 No structured content found, trying alternative parsing...');
      
      // Look for any substantial text that looks like tweet content
      const bodyText = body.replace(/##.*$/gm, '').replace(/\*\*.*?\*\*/g, '').replace(/-.*$/gm, '');
      const sentences = bodyText.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && !trimmed.startsWith('*') && !trimmed.startsWith('-');
      });
      
      if (sentences.length > 0) {
        content = sentences.slice(0, 3).join('\n').trim(); // Take first 3 substantial sentences
        console.log('🔍 Alternative content found:', content);
      }
    }
    
    // Fallback if still no content
    if (!content || content.length < 5) {
      content = 'Content extraction failed - raw body length: ' + body.length;
      console.log('🔍 Using fallback content');
    }

    const result = {
      id: issue.number.toString(),
      created_at: issue.created_at,
      status: 'pending_review',
      github_issue_url: issue.html_url,
      research_context: {
        trending_topics: ['AI governance', 'responsible AI', 'AI ethics'],
        news_articles_count: 0
      },
      content_options: [{
        option_number: 1,
        content: content,
        score: qualityScore || 7.5,
        voice_score: (qualityScore || 7.5) * 0.9,
        recommended: true,
        character_count: content.length
      }],
      pipeline_metadata: {
        generation_time: 'N/A',
        research_sources: ['GitHub Issues'],
        model_used: 'manual',
        issue_number: issue.number,
        issue_title: issue.title,
        parsing_debug: {
          original_body_length: body.length,
          lines_count: lines.length,
          content_lines_found: contentLines.length,
          final_content_length: content.length
        }
      }
    };
    
    console.log('🔍 Created entry:', result);
    return result;

  } catch (error) {
    console.error('❌ Error parsing issue:', error);
    return {
      id: issue.number.toString(),
      created_at: issue.created_at,
      status: 'pending_review',
      content_options: [{
        option_number: 1,
        content: 'Parsing error: ' + error.message + ' - Issue body: ' + (issue.body || 'empty').substring(0, 100),
        score: 0,
        voice_score: 0,
        recommended: false
      }],
      error: error.message
    };
  }
}
