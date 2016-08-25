#!/bin/bash

URL="http://localhost"
PORT=3000

function show_help {
  echo "-u  Specify url. Defaults to http://localhost"
  echo "-p  Specify port. Defaults to 3000"
  exit 0
}

while getopts "h?u:p:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    u)  URL=$OPTARG
        ;;
    p)  PORT=$OPTARG
        ;;
    esac
done

echo "Testing against $URL:$PORT/"
ab -t 30 $URL:$PORT/
