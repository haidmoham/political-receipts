# Chrome Web Store listing draft

Status: Draft for user review. Match all claims to the final package before submission.

**Name:** Receipts — Money in Politics

**Publisher:** shin86dev (requested identity; verify in the developer dashboard)

**Language:** English
**Short description:** See sourced campaign finance totals when you hover over a member of Congress on the page you choose to scan.

## Detailed description

Put the campaign finance record beside the name.

The people making decisions that affect your life also raise campaign money. Receipts makes the reported money easier to inspect while you read.

Receipts finds supported members of Congress on the page you choose to scan. Hover over a marked name, or focus it with your keyboard, to see their identity and reported campaign finance totals.

- See reported contributions from other political committees on a compact card. Expand it for individual contributions, party committee contributions, total receipts, and definitions.
- Check the reporting period beside the figures.
- Open the original source to inspect the record.
- Process page text on your device. No account, analytics, or page uploads.
- Find a member by name, state, or party in the popup.
- Enable “Always on this site” for automatic highlighting on a site you choose.
- Compare a member with FEC-registered candidates for the same seat and year where the snapshot supports a match. Registrations can include primary and withdrawn candidates. They are not a confirmed ballot list.

Click the extension, then choose “Find receipts on this page.” Automatic highlighting is off until you enable it for a site and grant access. Receipts uses a bundled public-data snapshot. It does not fetch live campaign totals. Coverage and freshness depend on that snapshot. Name matching can miss people or match the wrong person; check the full identity before using a figure. Names inside links and editable fields are skipped.

Reported campaign receipts are money received by campaign committees. They are not a politician’s personal income. Committee contributions do not establish corporate funding, a policy position, or wrongdoing. Receipts does not assign an integrity score or connect donors to votes, issues, or policy outcomes.

Three member records include source-linked committee responsibilities and jurisdiction. This explains the policy areas within their public roles. It does not establish donor influence. Comparison pages show each campaign's reporting period and warn when periods differ. Some races are withheld because the seat match is uncertain or a regular Senate election is not due this cycle.

Receipts is an independent project by shin86dev. It is not affiliated with the FEC, Congress, or Integrity Index.

## Dashboard privacy text

**Single purpose:** Show sourced campaign finance information for supported members of Congress through page highlighting, member lookup, and comparisons with registered candidates for the same seat.

**activeTab justification:** Provide temporary access to the active page after the user invokes the extension so it can find supported names there.

**scripting justification:** Insert the bundled matcher and receipt cards after the user chooses to scan. Register the same scripts for future pages on a site only after the user enables automatic highlighting and grants site access.

**Optional host permissions justification:** Support “Always on this site” on HTTP or HTTPS sites selected by the user. Each request targets the current hostname and scheme. Chrome match patterns cover all ports for that hostname and scheme. Users can disable this feature for that site. No required host permission grants access to every site at installation.

**Remote code:** No. All executable code is included in the extension package. Verify the release ZIP.

**Data handling:** Website content is processed locally to find names and display cards. The extension does not transmit page text to its publisher. The current URL is read locally to display the site and scope its permission request. Chrome retains site grants and script registrations. Member search text stays in the popup. Declare website-content and browsing-activity handling consistently with these local uses. Local processing still requires disclosure under the [Chrome user-data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

There is no separate extension settings database.

**Web-accessible resources:** Bundled public portraits can appear in injected cards. The local comparison page can open from a card link. These resources are accessible from HTTP and HTTPS pages; they do not grant page-reading access or send browsing data to the publisher.

## Reviewer test instructions

No account or credentials are required.

1. Install the submitted extension.
2. Open an ordinary HTTPS page with a supported member’s full name, such as Ted Cruz. Check that the member exists in the submitted data snapshot first.
3. Open Receipts from the Chrome toolbar. Choose “Find receipts on this page.”
4. Hover over the marked name. Confirm that the card shows identity, source, reporting period, and finance totals.
5. Repeat with keyboard focus. Open the source link and confirm the referenced record.
6. Test an unrelated page and a page where extension injection is restricted. Confirm that the result is clear and no uncaught error occurs.
7. Enable “Always on this site.” Grant site access. Reload and confirm automatic highlighting. Disable it and reload to confirm automatic highlighting stops.
8. Select “Remove highlights from this page.” Confirm marks disappear. Search for a member in the popup and open the local receipt page.
9. Open a comparison for a supported 2026 race. Change the registered candidate. Check the registration notice, period warning, missing values, and FEC links. Check a Senate member whose regular seat is not up this cycle.

## Links to supply

- Public privacy policy URL: pending publication.
- Support URL: pending verified repository or support destination.
- Homepage: optional; pending user-approved destination.
- Category: select the closest available research/reference category in the live dashboard.

The dashboard requires a clear purpose, permission reasons, and consistent privacy declarations. See [privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy). Listing fields are described in [complete your listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).
