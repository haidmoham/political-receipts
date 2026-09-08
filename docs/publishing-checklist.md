# Chrome Web Store release checklist

Prepared 2026-09-08. This is a submission plan, not evidence of publication.

## Release package

- [ ] Verify the final manifest and package contents. Keep only permissions required by shipped features.
- [ ] Verify finance values, reporting periods, source links, identity matching, and snapshot dates against the bundled data.
- [ ] Verify hover, keyboard focus, dismissal, page layout, repeated scans, and restricted-page behavior in Chrome.
- [ ] Inspect network behavior during a scan. Confirm no page upload, analytics, or remote code.
- [ ] Confirm no unused storage permission remains in the packaged manifest. Site choices use Chrome permissions and persistent script registrations.
- [ ] Test automatic site scanning, per-site grants, permission denial, and revocation. Confirm disclosure of local page text, current URL, and retained site grants.
- [ ] Check bundled portrait and comparison resource access from injected cards. Confirm comparison registration notices, period warnings, withheld races, and source links.
- [ ] Check the release ZIP contains the manifest at its root and excludes development files and credentials.

## Store assets and public documents

- [ ] Provide the packaged 128×128 PNG icon.
- [ ] Provide a 440×280 promotional image.
- [ ] Capture at least one 1280×800 screenshot of the actual Chrome extension. A demo mockup is insufficient proof of extension behavior. Up to five screenshots are supported. A marquee image and video are optional. See [Chrome image requirements](https://developer.chrome.com/docs/webstore/images).
- [ ] Publish the verified privacy policy at a stable public URL.
- [ ] Confirm a working support destination. A verified public repository issue tracker is acceptable as the project’s chosen support channel; do not invent its URL.
- [ ] Complete name, description, language, category, and distribution fields. See [listing documentation](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).

## Identity and review

- [ ] Let the user vet the working extension, screenshots, listing, and data limitations.
- [ ] Verify the signed-in developer account and requested shin86dev publisher identity in the live dashboard.
- [ ] Complete any account registration and required verification. Chrome requires developer registration and a one-time registration fee. See [register your account](https://developer.chrome.com/docs/webstore/register). Do not invent account or payment details.
- [ ] Upload the reviewed ZIP as a draft. Fill in privacy fields, permission reasons, and reviewer test steps.
- [ ] Disclose local website-content handling. Do not select a blanket “no user data” statement solely because there is no server. See [Chrome user-data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).
- [ ] Obtain the user’s approval of the concrete release before submission/publication, as requested for this project.
- [ ] Submit for review. Use deferred publication if a separate final release check is needed. A reviewed deferred submission must be published within 30 days or reviewed again. See [publication workflow](https://developer.chrome.com/docs/webstore/publish).
- [ ] After Google approves and the user-approved publication action succeeds, verify the public listing and record its URL and release version.

## Current blockers

The Chrome browser connection is unavailable in the current CUA session. The signed-in publisher identity, dashboard state, and live extension behavior are unverified. The user has requested a review before release. Public policy and support URLs are not yet established. Store review and approval depend on Google.

No custom domain is selected. Before deploying to a custom subdomain, obtain the user’s choice of shin86.dev or mhaider.dev and the exact subdomain, as required by the user’s standing instruction.
