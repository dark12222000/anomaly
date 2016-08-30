#!/bin/bash

URL="http://localhost"
PORT=3000
IP="137.171.236.221"

function show_help {
  echo "-u  Specify url. Defaults to http://localhost"
  echo "-p  Specify port. Defaults to 3000"
  echo "-i  Specify ip. Defaults to 127.0.0.1"
  exit 0
}

while getopts "h?u:p:i:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    u)  URL=$OPTARG
        ;;
    p)  PORT=$OPTARG
        ;;
    i)  IP=$OPTARG
        ;;
    esac
done

echo "Testing against $URL:$PORT/$IP"
ab -t 30 $URL:$PORT/$IP
