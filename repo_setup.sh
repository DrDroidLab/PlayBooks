#!/bin/bash

# Check if the remote 'upstream' already exists
if git remote | grep -q 'open-source'; then
  echo "Remote 'open-source' already exists."
else
  git remote add open-source https://github.com/DrDroidLab/PlayBooks
  git remote set-url --push open-source DISABLE
  echo "Remote 'open-source' added successfully."
fi
