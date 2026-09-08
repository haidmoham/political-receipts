# Receipts privacy policy

Release-review draft for version 0.1.0. Public contact destination and publication date are pending.

Receipts — Money in Politics is published under the requested identity shin86dev.

## What the extension handles

When you select “Find receipts on this page,” Receipts reads page text on your device to identify supported members of Congress. It marks names and displays campaign finance cards. If you enable “Always on this site” and grant site access, it performs the same local scan on future pages on that site. The extension does not send page text or matched names to the publisher or an external service.

Receipts uses a public-data snapshot included in the extension package. This contains public congressional identity information and reported FEC campaign finance figures. It is not data collected from your browsing.

Public portraits, committee-jurisdiction notes, and registered-candidate comparison records are also bundled. Member and comparison selections are handled locally. Opening an extension receipt or comparison page includes its member identifier in that local page URL. The extension does not maintain a separate selection history.

The popup reads the active tab URL to display the current site and request access to that site. Chrome retains granted site permissions and registered scripts across browser sessions so automatic highlighting can work. Member search text is processed in the popup. It is not sent to an external service. Receipts does not use a separate extension settings database.

## Retention and sharing

Receipts does not keep a history of scanned pages or send browsing activity to the publisher. Page scanning results remain in the current page session. Search text remains in the popup session. Site grants and script registrations remain until you disable automatic highlighting for that site, revoke its access in Chrome, or remove the extension.

Receipts has no analytics, advertising, tracking pixels, or user accounts. The publisher does not sell or transfer page content. The extension does not use page content for advertising, profiling, or credit decisions. The publisher cannot read the text processed locally by the extension.

## Source links

Bundled public portraits and the local comparison page are accessible from ordinary web pages so cards can display portraits and open comparisons. These extension resources do not contain your page text or search text.

When you select a source link, your browser visits that external website. That website receives the normal information associated with your visit and applies its own privacy policy. The extension does not upload the scanned page to that website.

## Permissions

- `activeTab` provides temporary access to the page after you invoke the extension.
- `scripting` inserts the bundled matcher and cards. It also registers scripts for sites where you enable automatic highlighting.
- Optional HTTP and HTTPS host permissions allow you to enable automatic highlighting for a specific site. Each request targets the current hostname and scheme. Chrome match patterns include all ports for that hostname and scheme.

## Your controls

Manual scanning is available without enabling automatic highlighting. Select “Remove highlights from this page” to stop scanning and remove its marks from the current page. Turn “Always on this site” off to remove its script registration and site permission and stop the current tab's scan. Reload other open pages on that site to stop their existing scans. You can also revoke site access or remove the extension in Chrome. After revoking access in Chrome settings, reload affected pages to remove existing injected scripts.

## Limited Use

Receipts uses information obtained through Chrome permissions only to provide its disclosed campaign finance lookup feature. Its use of this information complies with the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Contact and changes

A verified support destination must be added here before release. Do not publish this draft with an unverified email address or repository URL. The publisher will update this policy when the extension’s data handling changes.
