# Portrait provenance

These JPEGs come from the [unitedstates/images project](https://github.com/unitedstates/images), keyed by congressional bioguide ID. The project documents its images as public domain. Its README identifies the Government Publishing Office as its portrait source and links a [record of GPO's public-domain assurance](https://github.com/propublica/sunlight-congress/issues/432). The repository accepts contributed images only with an official public-domain basis. Project contributions use [CC0-1.0](https://github.com/unitedstates/images/blob/gh-pages/LICENSE).

Each file preserves the bytes served by the project's 225x275 JPEG endpoint. No retouching, background removal, or other transformation was applied. A portrait can predate the current congressional term.

`data/portraits.json` records each source URL, local path, SHA-256 hash, dimensions, and retrieval time. Missing portraits have a null path. Use initials or another local fallback for them.

Run `node scripts/data-portraits.mjs` to refresh from the source with six concurrent requests. Run `node scripts/data-portraits.mjs --offline` to verify all available images against their saved hashes and dimensions. The refresh makes network requests during development. The extension must use bundled files and make no portrait requests while a user reads a page.
