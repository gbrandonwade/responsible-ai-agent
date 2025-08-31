// netlify/functions/analytics.js
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
    // Demo analytics data - in production this would come from your database
    const currentDate = new Date();
    const demoAnalytics = {
      total_entries: 23,
      recent_entries: 7,
      approval_rate: 84.2,
      average_quality_score: 8.1,
      pending_count: 2,
      last_generated: currentDate.toISOString(),
      performance_trend: 'improving',
      monthly_stats: {
        january: { generated: 15, approved: 12 },
        february: { generated: 18, approved: 16 },
        march: { generated: 8, approved: 7 } // Current month
      },
      quality_distribution: {
        high: 65, // 8.0+ score
        medium: 25, // 6.0-7.9 score  
        low: 10 // Below 6.0
      },
      topic_performance: [
        { topic: 'AI Ethics', posts: 8, avg_engagement: 45 },
        { topic: 'AI Bias', posts: 6, avg_engagement: 38 },
        { topic: 'Responsible AI', posts: 9, avg_engagement: 52 }
      ]
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        analytics: demoAnalytics,
        timestamp: currentDate.toISOString(),
        demo_mode: true
      }, null, 2)
    };

  } catch (error) {
    console.error('Analytics function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        analytics: {}
      })
    };
  }
};
