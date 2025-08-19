#!/usr/bin/env python3
"""
Simple startup script for tRPC Tester
"""

import os
import sys
from app import app

if __name__ == '__main__':
    # Set default configuration
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('FLASK_DEBUG', '1')
    
    print("🚀 Starting tRPC Tester...")
    print("📱 Open your browser and navigate to: http://localhost:5000")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 tRPC Tester stopped. Goodbye!")
        sys.exit(0)
