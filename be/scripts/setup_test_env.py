import sys
import os
import webbrowser
import time
import subprocess
import socket

# Add project root to Python path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now we can import from project modules
from scripts.init_db import init_users

def setup_test_env():
    print("Setting up test environment for SoundSleuth API testing...")
    
    # Initialize test users in database
    try:
        init_users()
    except Exception as e:
        print(f"Error initializing users: {e}")
        print("Make sure your MongoDB connection is configured correctly.")
        return
    
    # Check if server is running on port 8000
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_running = sock.connect_ex(('localhost', 8000)) == 0
    sock.close()
    
    if not server_running:
        print("\nStarting FastAPI server...")
        # Start the FastAPI server in a separate process
        # Use the root path for running uvicorn
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Use pythonw to run without console window on Windows
        if sys.platform == "win32":
            subprocess.Popen(
                ["python", "-m", "uvicorn", "main:app", "--reload"], 
                cwd=project_root
            )
        else:
            subprocess.Popen(
                ["python", "-m", "uvicorn", "main:app", "--reload"],
                cwd=project_root
            )
        
        print("Waiting for server to start...")
        time.sleep(3)
    
    # Open the quick token endpoint in the browser
    print("\nOpening Swagger UI with quick authentication...")
    webbrowser.open("http://localhost:8000/docs")
    
    print("\n✅ Test environment is ready!")
    print("1. In the Swagger UI, expand the '/verification/quick-token' endpoint in the authentication section")
    print("2. Click 'Try it out' and then 'Execute' to get a token")
    print("3. The UI will automatically use this token for your API testing")

if __name__ == "__main__":
    setup_test_env()
