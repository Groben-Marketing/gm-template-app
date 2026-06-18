#!/usr/bin/env bash
# Compliance scorecard — read-only scan of one repo against the v1.7.0 standards.
#
# This is a REPORTING tool, not a gate. It never blocks, never edits, never fails
# CI. It emits a per-repo scorecard so "are the apps actually getting better" is
# observable instead of asserted. Run it during a Cheetah audit and before/after
# Phase 2 adoption to see the delta. See docs/compliance-scorecard.md for the
# rubric and what each row means.
#
# Honesty rule: it only AUTO-grades high-confidence mechanical signals. Judgment
# items (is the core loop honest? is that select('*') on a growing table?) are
# printed as REVIEW prompts for a human/Cheetah — the script does not pretend to
# grade them, because a false PASS is worse than no score.
#
# Usage:  bash scripts/compliance-scan.sh            # scan current repo
#         bash scripts/compliance-scan.sh /path/repo # scan a checkout elsewhere
set -u

ROOT="${1:-.}"
cd "$ROOT" 2>/dev/null || { echo "compliance-scan: cannot cd to $ROOT" >&2; exit 1; }
REPO="$(basename "$(pwd)")"
DATE="$(date +%F)"

pass=0; warn=0; fail=0; review=0
row() { # row LEVEL "message"
  case "$1" in
    PASS)   printf '  [PASS]   %s\n' "$2"; pass=$((pass+1));;
    WARN)   printf '  [WARN]   %s\n' "$2"; warn=$((warn+1));;
    FAIL)   printf '  [FAIL]   %s\n' "$2"; fail=$((fail+1));;
    REVIEW) printf '  [REVIEW] %s\n' "$2"; review=$((review+1));;
    NA)     printf '  [n/a]    %s\n' "$2";;
  esac
}
# count matches of an extended-regex across src + server (quiet, 0 if none)
count() { grep -rEl "$1" src server starter-server.ts 2>/dev/null | wc -l | tr -d ' '; }
hits()  { grep -rEn "$1" src server starter-server.ts 2>/dev/null | wc -l | tr -d ' '; }

echo "=== Compliance Scorecard: $REPO ($DATE) ==="
echo "    Standards: self-evident-ui · efficiency · fault-isolation (template v1.7.0)"
echo

echo "RULES ADOPTION"
if [ -f PROJECT_PROTOCOL.md ]; then
  if grep -q "Phase 1.5" PROJECT_PROTOCOL.md; then row PASS "PROJECT_PROTOCOL.md is v1.7.0+ (Phase 1.5 Wireframe present)"
  else row FAIL "PROJECT_PROTOCOL.md is pre-v1.7.0 (no Phase 1.5) — sync not merged"; fi
else row FAIL "PROJECT_PROTOCOL.md missing"; fi
for d in self-evident-ui efficiency-standard fault-isolation-standard; do
  if [ -f "docs/$d.md" ]; then row PASS "docs/$d.md present"
  else row FAIL "docs/$d.md missing — rules sync not merged"; fi
done
echo

echo "FAULT ISOLATION"
if [ -f src/components/ErrorBoundary.tsx ]; then
  row PASS "ErrorBoundary.tsx present"
  # wired = referenced somewhere OTHER than its own definition file
  if grep -rEl "ErrorBoundary" src 2>/dev/null | grep -qv "src/components/ErrorBoundary.tsx"; then
    row PASS "ErrorBoundary is wired (referenced in src/)"
  else
    row WARN "ErrorBoundary exists but is NOT referenced — component shipped, not wired"
  fi
else
  row FAIL "ErrorBoundary.tsx missing — a view crash can blank the whole SPA"
fi
if [ -f src/lib/api.ts ]; then
  if grep -q "AbortController" src/lib/api.ts; then row PASS "api.ts is time-boxed (AbortController)"
  else row WARN "api.ts has no timeout — a hung backend can freeze the UI"; fi
else row NA "no src/lib/api.ts (app may not use the shared client)"; fi
if [ -d server ] || [ -f starter-server.ts ]; then
  raw=$(grep -rEl "fetch\(" server starter-server.ts 2>/dev/null | wc -l | tr -d ' ')
  if [ "$raw" -gt 0 ]; then
    if grep -rEq "callExternal|AbortController" server starter-server.ts 2>/dev/null; then
      row PASS "server outbound calls have a timeout guard (callExternal/AbortController present)"
    else
      row WARN "server makes raw fetch() calls with no timeout guard ($raw file(s)) — a hung dependency can cascade"
    fi
  else row NA "no outbound fetch() in server"; fi
fi
echo

echo "EFFICIENCY"
star=$(hits "\.select\((['\"\`])\*(['\"\`])\)")
if [ "$star" -eq 0 ]; then row PASS "no select('*') found"
else row REVIEW "select('*') found ($star occurrence(s)) — confirm none are on a growing table"; fi
if [ "$(count "\.limit\(")" -gt 0 ]; then row PASS "pagination present (.limit used somewhere)"
else row REVIEW "no .limit() anywhere — confirm no unbounded list queries"; fi
echo

echo "SELF-EVIDENT UI   (judgment — not auto-graded)"
if [ -f docs/project-brief.md ]; then
  if grep -q "One sentence. Name the real human" docs/project-brief.md; then
    row REVIEW "Brief 'Core loop' still holds the template placeholder — not filled"
  else
    row REVIEW "Brief 'Core loop' filled — confirm it's one honest sentence, and screens map to its steps"
  fi
else row NA "no docs/project-brief.md (pre-existing repo; brief not retrofitted)"; fi
echo

echo "SUMMARY: $pass pass · $warn warn · $fail fail · $review review"
echo "(advisory only — nothing here blocks; feed it into the audit + adoption tracking)"
exit 0
