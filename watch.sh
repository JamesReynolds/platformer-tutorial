#!/bin/sh -eu

cd "$(dirname "$0")"
mkdir -p dist
tsc
python -m http.server --directory dist &
PID1=$!
tsc -w &
PID2=$!
trap 'kill ${PID1} ; kill ${PID2}' EXIT

while inotifywait -qq -r dist;
do
    node dist/build.js
done
