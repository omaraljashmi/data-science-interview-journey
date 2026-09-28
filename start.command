#!/bin/zsh
set -u

cd "$(dirname "$0")"

port=41739
while /usr/sbin/lsof -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1; do
  port=$((port + 1))
done

echo "Starting Data Science Interview Journey at http://localhost:$port"
echo "Keep this window open. Press Control-C to stop."

python3 -m http.server "$port" >/tmp/data-science-interview-journey.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null' INT TERM EXIT
sleep 1

open -a "Google Chrome" "http://localhost:$port/#/dashboard" 2>/dev/null || open "http://localhost:$port/#/dashboard"
wait "$server_pid"
