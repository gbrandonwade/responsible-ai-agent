// netlify/functions/analytics.js - LIVE VERSION
// Pulls real analytics from GitHub repository and pipeline data

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
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username';
    const REPO_NAME = process.env.GITHUB_REPO_NAME || 'responsible-ai-agent';

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured');
    }

    const githubHeaders = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ResponsibleAI-Dashboard'
    };

    // Fetch repository analytics from GitHub API
    const baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
    
    // Get all content review issues (both open and closed)
    const allIssuesUrl = `${baseUrl}/issues?labels=content-review&state=all&per_page=100&sort=created&direction=desc`;
    const workflowRunsUrl = `${baseUrl}/actions/runs?per_page=50&status=completed`;
    
    console.log('Fetching analytics data...');
    
    const [issuesResponse, workflowResponse] = await Promise.all([
      fetch(allIssuesUrl, { headers: githubHeaders }),
      fetch(workflowRunsUrl, { headers: githubHeaders })
    ]);

    if (!issuesResponse.ok || !workflowResponse.ok) {
      throw new Error('Failed to fetch GitHub data');
    }

    const allIssues = await issuesResponse.json();
    const workflowRuns = await workflowResponse.json();

    // Calculate analytics from real data
    const analytics = calculateRealAnalytics(allIssues, workflowRuns.workflow_runs);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        analytics: analytics,
        timestamp: new Date().toISOString(),
        demo_mode: false,
        data_source: 'github_api'
      }, null, 2)
    };

  } catch (error) {
    console.error('Live analytics error:', error);
    
    // Return partial data on error but don't fail completely
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        analytics: {
          total_entries: 0,
          recent_entries: 0,
          approval_rate: 0,
          average_quality_score: 0,
          pending_count: 0,
          last_generated: new Date().toISOString(),
          performance_trend: 'unknown',
          error: error.message
        },
        timestamp: new Date().toISOString(),
        demo_mode: false,
        error: error.message
      })
    };
  }
};

