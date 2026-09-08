# Same-race comparisons

`races.json` supports a lightweight comparison with other FEC-registered candidates. It does not identify confirmed general-election opponents.

The [FEC candidate master](https://www.fec.gov/campaign-finance-data/candidate-master-file-description/) includes candidates from different election years and statuses. The importer requires election year 2026 and statutory-candidate status C. It matches office, state, and House district. It requires one matching incumbent record and excludes the incumbent's own IDs. Records with a shared principal committee are omitted because they can duplicate an identity.

The current roster supplies Senate class information. Only regular class 2 seats are considered for 2026. States with appointed senators or current senators registered outside the regular class are withheld because the master file has no Senate seat identifier. This conservative rule can omit valid comparisons.

An FEC registration can remain after withdrawal or a primary loss. Do not label these records as confirmed ballot opponents. A missing comparison does not establish that an election is uncontested. Current ballot qualification requires state election-office evidence.

Candidate finance fields use the bundled all-candidate summary and the same meanings as `politicians.json`. Coverage end dates can differ. Receipts include more than donations. Other committee contributions are not corporate-only or lobbyist-only totals. The data does not support a corruption grade.

Run `node scripts/data-races.mjs` to fetch the current master and rebuild against the bundled finance snapshot. Use `--candidate-master PATH_TO_CN26_ZIP` to rebuild from a retained source archive. Source hashes identify both archives. `--offline` validates the saved mapping and null rules without refreshing data. The importer does not save addresses from the candidate master.

FEC election-directory URL structures were verified against [NY House district 14](https://www.fec.gov/data/elections/house/NY/14/2026/) and [Louisiana Senate](https://www.fec.gov/data/elections/senate/LA/2026/). Those directories are fallback links, not additional ballot-status evidence.
