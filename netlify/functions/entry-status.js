// netlify/functions/entry-status.js
// Handles individual entry status updates (approve/reject)
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
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { entryId, status, feedback, approvedOption } = body;

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

    // In a real app, you'd update your database here
    // For demo, we'll just return success
    const updateResult = {
      entry_id: finalEntryId,
      old_status: 'pending_review',
      new_status: status || 'approved',
      updated_at: new Date().toISOString(),
      feedback: feedback || null,
      approved_option: approvedOption || null
    };

    // If status is 'approved', you might want to:
    // 1. Save to your posting queue
    // 2. Create a GitHub issue for posting
    // 3. Send to your Twitter API
    
    if (status === 'approved') {
      console.log(`Entry ${finalEntryId} approved for posting`);
      // TODO: Add logic to queue for posting
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
        data: updateResult,
        timestamp: new Date().toISOString()
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
        details: 'Failed to update entry status'
      })
    };
  }
};
