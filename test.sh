#!/bin/bash
echo "Verifying API root..."
curl -s http://localhost:8000/

echo -e "\n\nVerifying Health check..."
curl -s http://localhost:8000/api/health

echo -e "\n\nChecking if React app serves index..."
curl -s -I http://localhost:5173/ | head -n 1
