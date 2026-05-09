# Sky UI Refresh Plan

## Scope

Rebuild the frontend visual language across the shared layout, home page, resource detail, login, register, upload, profile, and not found pages into a light "blue sky and white cloud" experience without changing backend behavior or route structure.

## Files In Scope

- `frontend/src/App.tsx`
- `frontend/src/style/index.css`
- `frontend/src/components/common/brand-mark.tsx`
- `frontend/src/components/common/empty-state.tsx`
- `frontend/src/components/layout/app-layout.tsx`
- `frontend/src/components/resource/file-preview.tsx`
- `frontend/src/components/resource/resource-filters.tsx`
- `frontend/src/components/resource/resource-table.tsx`
- `frontend/src/pages/home-page.tsx`
- `frontend/src/pages/login-page.tsx`
- `frontend/src/pages/register-page.tsx`
- `frontend/src/pages/upload-page.tsx`
- `frontend/src/pages/profile-page.tsx`
- `frontend/src/pages/resource-detail-page.tsx`
- `frontend/src/pages/not-found-page.tsx`

## Task 1: Theme Tokens And Shared Surfaces

- Exact files:
  `frontend/src/App.tsx`, `frontend/src/style/index.css`, `frontend/src/components/common/brand-mark.tsx`, `frontend/src/components/common/empty-state.tsx`
- Failing test:
  No UI automation suite is present; use a production build as the safety gate after visual-token changes.
- Command to run and expected failure:
  `cmd /d /c npm run build` from `frontend`
  Expect no functional regressions once the new tokens are applied.
- Minimal implementation:
  Move the Mantine theme to a sky-blue primary palette, brighten typography contrast, define reusable cloud-like surfaces and button styles, and update the brand mark plus empty state to match the new tone.
- Command to verify success:
  `cmd /d /c npm run build`
- Commit step:
  Stage the shared-theme files after build passes.

## Task 2: App Shell And Home Experience

- Exact files:
  `frontend/src/components/layout/app-layout.tsx`, `frontend/src/components/resource/resource-filters.tsx`, `frontend/src/components/resource/resource-table.tsx`, `frontend/src/pages/home-page.tsx`
- Failing test:
  No route-level visual tests exist; use build verification after implementing the shell and marketplace refresh.
- Command to run and expected failure:
  `cmd /d /c npm run build` from `frontend`
  Expect a clean build if the refreshed shell and list UI keep all imports and props aligned.
- Minimal implementation:
  Rebuild the app chrome with airy gradients, translucent navigation, and clearer CTA hierarchy. Refresh the home hero, metrics, filters, and resource table into a calmer blue-and-white presentation.
- Command to verify success:
  `cmd /d /c npm run build`
- Commit step:
  Stage the shell and marketplace files after build passes.

## Task 3: Secondary Pages And Detail View

- Exact files:
  `frontend/src/components/resource/file-preview.tsx`, `frontend/src/pages/resource-detail-page.tsx`, `frontend/src/pages/login-page.tsx`, `frontend/src/pages/register-page.tsx`, `frontend/src/pages/upload-page.tsx`, `frontend/src/pages/profile-page.tsx`, `frontend/src/pages/not-found-page.tsx`
- Failing test:
  No page-level UI tests exist; use build verification after the page refresh.
- Command to run and expected failure:
  `cmd /d /c npm run build` from `frontend`
  Expect a clean build if all page components still satisfy the existing route and API contracts.
- Minimal implementation:
  Bring the auth, upload, profile, detail, and 404 flows into the same sky-themed system with consistent cards, cloud motifs, supportive copy, and cleaner information hierarchy.
- Command to verify success:
  `cmd /d /c npm run build`
- Commit step:
  Stage the refreshed page files after build passes.
