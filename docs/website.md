# Receipts website

The public web viewer belongs at https://receipts.mhaider.dev/.
Member lookup is the entry point. Cards and candidate comparisons use the same dated public snapshot as the extension. The website does not install the extension.

Run `npm run build:site` to build the extension and the separate static website output. Vercel builds from the repository root and publishes only `out`, as configured in `vercel.json`. The existing Sites configuration remains unchanged.

The website output excludes the extension manifest, background worker, popup, and raw evidence files. Runtime records and portraits are bundled. Lookup stays in the browser; explicit source links visit FEC or Senate websites.

Website publication does not publish the Chrome extension or RuneLite plugin. The remaining Chrome release requirements stay in issue #1 and `docs/launch-later.md`.
