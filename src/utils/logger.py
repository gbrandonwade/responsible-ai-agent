import logging
import os
from datetime import datetime
from pathlib import Path

def setup_logging():
    """Set up logging configuration with proper directory handling"""
    
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    
    # Ensure logs directory exists
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    
    # Create log filename
    log_filename = logs_dir / f'ai_agent_{datetime.now().strftime("%Y%m%d")}.log'
    
    # Configure logging with error handling
    try:
        logging.basicConfig(
            level=getattr(logging, log_level.upper()),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),  # Console output
                logging.FileHandler(log_filename, encoding='utf-8')  # File output with UTF-8 encoding
            ]
        )
    except Exception as e:
        # Fallback to console only if file logging fails
        logging.basicConfig(
            level=getattr(logging, log_level.upper()),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[logging.StreamHandler()]
        )
        print(f"Warning: Could not create log file {log_filename}: {e}")
    
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized - Level: {log_level}, File: {log_filename}")
    
    return logger
