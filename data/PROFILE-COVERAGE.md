# Evidence-only profile review

Finance is unchanged from the September 8, 2026 snapshot: 539 members, 532 summaries, seven missing summaries. The web viewer headlines `finance.receipts` / FEC `TTL_RECEIPTS`, labeled **Total reported receipts**. It is a candidate-row summary combining authorized committees, includes loans/transfers and may double count intercommittee transfers. No transfer subtraction or sum across candidates. Contribution categories are `TTL_INDIV_CONTRIB`, `OTHER_POL_CMTE_CONTRIB`, and `POL_PTY_CONTRIB`; they are not an exhaustive reconciliation of receipts.

Donor-size split is unavailable. The source has no itemized/unitemized split; those labels would not establish large/small gifts anyway. Lobbyist contributions and bundling are unavailable. PAC money is never a proxy. Future LD203/Form 3L ingestion requires distinct coverage, amendment reconciliation, identity matching and overlap deduplication.

Votes: official House roll call 190, 119th Congress, first session, July 3, 2025; H.R. 1 motion to concur in the Senate amendment. `public-records.json` joins exact Bioguide ID, House chamber and state against the fixed roster. 424 matches from 432 recorded members; unmatched identities are excluded. One selected vote, no Senate coverage or complete voting history. A vote on a motion does not establish support for every provision.

Investments: official House PTR document 20026590, filed January 17, 2025, Nancy Pelosi CA11, manually matched to roster P000197. Official 2025 disclosure index identifies the filer/district/document; its URL is https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2025FD.ZIP. All nine rows were transcribed and both PDF pages visually checked. Every owner code is SP (spouse), not the member. Stock and call options stay distinct. The seven purchase entries include two option exercises; four stock entries include two partial sales. Reported dollar ranges are preserved, not summed or converted to midpoint values. Row six spans both pages. Notification dates match transaction dates. Row IDs use document plus source row.

This is one selected original report; later filings and amendments are not reconciled. It is not current holdings, net worth, profits or a complete history. Owner codes follow the official House instruction guide: https://ethics.house.gov/wp-content/uploads/2025/04/Final-Instruction-Guide-2024.pdf.

Raw XML and PDF are preserved under `data/evidence/`; SHA256 hashes accompany their source URLs in `public-records.json`. Funding/votes/disclosures retain separate reporting dates. No predictions, causal links, motive judgments or misconduct scores. Extension card behavior is unchanged; this review applies to the web profile.


Unsupported donor-size and lobbyist categories are omitted from the main profile. Vote/investment sections render only with matched evidence. The compact coverage disclosure identifies exclusions and makes clear that omission does not establish zero. Missing finance keeps a single explicit unavailable state rather than a ledger of unavailable amounts.
