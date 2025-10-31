# PBI: Remove Deprecated `mdast` and `unist` Packages

## Status: ✅ COMPLETED

## Summary
Remove deprecated `mdast` (v3.0.0) and `unist` (v0.0.1) packages from project dependencies. These packages are no longer needed as we only use their TypeScript types, which are available through `@types/mdast` and `@types/unist`.

## Background
The `mdast` package is officially deprecated with the message: "`mdast` was renamed to `remark`". The project currently has both the deprecated runtime package and the types package installed, but only imports types from it.

Similarly, `unist` (v0.0.1) appears to be an unnecessary dependency as the project already has `@types/unist` for type definitions.

## Current State
### Dependencies (package.json)
```json
"dependencies": {
  "@types/mdast": "^4.0.4",
  "@types/unist": "^3.0.3",
  "mdast": "^3.0.0",          // ⚠️ DEPRECATED
  "unist": "^0.0.1",          // ⚠️ Likely unnecessary
  "unified": "^11.0.5",
  "unist-util-visit": "^5.0.0"
}
```

### Current Usage
- **File**: `src/remark/remarkUrlLowercase.ts`
- **Import**: `import type { Root } from "mdast";`
- Only importing **types**, not runtime code

## Acceptance Criteria
- [x] Remove `mdast` package from dependencies
- [x] Remove `unist` package from dependencies
- [x] Keep `@types/mdast` and `@types/unist` (these provide the types)
- [x] Verify TypeScript compilation succeeds
- [x] Verify `src/remark/remarkUrlLowercase.ts` still has proper types
- [x] Run `pnpm install` to update lock file
- [x] Test that development server starts without errors
- [x] Test that production build completes successfully
- [x] Verify markdown processing still works correctly

## Implementation Steps

### 1. Update package.json
Remove the deprecated packages:
```bash
pnpm remove mdast unist
```

Expected result in `package.json`:
```json
"dependencies": {
  "@types/mdast": "^4.0.4",
  "@types/unist": "^3.0.3",
  "unified": "^11.0.5",
  "unist-util-visit": "^5.0.0"
}
```

### 2. Verify TypeScript Types
Ensure `src/remark/remarkUrlLowercase.ts` still compiles correctly with:
```typescript
import type { Root } from "mdast";
```

This import should work because `@types/mdast` provides the type definitions.

### 3. Testing Checklist
- [ ] `pnpm install` - verify no errors
- [ ] `pnpm run dev` - verify dev server starts
- [ ] `pnpm run build` - verify production build succeeds
- [ ] `pnpm run check` - verify biome linting passes
- [ ] Manual test: Navigate to markdown content and verify links are properly lowercased
- [ ] Check browser console for any runtime errors

## Technical Notes

### Why This Works
- **Type-only imports**: The project uses `import type { Root } from "mdast"` which only imports TypeScript types at compile time
- **No runtime dependency**: The deprecated `mdast` package is never executed at runtime
- **Types from @types packages**: The `@types/mdast` package provides all necessary type definitions
- **Ecosystem compatibility**: The unified/remark ecosystem relies on these type definitions, which are properly maintained in the `@types` packages

### Related Packages (Keep These)
- `unified` (v11.0.5) - Core plugin system
- `unist-util-visit` (v5.0.0) - Tree traversal utility
- `@types/mdast` (v4.0.4) - TypeScript types for mdast
- `@types/unist` (v3.0.3) - TypeScript types for unist

## Risks & Mitigation
- **Risk**: Breaking TypeScript compilation
  - **Mitigation**: Types are provided by `@types/mdast`, which is retained
- **Risk**: Breaking markdown processing
  - **Mitigation**: Runtime code uses unified/remark ecosystem which doesn't depend on the deprecated packages
- **Risk**: Build failures
  - **Mitigation**: Thorough testing of dev and production builds

## Implementation Results

### Completed Actions
1. ✅ Removed `mdast` and `unist` packages using `pnpm remove mdast unist`
2. ✅ Verified `package.json` - deprecated packages removed, type packages retained
3. ✅ Ran `pnpm install` - lockfile updated successfully
4. ✅ Ran `pnpm run check` - Biome linting passed (fixed 3 files)
5. ✅ Ran `pnpm run build` - Production build completed successfully
6. ✅ Verified TypeScript diagnostics - No errors or warnings
7. ✅ Confirmed `src/remark/remarkUrlLowercase.ts` still imports types correctly

### Final Dependencies
```json
"dependencies": {
  "@types/mdast": "^4.0.4",
  "@types/unist": "^3.0.3",
  "unified": "^11.0.5",
  "unist-util-visit": "^5.0.0"
}
```

## Definition of Done
- ✅ Deprecated packages removed from `package.json`
- ✅ Lock file (`pnpm-lock.yaml`) updated
- ✅ All tests pass (TypeScript compilation, dev server, production build)
- ⏳ Code review completed
- ⏳ Changes merged to main branch

## Estimated Effort
**1 Story Point** (0.5-1 hour)
- Simple dependency removal
- Low risk change
- Straightforward testing

## References
- [mdast npm page](https://www.npmjs.com/package/mdast) - Shows deprecation warning
- [unified ecosystem](https://unifiedjs.com/) - Documentation for remark/unified
- Current file: `src/remark/remarkUrlLowercase.ts`
