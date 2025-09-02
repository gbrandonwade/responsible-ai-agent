import json
import os
import logging
import random
from typing import Dict, List
from datetime import datetime
from openai import OpenAI

class ResponsibleAIContentGenerator:
    """Generate content using your authentic voice profile"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Load your voice profile
        try:
            with open('data/voice_profile.json', 'r') as f:
                self.voice_data = json.load(f)
                self.voice = self.voice_data['brand_voice_analysis']
        except FileNotFoundError:
            self.logger.error("Voice profile not found! Please ensure data/voice_profile.json exists")
            raise
        except KeyError:
            self.logger.error("Invalid voice profile structure")
            raise
        
        # Initialize OpenAI client (v1 API)
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        self.client = OpenAI(api_key=api_key)
        
    def generate_tweet(self, research_data: Dict) -> Dict:
        """Generate a tweet based on research data and your voice profile"""
        
        # Extract key info from research
        trending_topics = research_data.get('trending_topics', [])
        viral_content = research_data.get('viral_tweets', [])
        news_articles = research_data.get('news_articles', [])
        
        # Build the prompt using your voice profile
        prompt = self._build_generation_prompt(trending_topics, news_articles)
        
        try:
            # Use OpenAI v1 API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Updated to better, cheaper model
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=120,
                temperature=0.7,
                timeout=30  # Add timeout
            )
            
            generated_content = response.choices[0].message.content.strip()
            
            # Quality check against your voice profile
            quality_score = self._evaluate_voice_alignment(generated_content)
            
            return {
                'content': generated_content,
                'quality_score': quality_score,
                'research_used': {
                    'trending_topics': trending_topics[:3],
                    'news_count': len(news_articles)
                },
                'generated_at': datetime.now().isoformat(),
                'voice_alignment': quality_score > 0.75,
                'model_used': 'gpt-4o-mini',
                'character_count': len(generated_content)
            }
            
        except Exception as e:
            self.logger.error(f"Error generating content: {e}")
            return self._get_fallback_content()
    
    def _get_system_prompt(self) -> str:
        """Create system prompt based on your voice profile"""
        
        voice = self.voice
        
        return f"""You are the @ResponsibleAI Twitter account with this personality:

CORE IDENTITY:
- {voice['overall_personality']['personality_description']}
- Primary traits: {', '.join(voice['overall_personality']['primary_traits'])}

AUDIENCE: {voice['target_audience']['primary_audience']}
- They feel: {', '.join(voice['target_audience']['psychographics']['pain_points'][:2])}
- They want: {', '.join(voice['target_audience']['psychographics']['motivations'][:2])}

TONE: {voice['tone_characteristics']['primary_tone']}
- Warmth: {voice['tone_characteristics']['tone_attributes']['warmth']}/10
- Relatability: {voice['tone_characteristics']['tone_attributes']['relatability']}/10
- Transparency: {voice['tone_characteristics']['tone_attributes']['transparency']}/10

LANGUAGE STYLE:
- Use signature phrases like: "{random.choice(voice['language_style']['signature_phrases'])}"
- Power words: {', '.join(voice['language_style']['power_words'][:5])}
- Avoid: {', '.join(voice['language_style']['avoided_language'][:3])}

VOICE RULES:
- {random.choice(voice['writing_guidelines']['do'])}
- {random.choice(voice['writing_guidelines']['do'])}
- Never: {random.choice(voice['writing_guidelines']['avoid'])}

Write tweets that sound like a knowledgeable friend sharing discoveries about responsible AI."""

    def _build_generation_prompt(self, trending_topics: List[str], news_articles: List[Dict]) -> str:
        """Build the content generation prompt"""
        
        # Get current context
        context_parts = []
        
        if trending_topics:
            context_parts.append(f"Trending AI topics: {', '.join(trending_topics[:3])}")
        
        if news_articles:
            top_articles = news_articles[:2]
            for article in top_articles:
                context_parts.append(f"Recent news: {article.get('title', 'Unknown title')}")
        
        context = " | ".join(context_parts) if context_parts else "General AI ethics discussion"
        
        return f"""Current AI landscape: {context}

Create a tweet for @ResponsibleAI that:

1. ADDRESSES TRENDING TOPICS: Reference what people are discussing right now
2. USES YOUR AUTHENTIC VOICE: Sound like the conversational mentor you are
3. SERVES YOUR AUDIENCE: Help non-technical professionals feel confident about AI
4. INCLUDES PRACTICAL VALUE: Give them something actionable or insightful
5. ENCOURAGES ENGAGEMENT: End with a question or invitation to discuss

