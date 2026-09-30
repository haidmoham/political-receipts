# Bounded public-record breadth review

Finance remains the September 8, 2026 snapshot: 539 members, 532 summaries, seven missing. The web viewer headlines FEC `TTL_RECEIPTS` as **Total reported receipts**, combining authorized committees; includes loans/transfers and can double count intercommittee transfers. No transfer subtraction or aggregation across candidates. Contribution fields remain `TTL_INDIV_CONTRIB`, `OTHER_POL_CMTE_CONTRIB`, `POL_PTY_CONTRIB`. They do not reconcile all receipts. Donor-size and lobbyist figures are not measured; unsupported panels are omitted, with exclusion disclosed quietly. PAC money is never a lobbyist proxy.

## Decisions

24 consecutive official roll calls, selected by roll number rather than politician, topic or outcome:
- House 119th Congress / first session, rolls 190–201, July 3–17, 2025: legislation, procedural motions and final passage. Exact Bioguide ID + House chamber + state joins to the fixed roster; 423–424 matches per roll.
- Senate 119th / first, rolls 372–383, July 1–10, 2025: bill passage, cloture motions and nominations. Exact official LIS ID maps to Bioguide using the existing bundled `legislators-current.json`, then Senate chamber + state verified; 98 matches per roll.
- 522 distinct roster members have decisions. Official historical Lindsey Graham and Markwayne Mullin entries do not map to the snapshot's newer roster occupants; no name-based substitution. House unmatched historical members are likewise excluded. Excluded source IDs accompany each roll. No Senate vice-presidential tie breaker is assigned to a senator; the full official result retains that context.

The feed sorts newest first, then roll number. Official Aye/Yea are displayed as Yes, No/Nay as No; raw vote remains in detail. Present and Not Voting remain distinct. Not Voting does not establish intentional abstention or reason. Procedure, cloture and nominations are labeled by their exact question; no procedural vote is presented as final passage. One source action is not support for every provision or an explanation of motive. Feed can scroll with keyboard, touch or pointer; detail expands with native controls. These windows are not a complete or statistically representative history, and are not current/live coverage.

`python scripts/import-public-votes.py` reproduces the offline joins and validates identifiers, state/chamber, duplicate identities and recognized vote statuses. Raw XML bytes are preserved with Git `-text`; hashes and source paths accompany each record. Identity map hash is recorded. No runtime API, credentials or remote lookup.

## Financial disclosures

Four complete selected original reports, 29 rows total. Selection is the prior Pelosi pilot plus the first three 2025 PTR index entries by filing date and document ID, not activity, sector, party or amount:
- Pelosi P000197, CA11, document 20026590, filed Jan 17, 2025: nine spouse (SP) rows, Dec 20, 2024–Jan 14, 2025. Options and stock/option exercises remain distinct; row six spans pages one and two.
- Mike Collins C001129, GA10, 20026489, filed Jan 1, 2025: one cryptocurrency (CT) purchase, Dec 3, 2024. Owner blank; no owner inferred.
- Virginia Foxx F000450, NC05, 20026516, filed Jan 6, 2025: 15 stock/unit (ST) rows, Dec 6–30, 2024. Owner blank; no owner inferred. Preferred shares, depositary shares and partnership units are named specifically. Pages one/two contain transactions; page three holds signature.
- Don Beyer B001292, VA08, 20026517, filed Jan 6, 2025: four joint (JT) rows, Dec 2–23, 2024; government securities (GS) and an ownership interest (OI). The called security is reported E and stays labeled Exchange (reported E), not assumed sale or gain. Two Oklahoma security purchases have different unit counts and stay separate source rows, not deduplicated by asset/date alone.

Filer, state/district and document ID manually verify each roster identity. All eight PDF pages across four reports visually inspected. Notification dates, reported dollar ranges, owner codes and row/page references preserved; no midpoint, sum, profit, net worth or current holding inferred. Row IDs are document plus row. Original report status New preserved; later filings and amendments are not reconciled. These four reports are not nationwide investment coverage or a representative trading sample.

Sources: official index https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2025FD.ZIP (selected entries and original index hash retained), report URLs in dataset, asset codes https://fd.house.gov/reference/asset-type-codes.aspx, owner/transaction guidance https://ethics.house.gov/wp-content/uploads/2025/04/Final-Instruction-Guide-2024.pdf. Raw PDFs and hashes are preserved under `data/evidence/`.

Each category retains its own date; omission means outside coverage, not zero. No prediction, causal connection, suspicion/corruption score or motive claim. No extension permission/behavior change. Review branch and refreshed preview only; production remains d626225 pending review.
