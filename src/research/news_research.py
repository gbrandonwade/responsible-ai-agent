import requests
import feedparser
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict
import re
import time

class NewsResearcher:
    """Research AI-related news from multiple free sources"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Free RSS feeds focused on AI and tech
        self.rss_feeds = [
            "https://feeds.feedburner.com/oreilly/radar",
            "https://feeds.bbci.co.uk/news/technology/rss.xml",
            "https://techcrunch.com/category/artificial-intelligence/feed/",
            "https://www.wired.com/feed/category/business/artificial-intelligence/rss",
            "https://rss.cnn.com/rss/cnn_tech.rss",
            "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
            "https://venturebeat.com/category/ai/feed/",
        ]
        
        # AI-related keywords to filter content
        self.ai_keywords = [
            "artificial intelligence", "AI", "machine learning", "ML",
            "algorithm", "bias", "ethics", "governance", "responsible AI",
            "AI safety", "neural network", "deep learning", "chatbot",
            "automation", "AI regulation", "AI policy", "algorithmic",
            "generative AI", "LLM", "large language model", "GPT",
            "AI transparency", "explainable AI", "AI audit"
        ]
        
        # Request headers to avoid blocking
        self.headers = {
            'User-Agent': 'ResponsibleAI-NewsBot/1.0 (Educational Research)'
        }
    
    def research_ai_news(self, hours_back: int = 24) -> List[Dict]:
        """Find recent AI-related news articles"""
        
        cutoff_time = datetime.now() - timedelta(hours=hours_back)
        relevant_articles = []
        
        for feed_url in self.rss_feeds:
            try:
                self.logger.info(f"Fetching from: {feed_url}")
                
                # Add timeout and error handling
                feed = feedparser.parse(feed_url, agent=self.headers['User-Agent'])
                
                # Check if feed was parsed successfully
                if hasattr(feed, 'bozo') and feed.bozo:
                    self.logger.warning(f"Feed parse warning for {feed_url}: {getattr(feed, 'bozo_exception', 'Unknown')}")
                
                if not hasattr(feed, 'entries') or not feed.entries:
                    self.logger.warning(f"No entries found for {feed_url}")
                    continue
                
                for entry in feed.entries:
                    # Check if article is recent
                    article_date = None
                    try:
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            article_date = datetime(*entry.published_parsed[:6])
                        elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                            article_date = datetime(*entry.updated_parsed[:6])
                    except (TypeError, ValueError) as e:
                        self.logger.debug(f"Could not parse date for article: {e}")
                    
                    # If we can't determine the date, include recent articles anyway
                    if article_date and article_date < cutoff_time:
                        continue
                    
                    # Check if article is AI-related
                    title = entry.get('title', '').lower()
                    summary = entry.get('summary', '').lower()
                    content = entry.get('content', [{}])
                    content_text = ''
                    
                    # Extract content text if available
                    if isinstance(content, list) and content:
                        content_text = content[0].get('value', '').lower()
                    
                    full_text = f"{title} {summary} {content_text}"
                    
                    if self._is_ai_related(full_text):
                        # Clean and validate article data
                        article = self._create_article_dict(entry, feed_url, full_text)
                        if article:
                            relevant_articles.append(article)
                
                # Add delay to be respectful to servers
                time.sleep(0.5)
                        
            except Exception as e:
                self.logger.error(f"Error fetching {feed_url}: {e}")
                continue
        
        # Sort by relevance score and recency
        relevant_articles.sort(key=lambda x: (x['relevance_score'], x.get('published_timestamp', 0)), reverse=True)
        
        # Return top 10 most relevant articles
        top_articles = relevant_articles[:10]
        self.logger.info(f"Found {len(top_articles)} relevant AI articles from {len(self.rss_feeds)} sources")
        
        return top_articles
    
    def _create_article_dict(self, entry, source_url: str, full_text: str) -> Dict:
        """Create standardized article dictionary"""
        try:
            title = entry.get('title', '').strip()
            summary = entry.get('summary', '').strip()
            link = entry.get('link', '').strip()
            
            if not title:
                return None
            
            # Calculate relevance score
            relevance_score = self._calculate_relevance(full_text)
            
            # Extract published timestamp for sorting
            published_timestamp = 0
            published_str = entry.get('published', '')
            try:
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_timestamp = time.mktime(entry.published_parsed)
            except:
                pass
            
            article = {
                'title': title,
                'summary': summary[:300] if summary else '',  # Limit summary length
                'link': link,
                'published': published_str,
                'published_timestamp': published_timestamp,
                'source': source_url,
                'relevance_score': relevance_score,
                'extracted_at': datetime.now().isoformat()
            }
            
            return article
            
        except Exception as e:
            self.logger.warning(f"Could not create article dict: {e}")
            return None
    
    def _is_ai_related(self, text: str) -> bool:
        """Check if text contains AI-related keywords"""
        if not text:
            return False
            
        # Convert to lowercase for matching
        text_lower = text.lower()
        
        # Check for exact keyword matches
        for keyword in self.ai_keywords:
            if keyword in text_lower:
                return True
        
        # Additional patterns that might indicate AI content
        ai_patterns = [
            r'\bai\b',  # Standalone "AI" word
            r'machine.*learning',
            r'artificial.*intelligence',
            r'neural.*network',
            r'deep.*learning',
            r'algorithm.*bias',
        ]
        
        for pattern in ai_patterns:
            if re.search(pattern, text_lower):
                return True
        
        return False
    
    def _calculate_relevance(self, text: str) -> float:
        """Calculate relevance score based on keyword frequency and importance"""
        
        # High-value keywords get more weight
        high_value_keywords = {
            "responsible AI": 3.0,
            "AI ethics": 2.5,
            "AI bias": 2.5,
            "algorithmic bias": 2.5,
            "AI governance": 2.0,
            "AI regulation": 2.0,
            "AI safety": 2.0,
            "AI transparency": 2.0,
            "explainable AI": 2.0,
            "AI audit": 1.5,
            "algorithmic fairness": 2.0
        }
        
        # Standard keywords
        standard_keywords = {
            "artificial intelligence": 1.0,
            "machine learning": 1.0,
            "deep learning": 1.0,
            "neural network": 0.8,
            "algorithm": 0.6,
            "automation": 0.5,
            "generative AI": 1.2,
            "large language model": 1.0,
            "LLM": 1.0,
            "GPT": 0.8
        }
        
        score = 0.0
        text_lower = text.lower()
        
        # Check high-value keywords
        for keyword, weight in high_value_keywords.items():
            count = text_lower.count(keyword)
            if count > 0:
                score += weight * min(count, 3)  # Cap at 3 mentions
        
        # Check standard keywords
        for keyword, weight in standard_keywords.items():
            count = text_lower.count(keyword)
            if count > 0:
                score += weight * min(count, 2)  # Cap at 2 mentions
        
        # Boost score for title mentions (more important)
        if 'title' in text_lower:
            score *= 1.2
        
        return min(score, 10.0)  # Cap maximum score at 10.0
    
    def get_trending_topics(self, articles: List[Dict]) -> List[str]:
        """Extract trending topics from articles"""
        
        topic_counts = {}
        
        for article in articles:
            title = article.get('title', '').lower()
            summary = article.get('summary', '').lower()
            text = f"{title} {summary}"
            
            # Extract topics using keyword matching
            for keyword in self.ai_keywords:
                if keyword in text:
                    # Normalize similar terms
                    normalized_keyword = self._normalize_topic(keyword)
                    topic_counts[normalized_keyword] = topic_counts.get(normalized_keyword, 0) + 1
        
        # Sort by frequency and return top 5
        trending_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Filter out very common terms and return meaningful topics
        filtered_topics = []
        for topic, count in trending_topics[:8]:  # Look at top 8 to filter
            if count >= 2 or topic in ["responsible AI", "AI ethics", "AI bias", "AI governance"]:
                filtered_topics.append(topic)
        
        return filtered_topics[:5]  # Return top 5
    
    def _normalize_topic(self, keyword: str) -> str:
        """Normalize similar keywords into consistent topics"""
        keyword_lower = keyword.lower()
        
        # Mapping of similar terms
        topic_mapping = {
            'artificial intelligence': 'AI',
            'machine learning': 'machine learning',
            'ai': 'AI',
            'ml': 'machine learning',
            'algorithm': 'algorithms',
            'algorithmic': 'algorithms',
            'bias': 'AI bias',
            'ai bias': 'AI bias',
            'algorithmic bias': 'AI bias',
            'ethics': 'AI ethics',
            'ai ethics': 'AI ethics',
            'governance': 'AI governance',
            'ai governance': 'AI governance',
            'responsible ai': 'responsible AI',
            'ai safety': 'AI safety',
            'ai regulation': 'AI regulation',
            'ai transparency': 'AI transparency',
            'explainable ai': 'explainable AI'
        }
        
        return topic_mapping.get(keyword_lower, keyword)

# Test the news research
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    print("🔍 Testing ResponsibleAI News Researcher...")
    researcher = NewsResearcher()
    
    print("\n📰 Researching AI news...")
    articles = researcher.research_ai_news(hours_back=48)  # Look back 48 hours for testing
    
    print(f"\n📊 Found {len(articles)} relevant articles:")
    for i, article in enumerate(articles[:5], 1):  # Show top 5
        print(f"\n{i}. {article['title']}")
        print(f"   Relevance: {article['relevance_score']:.1f}")
        print(f"   Source: {article['source'].split('/')[-1]}")  # Show domain only
        if article['summary']:
            print(f"   Summary: {article['summary'][:100]}...")
        print(f"   Link: {article['link']}")
    
    trending = researcher.get_trending_topics(articles)
    print(f"\n🔥 Trending topics ({len(trending)}): {', '.join(trending)}")
    
    print("\n✅ News research test completed successfully!")
