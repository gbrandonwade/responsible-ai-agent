import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Add src to path for imports
function_dir = Path(__file__).parent
project_root = function_dir.parent.parent
sys.path.insert(0, str(project_root / 'src'))

def handler(event, context):
    """Handle entries API requests"""
    
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
        # Demo data for now - in production this would read from your system
        demo_entries = [{
            'id': f"demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'created_at': datetime.now().isoformat(),
            'status': 'pending_review',
            'research_context': {
                'trending_topics': ['AI governance', 'responsible AI', 'AI ethics'],
                'news_articles_count': 5
            },
            'content_options': [
                {
                    'option_number': 1,
                    'content': 'You don\'t need a computer science degree to make AI work for you.\n\nHere\'s what I discovered: the best AI practitioners ask better questions, not better algorithms.\n\nWhat\'s one area where AI could simplify your work? #ResponsibleAI #AIEthics',
                    'score': 8.5,
                    'voice_score': 8.2,
                    'recommended': True
                },
                {
                    'option_number': 2,
                    'content': 'The real challenge in AI isn\'t the technology—it\'s ensuring fairness and transparency in every decision.\n\nNew research shows 73% of AI systems lack proper bias testing.\n\nHow does your organization approach AI accountability? #ResponsibleAI #AIBias',
                    'score': 7.8,
                    'voice_score': 7.5,
                    'recommended': False
                }
            ]
        }]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'success': True,
                'entries': demo_entries,
                'count': len(demo_entries),
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
                'entries': []
            })
        }
