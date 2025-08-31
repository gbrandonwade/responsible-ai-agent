// netlify/functions/entries.js
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
    const currentDate = new Date();
    
    // Demo entries data - in production this would come from your database/GitHub Issues
    const demoEntries = [
      {
        id: `demo_${currentDate.getTime()}`,
        created_at: currentDate.toISOString(),
        status: 'pending_review',
        research_context: {
          trending_topics: ['AI governance', 'responsible AI', 'algorithmic fairness'],
          news_articles_count: 5,
          research_timestamp: currentDate.toISOString()
        },
        content_options: [
          {
            option_number: 1,
            content: `You don't need a computer science degree to make AI work for you.

Here's what I discovered: the best AI practitioners ask better questions, not better algorithms.

What's one area where AI could simplify your work? #ResponsibleAI #AIEthics`,
            score: 8.7,
            voice_score: 8.4,
            recommended: true,
            character_count: 234
          },
          {
            option_number: 2,
            content: `The real challenge in AI isn't the technology—it's ensuring fairness and transparency in every decision.

New research shows 73% of AI systems lack proper bias testing.

How does your organization approach AI accountability? #ResponsibleAI #AIBias`,
            score: 7.9,
            voice_score: 7.6,
            recommended: false,
            character_count: 267
          }
        ],
        pipeline_metadata: {
          generation_time: 2.3,
          research_sources: ['TechCrunch', 'MIT Technology Review', 'AI News'],
          model_used: 'gpt-3.5-turbo'
        }
      },
      // Add a second entry to show multiple pending items
      {
        id: `demo_${currentDate.getTime() - 3600000}`, // 1 hour ago
        created_at: new Date(currentDate.getTime() - 3600000).toISOString(),
        status: 'pending_review',
        research_context: {
          trending_topics: ['AI transparency', 'machine learning ethics', 'AI regulation'],
          news_articles_count: 3,
          research_timestamp: new Date(currentDate.getTime() - 3600000).toISOString()
        },
        content_options: [
          {
            option_number: 1,
            content: `Here's the thing about AI transparency: it's not just about showing your work—it's about making sure people understand the impact.

I've seen companies check the "explainable AI" box while users still feel confused.

What questions do you wish AI systems would answer? #AITransparency #ResponsibleAI`,
            score: 8.2,
            voice_score: 8.0,
            recommended: true,
            character_count: 278
          },
          {
            option_number: 2,
            content: `AI regulation is coming faster than most companies expected.

The key isn't to resist it—it's to get ahead of it by building responsible practices now.

What's your organization doing to prepare for AI governance requirements? #AIRegulation #AIGovernance`,
            score: 7.5,
            voice_score: 7.2,
            recommended: false,
            character_count: 251
          }
        ],
        pipeline_metadata: {
          generation_time: 1.8,
          research_sources: ['Wired', 'Harvard Business Review'],
          model_used: 'gpt-3.5-turbo'
        }
      }
    ];

    // Handle different HTTP methods
    if (event.httpMethod === 'GET') {
      // Return all pending entries
      const pendingEntries = demoEntries.filter(entry => entry.status === 'pending_review');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          entries: pendingEntries,
          count: pendingEntries.length,
          timestamp: currentDate.toISOString(),
          demo_mode: true
        }, null, 2)
      };
    }

    if (event.httpMethod === 'POST') {
      // Handle entry status updates (approve/reject)
      const body = JSON.parse(event.body || '{}');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          message: 'Entry status updated',
          updated_entry: body,
          timestamp: currentDate.toISOString()
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
    console.error('Entries function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        entries: []
      })
    };
  }
};