TWEET REQUIREMENTS:
- Under 280 characters
- Include relevant hashtags (#ResponsibleAI, #AIEthics, etc.)
- If you include statistics, add a citation
- Use one of your signature phrases naturally
- Sound authentically human and approachable

Remember: Your audience feels overwhelmed by AI hype. Be their guide, not another source of complexity.

Tweet:"""

    def _evaluate_voice_alignment(self, content: str) -> float:
        """Evaluate how well the content matches your voice profile"""
        
        voice = self.voice
        score = 0.0
        max_score = 6.0  # Total possible points
        
        content_lower = content.lower()
        
        # Check for signature phrases (1 point)
        signature_phrases = voice['language_style']['signature_phrases']
        for phrase in signature_phrases:
            if phrase.lower() in content_lower:
                score += 1.0
                break
        
        # Check for power words (1 point)
        power_words = voice['language_style']['power_words']
        power_word_count = sum(1 for word in power_words if word.lower() in content_lower)
        if power_word_count > 0:
            score += 1.0
        
        # Check for avoided language (negative 0.5 points each)
        avoided_language = voice['language_style']['avoided_language']
        for avoid in avoided_language:
            if avoid.lower() in content_lower:
                score -= 0.5
        
        # Check for personal pronouns (1 point)
        personal_pronouns = ['you', 'i', 'we', 'your', 'our']
        if any(pronoun in content_lower.split() for pronoun in personal_pronouns):
            score += 1.0
        
        # Check for question/engagement (1 point)
        if '?' in content or any(word in content_lower for word in ['what', 'how', 'why', 'think', 'thoughts']):
            score += 1.0
        
        # Check length appropriateness (1 point)
        word_count = len(content.split())
        if 15 <= word_count <= 35:  # Good Twitter length
            score += 1.0
        
        # Check for hashtags (1 point)
        if '#' in content:
            score += 1.0
        
        return min(score / max_score, 1.0)  # Cap at 1.0
    
    def _get_fallback_content(self) -> Dict:
        """Return fallback content if generation fails"""
        
        fallback_tweets = [
            "You don't need a computer science degree to make AI work for you. Start with curiosity, not code. What's one area where AI could simplify your work? #ResponsibleAI #AIForEveryone",
            
            "Here's what I discovered: The best AI practitioners ask better questions, not better algorithms. What questions are you asking about AI in your field? #ResponsibleAI #AIEthics",
            
            "The real secret to AI success? It's not about the technology—it's about understanding the problem you're trying to solve. What problem would you tackle first? #ResponsibleAI"
        ]
        
        selected_tweet = random.choice(fallback_tweets)
        
        return {
            'content': selected_tweet,
            'quality_score': 0.8,
            'research_used': {'fallback': True},
            'generated_at': datetime.now().isoformat(),
            'voice_alignment': True,
            'model_used': 'fallback',
            'character_count': len(selected_tweet)
        }
    
    def test_voice_consistency(self, num_samples: int = 3) -> None:
        """Test the voice consistency with sample generations"""
        
        print(f"🎤 Testing voice consistency with {num_samples} samples...")
        print("=" * 60)
        
        # Mock research data for testing
        mock_research = {
            'trending_topics': ['AI bias', 'algorithmic fairness', 'AI governance'],
            'news_articles': [
                {'title': 'New AI Ethics Guidelines Released by Tech Giants'},
                {'title': 'Study Shows AI Bias in Hiring Algorithms'}
            ]
        }
        
        for i in range(num_samples):
            print(f"\n📝 Sample {i+1}:")
            result = self.generate_tweet(mock_research)
            print(f"Content: {result['content']}")
            print(f"Voice Score: {result['quality_score']:.2f}")
            print(f"Alignment: {'✅' if result['voice_alignment'] else '❌'}")
            print(f"Model: {result.get('model_used', 'unknown')}")
            print(f"Length: {result.get('character_count', 0)}/280")
            print("-" * 40)

# Test the content generator
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    print("🚀 Initializing ResponsibleAI Content Generator...")
    
    try:
        generator = ResponsibleAIContentGenerator()
        print("✅ Voice profile loaded successfully!")
        print(f"Brand Archetype: {generator.voice['overall_personality']['brand_archetype']}")
        print(f"Primary Audience: {generator.voice['target_audience']['primary_audience']}")
        
        # Test API connectivity
        test_research = {
            'trending_topics': ['AI testing'],
            'news_articles': [{'title': 'Testing OpenAI Integration'}]
        }
        
        print("\n🧪 Testing OpenAI API connectivity...")
        result = generator.generate_tweet(test_research)
        
        if result.get('model_used') != 'fallback':
            print("✅ OpenAI API connected successfully!")
            print(f"Generated: {result['content'][:50]}...")
        else:
            print("⚠️ Using fallback content - check API key")
        
        # Test voice consistency
        generator.test_voice_consistency()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nPlease ensure:")
        print("1. data/voice_profile.json exists with your voice data")
        print("2. OPENAI_API_KEY is set in your environment")
        print("3. openai>=1.0.0 is installed (pip install -r requirements.txt)")
