import requests
import feedparser
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict
import re

class NewsResearcher:
    """Research AI-related news from multiple free sources"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Free RSS feeds focused on AI
        self.rss_feeds = [
            "https://feeds.feedburner.com/oreilly/radar",
            "https://rss.cnn.com/rss/edition.rss",
            "https://feeds.bbci.co.uk/news/technology/rss.xml",
            "https://techcrunch.com/feed/",
            "https://www.wired.com/feed/rss",
        ]
        
        # AI-related keywords to filter content
        self.ai_keywords = [
            "artificial intelligence", "AI", "machine learning", "ML",
            "algorithm", "bias", "ethics", "governance", "responsible AI",
            "AI safety", "neural network", "deep learning", "chatbot",
            "automation", "AI regulation", "AI policy"
        ]
    
    def research_ai_news(self, hours_back: int = 24) -> List[Dict]:
        """Find recent AI-related news articles"""
        
        cutoff_time = datetime.now() - timedelta(hours=hours_back)
        relevant_articles = []
        
        for feed_url in self.rss_feeds:
            try:
                self.logger.info(f"Fetching from: {feed_url}")
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries:
                    # Check if article is recent
                    try:
                        pub_date = datetime(*entry.published_parsed[:6])
                        if pub_date < cutoff_time:
                            continue
                    except:
                        # If we can't parse date, include it anyway
                        pass
                    
                    # Check if article is AI-related
                    title = entry.get('title', '').lower()
                    summary = entry.get('summary', '').lower()
                    
                    if self._is_ai_related(title + " " + summary):
                        article = {
                            'title': entry.get('title', ''),
                            'summary': entry.get('summary', '')[:300],
                            'link': entry.get('link', ''),
                            'published': entry.get('published', ''),
                            'source': feed_url,
                            'relevance_score': self._calculate_relevance(title + " " + summary)
                        }
                        relevant_articles.append(article)
                        
            except Exception as e:
                self.logger.error(f"Error fetching {feed_url}: {e}")
                continue
        
        # Sort by relevance score
        relevant_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
        return relevant_articles[:10]  # Top 10 most relevant
    
    def _is_ai_related(self, text: str) -> bool:
        """Check if text contains AI-related keywords"""
        return any(keyword in text for keyword in self.ai_keywords)
    
    def _calculate_relevance(self, text: str) -> float:
        """Calculate relevance score based on keyword frequency and importance"""
        
        # High-value keywords get more weight
        high_value_keywords = {
            "responsible AI": 3.0,
            "AI ethics": 2.5,
            "AI bias": 2.5,
            "AI governance": 2.0,
            "AI regulation": 2.0,
            "AI safety": 2.0,
            "algorithmic bias": 2.0
        }
        
        # Standard keywords
        standard_keywords = {
            "artificial intelligence": 1.0,
            "machine learning": 1.0,
            "algorithm": 0.8,
            "automation": 0.6
        }
        
        score = 0.0
        text_lower = text.lower()
        
        # Check high-value keywords
        for keyword, weight in high_value_keywords.items():
            if keyword in text_lower:
                score += weight
        
        # Check standard keywords
        for keyword, weight in standard_keywords.items():
            if keyword in text_lower:
                score += weight
        
        return score
    
    def get_trending_topics(self, articles: List[Dict]) -> List[str]:
        """Extract trending topics from articles"""
        
        topic_counts = {}
        
        for article in articles:
            text = (article['title'] + " " + article['summary']).lower()
            
            # Extract topics using simple keyword matching
            for keyword in self.ai_keywords:
                if keyword in text:
                    topic_counts[keyword] = topic_counts.get(keyword, 0) + 1
        
        # Sort by frequency
        trending_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        return [topic[0] for topic in trending_topics[:5]]  # Top 5 trending

# Test the news research
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    researcher = NewsResearcher()
    print("🔍 Researching AI news...")
    
    articles = researcher.research_ai_news()
    
    print(f"\n📰 Found {len(articles)} relevant articles:")
    for i, article in enumerate(articles[:3], 1):
        print(f"\n{i}. {article['title']}")
        print(f"   Relevance: {article['relevance_score']:.1f}")
        print(f"   Source: {article['source']}")
        print(f"   Summary: {article['summary'][:100]}...")
    
    trending = researcher.get_trending_topics(articles)
    print(f"\n🔥 Trending topics: {', '.join(trending)}")
