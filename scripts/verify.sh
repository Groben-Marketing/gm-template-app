#!/usr/bin/env bash
# Mechanical verification floor — typecheck + build, plus smoke when the API is up.
# Registered as a Claude Code Stop hook in .claude/settings.json: a session cannot
# end while these checks fail (a Stop hook blocks only on exit code 2).
# Manual run: bash scripts/verify.sh
# The full standard (browser walk, console/network, render checks) is /qa —
# see docs/agent-verification.md. This script is the floor, not the standard.
set -u

# Stop-hook loop guard: when invoked as a hook, stdin carries JSON with
# stop_hook_active=true if this hook already blocked the current stop once.
# Let the second attempt through so an unfixable failure can't loop forever.
if [ ! -t 0 ]; then
  HOOK_INPUT=$(cat 2>/dev/null || true)
  case "$HOOK_INPUT" in
    *'"stop_hook_active":true'* | *'"stop_hook_active": true'*)
      echo "verify: stop_hook_active set — already blocked this stop once, allowing it through"
      exit 0
      ;;
  esac
fi

fail() {
  echo "" >&2
  echo "VERIFY FAILED: $1" >&2
  exit 2
}

echo "== verify: typecheck =="
npm run typecheck || fail "typecheck failed — fix the type errors above before ending the session"

echo "== verify: build =="
npm run build || fail "build failed — fix the build errors above before ending the session"

# Port discovery: environment wins, then the repo's .env, then template default.
# Without this, a different app squatting on :3000 makes the health probe a
# false positive and smoke runs against the wrong server.
if [ -z "${PORT:-}" ] && [ -f .env ]; then
  PORT=$(grep -E '^PORT=' .env | tail -1 | cut -d= -f2 | tr -d '[:space:]\r')
fi
API_PORT="${PORT:-3000}"
HEALTH_URL="${API_URL:-http://localhost:${API_PORT}}/health"
if curl -sf --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
  echo "== verify: smoke =="
  npm run smoke || fail "smoke tests failed — fix the failing routes above before ending the session"
else
  echo "smoke skipped: server not running"
fi

echo "verify: all checks passed"
exit 0
