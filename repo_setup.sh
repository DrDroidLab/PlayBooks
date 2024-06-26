#!/bin/bash

# Check if the remote 'upstream' already exists
if git remote | grep -q 'upstream'; then
  echo "Remote 'upstream' already exists."
else
  git remote add upstream https://example.com/user/repository.git
  git remote set-url --push upstream DISABLE
  echo "Remote 'upstream' added successfully."
fi
