#!/usr/bin/env python3
"""
Main orchestration script for @ResponsibleAI content agent
Runs research → generation → quality control → posting pipeline
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, Optional
from dotenv import load_dotenv

# Add src to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our modules
from research.news_research import NewsResearcher
from generation.content_generator import ResponsibleAIContentGenerator
from utils.logger import setup_logging

class ResponsibleAIAgent:
    """Main orchestration class for the AI content agent"""
    
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Setup logging
        self.logger = setup_logging()
        self.logger.info("Initializing ResponsibleAI Agent...")
        
        # Initialize components
        try:
            self.news_researcher = NewsResearcher()
            self.content_generator = ResponsibleAIContentGenerator()
            # self.twitter_poster = TwitterPoster()  # Will add when Twitter API ready
            
            self.logger.info("✅ All components initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize components: {e}")
            raise
    
    def run_daily_pipeline(self) -> Dict:
        """Execute the complete daily content generation pipeline"""
        
        pipeline_start = datetime.now()
        self.logger.info(f"🚀 Starting daily pipeline at {pipeline_start}")
        
        try:
            # Phase 1: Research
            self.logger.info("📊 Phase 1: Researching trending AI content...")
            research_data = self._execute_research_phase()
            
            # Phase 2: Content Generation
            self.logger.info("✍️ Phase 2: Generating content...")
            content_result = self._execute_generation_phase(research_data)
            
            # Phase 3: Quality Control
            self.logger.info("🔍 Phase 3: Quality control...")
            quality_result = self._execute_quality_control(content_result)
            
            # Phase 4: Posting Decision
            self.logger.info("🎯 Phase 4: Making posting decision...")
            posting_result = self._execute_posting_phase(quality_result, content_result)
            
            # Phase 5: Analytics & Learning
            self.logger.info("📈 Phase 5: Storing analytics...")
            self._store_pipeline_results({
                'research': research_data,
                'content': content_result,
                'quality': quality_result,
                'posting': posting_result,
                'pipeline_duration': (datetime.now() - pipeline_start).total_seconds()
            })
            
            return {
                'success': True,
                'content_posted': posting_result.get('posted', False),
                'content': content_result.get('content', ''),
                'quality_score': quality_result.get('score', 0),
                'pipeline_time': (datetime.now() - pipeline_start).total_seconds(),
                'character_count': len(content_result.get('content', '')),
                'voice_alignment': content_result.get('voice_alignment', False)
            }
            
        except Exception as e:
            self.logger.error(f"❌ Pipeline failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'pipeline_time': (datetime.now() - pipeline_start).total_seconds()
            }
    
    def _execute_research_phase(self) -> Dict:
        """Execute research phase - gather trending content"""
        
        research_results = {
            'news_articles': [],
            'trending_topics': [],
            'research_timestamp': datetime.now().isoformat()
        }
        
        try:
            # Get AI news articles
            self.logger.info("🔍 Researching AI news...")
            news_articles = self.news_researcher.research_ai_news(hours_back=24)
            research_results['news_articles'] = news_articles
            
            # Extract trending topics
            trending_topics = self.news_researcher.get_trending_topics(news_articles)
            research_results['trending_topics'] = trending_topics
            
            self.logger.info(f"📰 Found {len(news_articles)} relevant articles")
            self.logger.info(f"🔥 Trending topics: {', '.join(trending_topics[:3])}")
            
            # TODO: Add Twitter research when API is available
            # viral_tweets = self.twitter_researcher.research_viral_ai_content()
            # research_results['viral_tweets'] = viral_tweets
            
        except Exception as e:
            self.logger.warning(f"Research phase warning: {e}")
            # Continue with partial data
        
        return research_results
    
    def _execute_generation_phase(self, research_data: Dict) -> Dict:
        """Execute content generation phase"""
        
        try:
            # Generate tweet content
            content_result = self.content_generator.generate_tweet(research_data)
            
            self.logger.info(f"✍️ Generated content: {content_result['content'][:50]}...")
            self.logger.info(f"🎤 Voice alignment score: {content_result['quality_score']:.2f}")
            self.logger.info(f"📏 Character count: {content_result.get('character_count', 0)}/280")
            
            return content_result
            
        except Exception as e:
            self.logger.error(f"Content generation failed: {e}")
            # Use fallback content
            return self.content_generator._get_fallback_content()
    
    def _execute_quality_control(self, content_result: Dict) -> Dict:
        """Execute quality control checks"""
        
        content = content_result.get('content', '')
        quality_checks = {
            'voice_alignment': content_result.get('quality_score', 0),
            'character_count': len(content),
            'has_hashtags': '#' in content,
            'has_engagement': '?' in content,
            'timestamp': datetime.now().isoformat(),
            'model_used': content_result.get('model_used', 'unknown')
        }
        
        # Calculate overall quality score
        checks_passed = 0.0
        total_weight = 1.0
        
        # Voice alignment check (weight: 40%)
        voice_score = quality_checks['voice_alignment']
        if voice_score > 0.75:
            checks_passed += 0.4
        elif voice_score > 0.5:
            checks_passed += 0.2
        
        # Length check (weight: 25%)
        char_count = quality_checks['character_count']
        if 50 <= char_count <= 280:
            checks_passed += 0.25
        elif char_count <= 320:  # Slightly over limit
            checks_passed += 0.1
        
        # Hashtag check (weight: 15%)
        if quality_checks['has_hashtags']:
            checks_passed += 0.15
        
        # Engagement check (weight: 15%)
        if quality_checks['has_engagement']:
            checks_passed += 0.15
        
        # Model check (weight: 5%)
        if quality_checks['model_used'] != 'fallback':
            checks_passed += 0.05
        
        overall_score = checks_passed
        
        quality_result = {
            'score': overall_score,
            'checks': quality_checks,
            'passed': overall_score > 0.7,  # 70% threshold for auto-posting
            'needs_review': overall_score <= 0.7,
            'issues': []
        }
        
        # Identify specific issues
        if char_count > 280:
            quality_result['issues'].append(f"Content too long ({char_count}/280 characters)")
        if voice_score < 0.5:
            quality_result['issues'].append(f"Low voice alignment ({voice_score:.2f})")
        if not quality_checks['has_hashtags']:
            quality_result['issues'].append("Missing hashtags")
        
        self.logger.info(f"🔍 Quality score: {overall_score:.2f} ({'PASS' if quality_result['passed'] else 'NEEDS REVIEW'})")
        if quality_result['issues']:
            self.logger.warning(f"Issues found: {', '.join(quality_result['issues'])}")
        
        return quality_result
    
    def _execute_posting_phase(self, quality_result: Dict, content_result: Dict) -> Dict:
        """Execute posting phase (or queue for review)"""
        
        posting_result = {
            'posted': False,
            'action_taken': 'none',
            'timestamp': datetime.now().isoformat()
        }
        
        if quality_result['passed']:
            # TODO: Post to Twitter when API is available
            # result = self.twitter_poster.post_tweet(content)
            # posting_result['posted'] = result['success']
            
            # For now, just log that we would post
            self.logger.info("✅ Content approved for posting!")
            posting_result['action_taken'] = 'approved_for_posting'
            
            # Set GitHub Action output for posting
            if os.getenv('GITHUB_ACTIONS'):
                self._set_github_output('READY_TO_POST', 'true')
                self._set_github_output('APPROVED_CONTENT', content_result.get('content', ''))
                self._set_github_output('QUALITY_SCORE', str(quality_result.get('score', 0)))
            
        else:
            # Queue for human review
            self.logger.warning("⚠️ Content needs human review")
            posting_result['action_taken'] = 'queued_for_review'
            
            # Set GitHub Action output for review
            if os.getenv('GITHUB_ACTIONS'):
                self._set_github_output('NEEDS_REVIEW', 'true')
                self._set_github_output('REVIEW_CONTENT', content_result.get('content', ''))
                self._set_github_output('QUALITY_SCORE', str(quality_result.get('score', 0)))
                self._set_github_output('QUALITY_ISSUES', ', '.join(quality_result.get('issues', [])))
        
        return posting_result
    
    def _store_pipeline_results(self, results: Dict) -> None:
        """Store pipeline results for analytics and learning"""
        
        # Create data directory if it doesn't exist
        os.makedirs('data/analytics', exist_ok=True)
        
        # Store daily results
        date_str = datetime.now().strftime('%Y-%m-%d')
        results_file = f'data/analytics/pipeline_results_{date_str}.json'
        
        try:
            # Sanitize results for JSON serialization
            sanitized_results = self._sanitize_for_json(results)
            
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(sanitized_results, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"📊 Results stored in {results_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to store results: {e}")
    
    def _sanitize_for_json(self, obj):
        """Recursively sanitize object for JSON serialization"""
        if isinstance(obj, dict):
            return {k: self._sanitize_for_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._sanitize_for_json(item) for item in obj]
        elif hasattr(obj, 'isoformat'):  # datetime objects
            return obj.isoformat()
        elif isinstance(obj, (str, int, float, bool)) or obj is None:
            return obj
        else:
            return str(obj)  # Convert other types to string
    
    def _set_github_output(self, name: str, value: str) -> None:
        """Set GitHub Actions output variable"""
        try:
            github_output = os.getenv('GITHUB_OUTPUT')
            if github_output and os.path.exists(os.path.dirname(github_output)):
                with open(github_output, 'a', encoding='utf-8') as f:
                    f.write(f"{name}={value}\n")
                self.logger.debug(f"Set GitHub output: {name}={value[:50]}...")
        except Exception as e:
            self.logger.warning(f"Could not set GitHub output {name}: {e}")
    
    def test_full_pipeline(self) -> None:
        """Test the complete pipeline without posting"""
        
        print("🧪 Running full pipeline test...")
        print("=" * 50)
        
        result = self.run_daily_pipeline()
        
        print(f"\n📊 Pipeline Results:")
        print(f"Success: {'✅' if result['success'] else '❌'}")
        print(f"Duration: {result.get('pipeline_time', 0):.1f} seconds")
        
        if result['success']:
            print(f"Content: {result['content']}")
            print(f"Quality Score: {result['quality_score']:.2f}")
            print(f"Voice Alignment: {'✅' if result.get('voice_alignment') else '❌'}")
            print(f"Character Count: {result.get('character_count', 0)}/280")
            print(f"Would Post: {'✅' if result.get('content_posted') else '⏳ Needs Review'}")
        else:
            print(f"Error: {result.get('error', 'Unknown error')}")

def main():
    """Main entry point"""
    
    try:
        agent = ResponsibleAIAgent()
        
        # Check if running in test mode
        if len(sys.argv) > 1 and sys.argv[1] == '--test':
            agent.test_full_pipeline()
        else:
            # Run normal pipeline
            result = agent.run_daily_pipeline()
            
            # Print summary
            print(f"Pipeline {'✅ SUCCESS' if result['success'] else '❌ FAILED'}")
            if result['success']:
                print(f"Quality Score: {result['quality_score']:.2f}")
                print(f"Character Count: {result.get('character_count', 0)}/280")
                print(f"Ready to Post: {'Yes' if result.get('content_posted') else 'Needs Review'}")
            else:
                print(f"Error: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    main()
