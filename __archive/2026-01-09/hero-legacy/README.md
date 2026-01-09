# Legacy Hero Implementation Archive

This directory contains legacy hero implementation components that were archived during Phase 1.

## Contents

- Legacy hero components that were no longer used in the active codebase
- Previous implementation of hero slides and split hero functionality

## Why Archived

These components were identified as unused during the Phase 1 cleanup process. All imports and references were verified to be absent from the active codebase.

## Restoration

To restore the legacy hero implementation:
1. `git mv` the files back to their original locations under `components/home/`
2. Update any imports that may have been changed to point to the restored files
3. Test the hero functionality to ensure it works as expected

## Related Files

Originally located at:
- `components/home/hero-split.tsx`
- `components/home/heroSlideRenderer.tsx`
- `components/home/slides/*` (directory)
