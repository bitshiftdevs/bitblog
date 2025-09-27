#!/bin/bash

case "$1" in
start)
  echo "Starting development environment for $(basename $(pwd))"
  # Example: Start docker containers, set environment variables, etc.
  docker start postgis
  ;;
exit)
  echo "Stopping development environment for $(basename $(pwd))"
  # Example: Stop docker containers, cleanup, etc.
  docker stop postgis
  ;;
*)
  echo "Usage: $0 {start|exit}"
  exit 1
  ;;
esac
