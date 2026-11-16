#!/usr/bin/env bash
# Build on this Mac and publish to https://httpowl.net. Usage: deploy/deploy.sh
# Uploads to /var/www/httpowl/app.new, then swaps it in; the previous build is
# kept as app.prev (roll back: mv app app.bad && mv app.prev app).
set -euo pipefail
cd "$(dirname "$0")/.."
HOST=${HOST:-root@213.130.144.132}
DIR=/var/www/httpowl
npm run build
COPYFILE_DISABLE=1 tar --no-xattrs -czf - -C dist . | ssh "$HOST" "rm -rf $DIR/app.new && mkdir -p $DIR/app.new && tar xzf - -C $DIR/app.new"
ssh "$HOST" bash -s <<REMOTE
set -euo pipefail
cd $DIR
find app.new -name '._*' -delete
chmod -R a+rX app.new
rm -rf app.prev
[ -d app ] && mv app app.prev
mv app.new app
curl -fsS -o /dev/null https://httpowl.net/ && echo "live: https://httpowl.net"
REMOTE
