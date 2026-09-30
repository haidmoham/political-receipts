# Receipts website

The public web viewer belongs at https://receipts.mhaider.dev/.
Member lookup is the entry point. Cards and candidate comparisons use the same dated public snapshot as the extension. The website does not install the extension.

Run `npm run build:site` to build the extension and the separate static website output. Vercel builds from the repository root and publishes only `out`, as configured in `vercel.json`. The existing Sites configuration remains unchanged.

The website output excludes the extension manifest, background worker, popup, and raw evidence files. Runtime records and portraits are bundled. Lookup stays in the browser; explicit source links visit FEC or Senate websites.

Website publication does not publish the Chrome extension or RuneLite plugin. The remaining Chrome release requirements stay in issue #1 and `docs/launch-later.md`.

## Public viewer design

The viewer uses a neutral ink-and-paper ledger identity. It borrows the portfolio's sans-serif typography, generous spacing, compact navigation, and ruled hierarchy without copying its project colors or branding. The portfolio source and live stylesheet were inspected before this change; the portfolio itself is unchanged.

Party affiliation appears as a small marker beside a visible party name in the index, member metadata, and comparison cards. Democrat and Republican markers use blue and rust-red; independent, other, and unknown affiliations use a neutral outlined marker. Page surfaces and all financial amounts stay neutral. Markers do not encode a funding assessment or moral judgment.

Existing `receipt.html?id=<member-id>` and `compare.html?id=<member-id>` deep links remain stable. Website comparison navigation stays in the current tab; extension cards keep their separate-tab behavior. Reporting periods, snapshot dates, missing summaries, source links, and ballot-status limitations remain explicit.
