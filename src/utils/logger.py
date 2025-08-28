import logging
import os
from datetime import datetime

def setup_logging():
    """Set up logging configuration"""
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(f'logs/ai_agent_{datetime.now().strftime("%Y%m%d")}.log')
        ]
    )
    
    return logging.getLogger(__name__)
