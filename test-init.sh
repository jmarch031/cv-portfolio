#!/usr/bin/env bash
# Test that Vite project is initialized
if [ -f "package.json" ]; then
  echo "SUCCESS: package.json found"
else
  echo "FAILURE: package.json not found"
  exit 1
fi