function calculateRealAnalytics(allIssues, workflowRuns) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  // Filter content review issues
  const contentIssues = allIssues.filter(issue => 
    issue.labels.some(label => label.name === 'content-review')
  );

  // Calculate basic metrics
  const totalEntries = contentIssues.length;
  const pendingEntries = contentIssues.filter(issue => issue.state === 'open').length;
  const approvedEntries = contentIssues.filter(issue => 
    issue.state === 'closed' && 
    issue.labels.some(label => label.name === 'approved')
  ).length;
  const rejectedEntries = contentIssues.filter(issue => 
    issue.state === 'closed' && 
    issue.labels.some(label => label.name === 'rejected')
  ).length;

  // Recent entries (last 7 days)
  const recentEntries = contentIssues.filter(issue => 
    new Date(issue.created_at) > sevenDaysAgo
  ).length;

  // Calculate approval rate
  const closedEntries = approvedEntries + rejectedEntries;
  const approvalRate = closedEntries > 0 ? (approvedEntries / closedEntries) * 100 : 0;

  // Extract quality scores from issue bodies (if available)
  const qualityScores = [];
  contentIssues.forEach(issue => {
    const qualityMatch = issue.body.match(/Quality Score:\s*(\d+\.?\d*)/i);
    if (qualityMatch) {
      qualityScores.push(parseFloat(qualityMatch[1]));
    }
  });

  const averageQualityScore = qualityScores.length > 0 
    ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
    : 0;

  // Analyze workflow runs for pipeline performance
  const recentWorkflows = workflowRuns.filter(run => 
    new Date(run.created_at) > thirtyDaysAgo
  );

  const successfulRuns = recentWorkflows.filter(run => run.conclusion === 'success').length;
  const pipelineSuccessRate = recentWorkflows.length > 0 
    ? (successfulRuns / recentWorkflows.length) * 100 
    : 0;

  // Determine performance trend
  const recentApprovalRate = contentIssues
    .filter(issue => new Date(issue.created_at) > sevenDaysAgo)
    .filter(issue => issue.state === 'closed')
    .filter(issue => issue.labels.some(label => label.name === 'approved')).length;
  
  const oldApprovalRate = contentIssues
    .filter(issue => {
      const created = new Date(issue.created_at);
      return created > thirtyDaysAgo && created <= sevenDaysAgo;
    })
    .filter(issue => issue.state === 'closed')
    .filter(issue => issue.labels.some(label => label.name === 'approved')).length;

  let performanceTrend = 'stable';
  if (recentApprovalRate > oldApprovalRate) {
    performanceTrend = 'improving';
  } else if (recentApprovalRate < oldApprovalRate) {
    performanceTrend = 'declining';
  }

  // Find last generation time
  const lastGenerated = contentIssues.length > 0 
    ? contentIssues[0].created_at 
    : new Date().toISOString();

  // Calculate monthly breakdown
  const monthlyStats = calculateMonthlyStats(contentIssues);

  // Topic analysis
  const topicPerformance = analyzeTopicPerformance(contentIssues);

  return {
    total_entries: totalEntries,
    recent_entries: recentEntries,
    approval_rate: Math.round(approvalRate * 100) / 100,
    average_quality_score: Math.round(averageQualityScore * 100) / 100,
    pending_count: pendingEntries,
    last_generated: lastGenerated,
    performance_trend: performanceTrend,
    pipeline_success_rate: Math.round(pipelineSuccessRate * 100) / 100,
    monthly_stats: monthlyStats,
    quality_distribution: {
      high: qualityScores.filter(score => score >= 8.0).length,
      medium: qualityScores.filter(score => score >= 6.0 && score < 8.0).length,
      low: qualityScores.filter(score => score < 6.0).length
    },
    topic_performance: topicPerformance,
    workflow_stats: {
      total_runs: workflowRuns.length,
      successful_runs: successfulRuns,
      recent_runs: recentWorkflows.length
    }
  };
}

function calculateMonthlyStats(issues) {
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];
  
  const stats = {};
  const currentMonth = new Date().getMonth();
  
  // Get last 3 months
  for (let i = 2; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthName = months[monthIndex];
    
    const monthIssues = issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      return issueDate.getMonth() === monthIndex;
    });

    const approved = monthIssues.filter(issue => 
      issue.labels.some(label => label.name === 'approved')
    ).length;

    stats[monthName] = {
      generated: monthIssues.length,
      approved: approved
    };
  }
  
  return stats;
}

function analyzeTopicPerformance(issues) {
  // Extract topics from issue titles and bodies
  const topicKeywords = {
    'AI Ethics': ['ethics', 'ethical', 'responsible'],
    'AI Bias': ['bias', 'fairness', 'discrimination'],
    'AI Governance': ['governance', 'regulation', 'policy'],
    'AI Transparency': ['transparency', 'explainable', 'interpretable'],
    'AI Safety': ['safety', 'risk', 'harm']
  };

  const topicStats = {};

  Object.keys(topicKeywords).forEach(topic => {
    const keywords = topicKeywords[topic];
    const topicIssues = issues.filter(issue => {
      const text = (issue.title + ' ' + issue.body).toLowerCase();
      return keywords.some(keyword => text.includes(keyword));
    });

    const approved = topicIssues.filter(issue => 
      issue.labels.some(label => label.name === 'approved')
    ).length;

    if (topicIssues.length > 0) {
      topicStats[topic] = {
        posts: topicIssues.length,
        approved: approved,
        approval_rate: approved / topicIssues.length
      };
    }
  });

  // Convert to array format
  return Object.entries(topicStats).map(([topic, stats]) => ({
    topic: topic,
    posts: stats.posts,
    approved: stats.approved,
    approval_rate: Math.round(stats.approval_rate * 100)
  }));
}
