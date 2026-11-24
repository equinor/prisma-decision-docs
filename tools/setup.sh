#!/usr/bin/env bash
# Documentation system for prisma-decision: clone/update the web app and API,
# start them locally in Research mode (no login, SQLite) and prepare the
# headless browser used by capture.mjs.
#
# Usage:
#   tools/setup.sh [up]        clone or update, (re)build only what changed, start everything
#   tools/setup.sh status      show running services and source versions
#   tools/setup.sh stop        stop web and API
#   tools/setup.sh check       only report whether upstream has new commits
#
# Options (environment variables):
#   PRISMA_SRC_DIR   where the web/api repos are cloned (default: parent dir of this repo)
#   PRISMA_REF       git ref to track (default: main)
#   PRISMA_NO_PULL=1 do not pull upstream changes, run with what is checked out
set -euo pipefail

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(dirname "$TOOLS_DIR")"
STATE_DIR="$TOOLS_DIR/.state"
VERSIONS_FILE="$DOCS_DIR/workflow/figures/versions.json"

PRISMA_SRC_DIR="${PRISMA_SRC_DIR:-$(dirname "$DOCS_DIR")}"
PRISMA_REF="${PRISMA_REF:-main}"
PRISMA_NO_PULL="${PRISMA_NO_PULL:-0}"

API_DIR="$PRISMA_SRC_DIR/prisma-decision-api"
WEB_DIR="$PRISMA_SRC_DIR/prisma-decision-web"
API_URL="http://localhost:7075"
WEB_URL="http://127.0.0.1:5004"
WEB_PID_FILE="$STATE_DIR/web.pid"
WEB_LOG="$STATE_DIR/web.log"
# see compose.override.yml for why the API talks to FastAPI through the host
COMPOSE=(docker compose -f "$API_DIR/docker-compose.yml" -f "$TOOLS_DIR/compose.override.yml")

mkdir -p "$STATE_DIR"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
warn() { printf '\033[33m  ! %s\033[0m\n' "$*"; }

# ---------------------------------------------------------------- git helpers

sync_repo() { # name dir
	local name="$1" dir="$2" url="https://github.com/equinor/$1.git"
	if [[ ! -d "$dir/.git" ]]; then
		bold "Cloning $name"
		git clone -q --branch "$PRISMA_REF" "$url" "$dir"
		return
	fi
	git -C "$dir" fetch -q origin "$PRISMA_REF"
	local behind
	behind=$(git -C "$dir" rev-list --count "HEAD..origin/$PRISMA_REF")
	if [[ "$behind" -gt 0 ]]; then
		if [[ "$PRISMA_NO_PULL" == "1" ]]; then
			warn "$name: $behind new upstream commit(s) not pulled (PRISMA_NO_PULL=1)"
		else
			bold "Updating $name ($behind new commit(s))"
			git -C "$dir" --no-pager log --oneline "HEAD..origin/$PRISMA_REF" | sed 's/^/    /'
			git -C "$dir" pull -q --ff-only origin "$PRISMA_REF"
		fi
	fi
}

sha_of() { git -C "$1" rev-parse --short=10 HEAD; }

# Compare the checked-out version with the one recorded at the last capture.
report_since_last_capture() { # key name dir
	local key="$1" name="$2" dir="$3" recorded
	[[ -f "$VERSIONS_FILE" ]] || return 0
	recorded=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1])).get(sys.argv[2],{}).get('commit',''))" "$VERSIONS_FILE" "$key")
	[[ -n "$recorded" ]] || return 0
	if git -C "$dir" cat-file -e "$recorded^{commit}" 2>/dev/null; then
		local n
		n=$(git -C "$dir" rev-list --count "$recorded..HEAD")
		if [[ "$n" -gt 0 ]]; then
			warn "$name has $n commit(s) since the figures were last captured ($recorded) -> re-run capture"
		else
			info "$name unchanged since last capture ($recorded)"
		fi
	else
		warn "$name: recorded capture commit $recorded not found locally"
	fi
}

# ------------------------------------------------------------------- services

wait_for() { # url label
	local i
	for i in $(seq 1 60); do
		if curl -sf -o /dev/null -H "X-Username: docs-bot" "$1"; then return 0; fi
		sleep 1
	done
	echo "Timed out waiting for $2 at $1" >&2
	return 1
}

