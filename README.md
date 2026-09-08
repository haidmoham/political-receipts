# Receipts

A small Chrome extension by **shin86dev**. Hover or focus a supported member of Congress to see a campaign finance card. Compare FEC-registered candidates for the same seat.

This is a review build. It has not been submitted to the Chrome Web Store.

Source publication is complete when this repository is public. Store launch is deliberately deferred. See [launch later](docs/launch-later.md) for the remaining steps. The [RuneLite companion](https://github.com/haidmoham/political-receipts-runelite) is a separate project.

## Run

Use Node 22 or newer.

```powershell
npm ci
npm run build
npm test
npm run preview
```

Open `http://127.0.0.1:4178/demo.html` to inspect the actual content script on a local demonstration article.

To test the real extension, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this repository's `dist` directory. Open a normal web article. Click the extension and select **Find receipts on this page**. Names inside links and editable controls are excluded. Full names must occur within a single text node. Up to 1,500 matches are highlighted per page.

**Always on this site** requests optional access for the current scheme and hostname. Chrome match patterns cover all ports for that host. Turn it off to stop the current page. Reload other open pages on the site to stop already injected scripts there. Chrome settings and store pages cannot be scanned.

## What the card means

- The main amount is FEC **contributions from other political committees**. It is not a corporate-only or lobbyist total.
- Green means reported zero in this category and period. Missing data stays unknown. No moral rating is assigned.
- Committee share uses individual + other political committee + party committee contributions as its denominator. It appears only in the expanded definitions.
- A committee role and its jurisdiction can establish where public power touches daily life. They do not prove that a donor caused an action.
- Comparison candidates are FEC registrations. They can include primary or withdrawn candidates. They are not confirmed ballot opponents.

The supplied data contain 539 roster members, 532 available finance records, 524 local portraits, and comparison registrants for 429 members. Snapshot dates and reporting periods are visible. Sources and reproduction commands are in `data/README.md`, `data/portraits/README.md`, and `data/races.md`.

## Privacy

No accounts, analytics, remote code, or runtime API requests. Name matching and search stay local. Public portraits ship with the extension. The race dataset loads only on the comparison page. Explicit source links navigate to FEC or Senate websites.

Permissions: `activeTab`, `scripting`, and optional HTTP/HTTPS host access. Public portrait JPEGs and the comparison page are web-accessible so the card can display portraits and open comparison from a web page. Chrome stores registered site scripts; there is no application storage database.

## Verification and publication

`npm test` checks matching, missing data, share arithmetic, hostile page mutations, keyboard boundaries, lifecycle cleanup, and race eligibility. `npm run build` prepares the unpacked extension. DOM checks do not substitute for Chrome extension testing.

Store listing, privacy draft, review checklist, and release gates are in `docs/`. The user must vet the working design and behavior before submission. The shin86dev publisher identity, public support/policy URLs, and actual Chrome behavior remain release requirements.

## Design

An original compact sports-card structure with a grayscale portrait, clear sans-serif type, neutral surfaces, and a restrained red funding amount. The default card has one amount and one comparison action. Details stay collapsed.

No band or game logos or artwork are used. Public portraits remain unmodified files; CSS applies the visual treatment. This project is not affiliated with Integrity Index, EA, FIFA, or a political party.
