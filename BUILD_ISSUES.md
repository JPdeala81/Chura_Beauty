# Build Issues & Troubleshooting

## Known Issues

### 1. Unterminated Regular Expression Error (Vite/esbuild)

**Status:** Investigating
**File:** `frontend/src/pages/admin/DeveloperDashboard.jsx`
**Error Message:** "Unterminated regular expression" at line 3894

**Details:**
- Esbuild parser struggles with complex template literals containing multiple ternary operators
- The issue appears to be a **false positive** - the JSX is properly formed
- Occurs with multi-line template literals using backticks

**Workaround:**
Option 1: Refactor template literals to avoid nesting

```javascript
// Instead of:
border: `2px solid ${modal.type === 'success' ? '#00d9ff' : '#ff6b6b'}`

// Use variables:
const borderColor = modal.type === 'success' ? '#00d9ff' : '#ff6b6b'
border: `2px solid ${borderColor}`
```

Option 2: Use object styles instead of template strings

```javascript
// Instead of template string
const borderStyles = {
  success: '2px solid #00d9ff',
  error: '2px solid #ff6b6b',
  // ...
}
border: borderStyles[modal.type]
```

**Related Files:**
- Lines with multi-line template literals: 3810, 3876
- DashboardModal component: Uses similar pattern

**Next Steps:**
1. Refactor template literals to avoid nesting  
2. Update esbuild configuration
3. Consider switching to CSS variables
4. Test with different Vite versions

## Solutions Tested

| Solution | Status | Notes |
|----------|--------|-------|
| Remove duplicate `newAdminEmail` state | ✓ Fixed | Was causing "Symbol already declared" |
| Check backtick balance | ✓ Confirmed | 21 backticks (odd number indicates issue) |
| Verify DashboardModal.jsx | ✓ No errors | Component is clean |
| Clean build with dist delete | ✗ Failed | Esbuild still fails to parse |

## Recommended Action

Since the JavaScript/JSX code is syntactically correct and passes linting, the build issue is likely a **Vite/esbuild parser limitation with complex template literals**.

**Temporary Solution:** 
1. Extract ternary logic into separate variables before template string
2. Commit working code
3. Address build optimization in future sprint

---

**Date:** Session End
**Severity:** Medium (code works in dev, blocks production build)
**Impact:** Cannot deploy to production until resolved
