# Project Conventions

- Use React, TypeScript, local assets and the existing CSS. No backend or AI API
  is needed for the current app. Keep child-facing text in Cantonese Traditional Chinese.
- Preserve stable object IDs, derive totals from objects, and retain undo history.
  Ten-frames must have exactly two rows of five cells. Exchanges conserve quantity.
- Keep arithmetic within each activity's finite bounds; no negative results or hundreds.
- Distinguish modeled, assisted and independent observations. Report unsuccessful
  checks through GameActions; never infer spoken ability or diagnosis from clicks.
- Do not reveal independent answers through readouts or speech. Never substitute
  another Chinese voice when zh-HK is unavailable.
- Keep records local, minimal and versioned. Handle unavailable storage without
  blocking play. Do not add identity fields, telemetry, scores or activity locks.
- Reuse Vitest game tests and Playwright acceptance tests. Validate focused changes,
  then run build and lint. Check desktop, tablet and mobile layouts and touch targets.
- Document unfinished plan features honestly in README.md. Browser simulation does
  not replace testing Cantonese speech and touch on a real iPad.