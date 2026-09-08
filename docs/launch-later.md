# Launch later

The owner approved the restrained player-card design and authorized Chrome testing on September 8, 2026. The owner then requested public source publication and deferred the store launch.

## Preserved decisions

- Keep the default card compact: identity, portrait, one clearly labeled funding amount, and a race comparison action.
- Use readable type, neutral surfaces, and restrained red. Keep the sports-card structure without heavy protest-poster styling.
- Expand definitions and extra statistics on demand.
- Apply the same funding definitions to all parties. A reported zero is specific to its category and period. It is not a moral rating.
- Keep corporate and lobbyist totals unavailable until amendment and refund reconciliation supports them. `data/corporate-pac.json` is research evidence, not a runtime total.
- Race comparison shows FEC registrants, not confirmed ballot opponents. Show each reporting period and withhold ambiguous races.

## Resume

1. Install dependencies with `npm ci`. Run `npm test`, `npm run build`, and `npm run validate:package`.
2. Check snapshot dates. Refresh and validate the data before a later release. Review any changed values and race eligibility.
3. Load `dist` in Chrome as an unpacked extension. Test manual scanning, keyboard navigation, dynamic pages, repeated scans, site grants, revocation, portraits, and comparison links. Check restricted-page errors and network behavior.
4. Capture actual Chrome screenshots. The store promo and icon are in `store-assets`; they do not substitute for extension screenshots.
5. Sign into the Chrome Web Store developer dashboard. Verify the **shin86dev** publisher identity. GitHub account ownership does not prove store publisher ownership.
6. Publish the reviewed privacy policy at a stable URL. The repository issue tracker can serve as the support destination. Review the listing and privacy declarations in `docs`.
7. Package the validated `dist` contents with `manifest.json` at the ZIP root. Obtain the owner's review of final screenshots, listing, and limitations before submission.
8. Submit for review. Verify the public listing after approval. Public source code alone is not a store launch.

The latest local checks passed 18 tests and package validation. They include DOM and mocked extension API tests. Actual Chrome extension behavior was not verified because Chrome was not connected to the testing tool. The publisher dashboard was signed out. Do not report those gates as passed.

Before using a custom subdomain, obtain the owner's choice of `shin86.dev` or `mhaider.dev` and the exact subdomain. No custom-domain destination has been selected.
