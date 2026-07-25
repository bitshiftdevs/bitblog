#!/bin/bash

case "$1" in
start)
  echo "Starting development environment for $(basename $(pwd))"
  docker compose up -d
  ;;
exit)
  echo "Stopping development environment for $(basename $(pwd))"
  docker compose down
  ;;
*)
  echo "Usage: $0 {start|exit}"
  exit 1
  ;;
esac
