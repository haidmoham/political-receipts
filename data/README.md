# Data provenance

`politicians.json` is the extension data contract. All amounts are USD numbers. Null means unavailable. `finance.receipts` is total reported campaign receipts. It is not personal income, and it includes more than donations. `finance.otherCommitteeContributions` is the FEC field `OTHER_POL_CMTE_CONTRIB`. It must not be labeled corporate money or lobbyist money.

Run `node scripts/data-import.mjs` from the repository root to download and rebuild. Run `node scripts/data-import.mjs --offline` to reproduce the snapshot from the checked-in source files and retrieval timestamp. The importer uses Node built-ins. It needs no API key. SHA-256 source hashes are in `meta.sources`.

The [FEC all candidates dictionary](https://www.fec.gov/campaign-finance-data/all-candidates-file-description/) defines the fields. The snapshot uses the 2025–2026 file. Coverage dates differ by candidate. The cycle start is January 1, 2025. The FEC warns that transfers between a candidate's authorized committees can duplicate financial activity. We preserve raw reported totals and include both transfer fields.

The [congress-legislators roster](https://github.com/unitedstates/congress-legislators) supplies names, identifiers, and terms under CC0-1.0. This is a community dataset. It can lag changes in office. The importer selects records whose last term covers the retrieval date. It uses exact FEC IDs and current office/state, with no fuzzy identity matching. Ambiguous IDs and missing summaries produce unavailable fields. The roster includes territorial delegates.

`party-comparison.json` compares only the most common exact coverage end date. House and Senate cohorts are separate. It includes group sizes, means, medians, totals, and member IDs. This selection is not representative of all politicians. It cannot support a claim about which party is more corrupt.

## Corporate and lobbyist data boundary

The baseline does not supply a corporate-only or lobbyist-only measure. A zero in other committee contributions does not prove no lobbyist money.

A later corporate PAC measure can join candidate contribution transactions to [committee master](https://www.fec.gov/campaign-finance-data/committee-master-file-description/) organization types. Type C means corporation; W means corporation without capital stock; trade associations are separate. This requires transaction deduplication, amendment handling, date filtering, candidate committee mapping, and explicit treatment of refunds. A registered corporate PAC contribution is still not a direct corporate treasury contribution.

[Form 3L](https://www.fec.gov/help-candidates-and-committees/lobbyist-bundling-disclosure/) reports certain lobbyist-bundled contributions. It has reporting thresholds and overlapping reporting periods. Missing reports do not establish zero lobbyist money. A complete measure cannot be derived from the candidate summary alone.

## Intentional omissions

No integrity grades, donor rankings, stock trades, independent expenditures, or corporate-only totals are inferred. Full-name aliases reduce false positives but cannot prove that a name on a page refers to the politician.
