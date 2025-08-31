import json
import os
import sys
from datetime import datetime

def handler(event, context):
    """Handle analytics API requests"""
    
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': ''
        }
    
    try:
        # Demo analytics data
        demo_analytics = {
            'total_entries': 15,
            'recent_entries': 5,
            'approval_rate': 82.5,
            'average_quality_score': 7.8,
            'pending_count': 1,
            'last_generated': datetime.now().isoformat(),
            'performance_trend': 'improving'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'success': True,
                'analytics': demo_analytics,
                'timestamp': datetime.now().isoformat(),
                'demo_mode': True
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'analytics': {}
            })
        }
