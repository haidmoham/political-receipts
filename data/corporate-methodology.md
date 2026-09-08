# Corporate-connected PAC evidence

This file is an evidence index. It is not a verified money total. The importer leaves gross and net totals null for every member. It does not issue a no-corporate-money or no-lobbyist-money certificate.

## Sources and scope

The source archives are FEC `pas226.zip`, `cm26.zip`, and `ccl26.zip`. Their download URLs, sizes, and SHA-256 hashes are in `corporate-pac.json`.

The [committee master dictionary](https://www.fec.gov/campaign-finance-data/committee-master-file-description/) distinguishes organization type C (corporation) and W (corporation without capital stock). Trade associations and labor organizations have separate codes. This importer requires C or W and [PAC committee type N or Q](https://www.fec.gov/campaign-finance-data/committee-type-code-descriptions/). The classification describes the committee in this snapshot. It is not verified as of every transaction date.

The [PAS2 dictionary](https://www.fec.gov/campaign-finance-data/contributions-committees-candidates-file-description/) includes independent expenditures alongside contributions. This importer selects only [transaction type 24K](https://www.fec.gov/campaign-finance-data/transaction-type-code-descriptions/), which denotes contributions to nonaffiliated committees. It also requires the recipient committee to have a [2026 active-cycle linkage](https://www.fec.gov/campaign-finance-data/candidate-committee-linkage-file-description/) to the candidate with authorized or principal designation. The candidate ID must match a member's current-office FEC ID.

Only positive records with no memo code or memo text are selected. Dates must fall between January 1, 2025 and that member's baseline financial coverage end date. Missing coverage prevents examples from being selected. These deliberate restrictions make the index incomplete.

## Why sums are not published

The public dictionary defines a transaction ID as unique to a committee and report, with reuse across report amendments. It does not provide an amendment-chain identifier in this archive. Selecting the largest file number for each committee and transaction would not establish complete report replacement or resolve deleted transactions. The importer therefore does not pretend to reconcile amendments.

Exact repeated FEC row IDs are checked for identical content and counted only once. Transaction keys that recur within a report or across reports are excluded from examples. This conservative choice can remove legitimate recurring transactions. It is not a complete deduplication method for totals.

Refunds, negative entries, memo allocations, reporting lags, and recipient-side receipt reconciliation are unresolved. A gross sum of selected positive rows would not be a verified amount accepted by the candidate. Net and gross fields therefore remain null. A lack of selected rows cannot prove zero funding.

## Display contract

Join `members[].memberId` to the baseline bioguide ID. Each member has up to ten donor committees in alphabetical order, not ordered by money. Each donor has its official name, connected organization, classification, source link, and one dated report example with amount and identifiers. The source image link opens the underlying disclosed page. The example amount is a reported transaction, not a donor's cycle total.

Use wording such as “Corporate-connected PAC records found” with the evidence link. Keep the unverified-total note visible. Do not convert `no-matching-records-total-unverified` into a green “no corporate money” badge. Do not use other-committee contribution totals as a replacement corporate or lobbyist measure.

To publish reliable cycle totals, add report-chain reconciliation with complete replacement semantics, refund treatment, memo attribution, recipient-side cross-checks, and a documented historical classification policy. To establish lobbyist funding, add the separate lobbyist/registrant and bundling disclosures with their thresholds and coverage limits.

Run `node scripts/data-corporate-pac.mjs` to refresh. `--source-dir DIR` uses retained archives for reproduction. `--offline` validates the saved index without downloading. No source archives or personal addresses are copied into the output.
