import os
import socket

# Get hostname
hostname = socket.gethostname()
print(f"Hostname: {hostname}")

# Get environment variables
print("\nEnvironment Variables:")
for key, value in os.environ.items():
    if "URL" in key or "HOST" in key or "RAILWAY" in key or "DOMAIN" in key:
        print(f"{key}: {value}")

# Try to determine the URL
port = os.environ.get('PORT', '8080')
print(f"\nPossible URLs:")
print(f"http://{hostname}:{port}")
print(f"https://{hostname}")
print(f"https://{hostname}.up.railway.app")

print("\nIf you're seeing this message, please copy and share the output above to help determine your Railway URL.") 