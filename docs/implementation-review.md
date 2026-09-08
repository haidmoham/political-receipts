# Runtime release review

This file lists the remaining checks for the Chrome extension. It does not certify a completed Chrome test or store submission.

## Verified locally

Focused jsdom tests reproduce and cover changed-name attribution, page-edited identity attributes, keyboard return from receipt cards, and scanner stop/restart. Core tests check name boundaries, ambiguous aliases, source-link restrictions, missing values, and the committee-share denominator. These checks do not exercise Chrome extension APIs or browser layout.

## Required Chrome checks

- Load the final unpacked build in Chrome. Confirm the manifest and service worker have no errors. Test the packaged ZIP after extraction as well.
- Use a normal article with supported full names. Confirm manual scanning, hover, keyboard focus, source navigation, removal, repeated scans, and dynamic text changes.
- Grant automatic highlighting for one site. Reload and restart Chrome. Confirm scanning persists only on that selected site. Test permission denial, toggle-off, and revocation from Chrome settings. Confirm the popup reflects actual permission and registration state.
- Test restricted pages, inaccessible tabs, and a tab that navigates while the popup is open. Confirm useful feedback and no leftover permission after a failed registration.
- Check the card at narrow widths, near each viewport edge, at 200% zoom, and on a long page. Verify legible text, portrait loading, scrolling, and the black/red design on both light and dark host pages.
- Navigate by keyboard only. Confirm Escape and Close restore focus. Confirm card boundaries return to the reading position. Check the name and dialog announcement with a screen reader.
- Inspect the network panel during page scanning, hover, lookup, and automatic highlighting. Confirm no remote request occurs until an explicit external source link is opened. Confirm portrait requests use bundled extension resources.
- Use pages with strong global CSS and changing DOM content. Confirm the card stays readable and names retain the correct identity. Check that editable fields and existing links are not changed.
- Inspect a positive amount, reported zero, missing data, and a share below 1%. Confirm no nonzero amount appears as zero. Confirm each reporting period and source link belongs to that record.
- Open the local comparison from an injected card. Confirm the bundled portrait and web-accessible comparison page load. Change the candidate. Test differing reporting periods, missing finance, no supported candidate match, and a regular Senate seat not up this cycle.

## Evidence and release limits

Committee share is the proportion of the three displayed contribution categories reported as other political committee contributions. It is not a rating of integrity or a measure of corporate or lobbyist funding. The total-receipts figure has a different denominator. Keep these definitions visible in the final product.

The local comparison uses FEC registrations for the same seat and election year. It can include primary and withdrawn candidates. It is not a confirmed ballot list. Campaign periods can differ; retain the warning and both periods. Ambiguous seat matches are withheld. Three member records have jurisdiction-only policy context. None of these records establishes donor influence. A browser demo is not proof that the extension loaded or that permissions work.

Before submission, reconcile the final UI, store listing, privacy policy, manifest, and screenshot assets. Confirm the shin86dev publisher identity in the live dashboard. Let the user vet the concrete release. Public contact and privacy-policy URLs must work before the store submission.
