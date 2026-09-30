# Evidence-first review

The bundled records are a dated snapshot. They are not live campaign totals.

Cards display the retrieval date before expansion. Missing summaries display the importer's reason. The expanded ledger links seven money fields to the FEC dictionary. Contributions, total receipts, cash balances, and transfers keep separate definitions. Zero uses the same amount color as a positive value; the label carries the distinction.

Lookup starts with the alphabetical snapshot roster. Search accepts names, aliases, state abbreviations, and chambers. Pagination makes all 539 records reachable. New results receive keyboard focus after pagination. Search results show coverage end dates or an unavailable-summary label. Invalid receipt IDs link back to lookup. Candidate comparison displays both finance and registration retrieval dates. Registrants are not labeled confirmed opponents.

## Verification

- All 23 Node/jsdom tests pass. Tests cover missing and partial summaries, escaped failure reasons, invalid dates, all-member pagination, focus, recovery navigation, name matching, scanner mutation/cleanup, permission feedback, and comparisons.
- `npm run build:site` and `npm run validate:package` pass.
- `node scripts/data-import.mjs --offline` reproduces `politicians.json` and `party-comparison.json` byte-for-byte. The source hashes and September 8 retrieval dates remain unchanged.
- Isolated headless Chromium checks the public lookup, receipt ledger, missing-record recovery, comparison dates, and demo scanner. Runtime artifacts are local under `artifacts/`.

## Remaining release gates

The snapshot is not refreshed in this change. Coverage dates vary by candidate. Seven roster members have no available finance summary. Corporate-only and lobbyist-only totals remain unavailable.

The browser demo exercises the content script without Chrome extension APIs. Real unpacked-extension permission persistence, revocation, service-worker behavior, screen-reader announcements, and store package review remain in `implementation-review.md`. No store submission, main merge, or production website change is part of this review branch.
