#!/bin/bash
# GlobalCover Production Validation Script
# Usage: ./scripts/validate-production.sh https://your-domain.com

set -e

BASE_URL="${1:-http://localhost:3000}"
ADMIN_KEY="${2:-}"

echo "🔍 Validating GlobalCover deployment at: $BASE_URL"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

check() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local method="${4:-GET}"
    local data="${5:-}"
    local auth="${6:-}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        if [ -n "$auth" ]; then
            status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth" \
                -d "$data")
        else
            status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    elif [ -n "$auth" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url" \
            -H "Authorization: Bearer $auth")
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $name (HTTP $status)"
        ((passed++))
    else
        echo -e "${RED}✗${NC} $name (Expected $expected_status, got $status)"
        ((failed++))
    fi
}

echo ""
echo "📍 Public Endpoints"
echo "-------------------"

# Homepage
check "Homepage" "$BASE_URL"

# Health check
check "Health Check" "$BASE_URL/api/v1/health"

# Public API endpoints
check "Categories API" "$BASE_URL/api/v1/categories"
check "Products API" "$BASE_URL/api/v1/products"
check "Benefits API" "$BASE_URL/api/v1/benefits"
check "Checkout Pricing" "$BASE_URL/api/v1/checkout"

# Public pages
check "Join Page" "$BASE_URL/join"
check "Dashboard Page" "$BASE_URL/dashboard"

echo ""
echo "🔒 Protected Endpoints"
echo "----------------------"

if [ -n "$ADMIN_KEY" ]; then
    check "Admin Stats" "$BASE_URL/api/v1/admin/stats" "200" "GET" "" "$ADMIN_KEY"
    check "Admin Leads" "$BASE_URL/api/v1/admin/leads" "200" "GET" "" "$ADMIN_KEY"
    check "Admin Waitlist" "$BASE_URL/api/v1/admin/waitlist" "200" "GET" "" "$ADMIN_KEY"
    check "Admin Circuits" "$BASE_URL/api/v1/admin/circuits" "200" "GET" "" "$ADMIN_KEY"
else
    echo -e "${YELLOW}⚠${NC} Skipping admin endpoints (no ADMIN_KEY provided)"
    echo "  Run with: ./validate-production.sh $BASE_URL YOUR_ADMIN_KEY"
fi

# Test unauthorized access
check "Admin Stats (no auth)" "$BASE_URL/api/v1/admin/stats" "401"

echo ""
echo "📝 Form Endpoints (Rate Limited)"
echo "---------------------------------"

# Search endpoint
check "Search API" "$BASE_URL/api/v1/search" "200" "POST" '{"query":"travel insurance","limit":3}'

echo ""
echo "=================================================="
echo -e "Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"

if [ $failed -gt 0 ]; then
    echo -e "${RED}❌ Some checks failed!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
fi