api_up() {
	bold "API (docker compose)"
	local sha built
	sha=$(sha_of "$API_DIR")
	built=$(cat "$STATE_DIR/api.built" 2>/dev/null || true)
	if [[ "$sha" != "$built" ]]; then
		info "source changed ($built -> $sha), rebuilding images"
		"${COMPOSE[@]}" up --build -d --quiet-pull 2>&1 | grep -Ev '^\s*$|#[0-9]+ ' | tail -5 | sed 's/^/    /'
		echo "$sha" >"$STATE_DIR/api.built"
	else
		"${COMPOSE[@]}" up -d 2>&1 | tail -2 | sed 's/^/    /'
	fi
	wait_for "$API_URL/projects" "API"
	info "ready at $API_URL (Research mode, SQLite)"
}

web_running() {
	[[ -f "$WEB_PID_FILE" ]] && kill -0 "$(cat "$WEB_PID_FILE")" 2>/dev/null
}

web_up() {
	bold "Web (vite --mode research)"
	local lock_hash installed
	lock_hash=$(sha256sum "$WEB_DIR/package-lock.json" | cut -c1-16)
	installed=$(cat "$STATE_DIR/web.lock" 2>/dev/null || true)
	if [[ "$lock_hash" != "$installed" || ! -d "$WEB_DIR/node_modules" ]]; then
		info "dependencies changed, running npm ci"
		(cd "$WEB_DIR" && npm ci --no-audit --no-fund --silent)
		echo "$lock_hash" >"$STATE_DIR/web.lock"
	fi
	if web_running; then
		info "already running (pid $(cat "$WEB_PID_FILE"))"
	elif curl -sf -o /dev/null "$WEB_URL/"; then
		warn "something else already listens on $WEB_URL, using it"
	else
		(cd "$WEB_DIR" && nohup npm run research -- --host 127.0.0.1 >"$WEB_LOG" 2>&1 &
			echo $! >"$WEB_PID_FILE")
	fi
	wait_for "$WEB_URL/" "web"
	info "ready at $WEB_URL (log: $WEB_LOG)"
}

web_stop() {
	if web_running; then
		local pid
		pid=$(cat "$WEB_PID_FILE")
		# npm spawns vite as a child; kill the whole process group
		kill -- -"$(ps -o pgid= "$pid" | tr -d ' ')" 2>/dev/null || kill "$pid" 2>/dev/null || true
		rm -f "$WEB_PID_FILE"
		info "web stopped"
	fi
}

browser_up() {
	bold "Headless browser (playwright)"
	if [[ ! -d "$TOOLS_DIR/node_modules/playwright" ]]; then
		(cd "$TOOLS_DIR" && npm ci --no-audit --no-fund --silent)
	fi
	local marker="$STATE_DIR/playwright.version" want
	want=$(cd "$TOOLS_DIR" && node -p "require('playwright/package.json').version")
	if [[ "$(cat "$marker" 2>/dev/null || true)" != "$want" ]]; then
		info "installing chromium for playwright $want"
		(cd "$TOOLS_DIR" && npx playwright install --with-deps chromium >/dev/null 2>&1 || npx playwright install chromium >/dev/null)
		echo "$want" >"$marker"
	fi
	info "ready"
}

# ------------------------------------------------------------------- commands

cmd_check() {
	bold "Checking upstream ($PRISMA_REF)"
	PRISMA_NO_PULL=1
	sync_repo prisma-decision-api "$API_DIR"
	sync_repo prisma-decision-web "$WEB_DIR"
	cmd_status
}

cmd_status() {
	bold "Versions"
	for pair in "api:prisma-decision-api:$API_DIR" "web:prisma-decision-web:$WEB_DIR"; do
		IFS=: read -r key name dir <<<"$pair"
		if [[ -d "$dir/.git" ]]; then
			info "$name @ $(sha_of "$dir") ($(git -C "$dir" --no-pager log -1 --format='%cs %s' | cut -c1-70))"
			report_since_last_capture "$key" "$name" "$dir"
		else
			info "$name: not cloned"
		fi
	done
	bold "Services"
	curl -sf -o /dev/null -H "X-Username: docs-bot" "$API_URL/projects" && info "API  up   $API_URL" || info "API  down"
	curl -sf -o /dev/null "$WEB_URL/" && info "web  up   $WEB_URL" || info "web  down"
}

cmd_stop() {
	web_stop
	"${COMPOSE[@]}" stop 2>&1 | tail -2 | sed 's/^/  /'
}

cmd_up() {
	bold "Sources in $PRISMA_SRC_DIR ($PRISMA_REF)"
	sync_repo prisma-decision-api "$API_DIR"
	sync_repo prisma-decision-web "$WEB_DIR"
	api_up
	web_up
	browser_up
	echo
	cmd_status
	echo
	bold "Next: node tools/capture.mjs --project <project.json>"
}

case "${1:-up}" in
up) cmd_up ;;
status) cmd_status ;;
stop) cmd_stop ;;
check) cmd_check ;;
*)
	sed -n '2,16p' "$0"
	exit 1
	;;
esac
