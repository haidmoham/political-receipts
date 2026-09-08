# Policy context method

`policy-context.json` adds three manually verified committee-role records. Join `id` to the bioguide ID in `politicians.json`. Role and jurisdiction are verified against official Senate and committee pages on September 8, 2026. Household stakes are plain-language interpretations of those jurisdictions. They are not measured household outcomes.

The UI can place campaign receipts alongside the official role and household stakes. It must preserve `connectionStatus: jurisdiction-only` and the missing donor-sector connection. A committee role provides a reason to scrutinize funding. It does not prove a donor bought a vote, changed a policy, or changed a household bill.

To establish an actual donor-to-sector association:

1. Import candidate-authorized committee IDs and itemized receipts for a defined period.
2. Resolve amendments, memo entries, conduit attribution, transfers, and refunds before aggregation.
3. Join contributor committee IDs to FEC committee records and connected organizations. Preserve the exact entity and its source record.
4. Assign a sector only with evidence about that entity. Record the classification rule and source. FEC organization type identifies legal organization categories, not an industry taxonomy.
5. Keep individual employees' donations separate from employer or PAC donations. An employer name on a disclosure does not prove the employer directed the donation.
6. Join sectors to documented committee jurisdiction, bill text, hearings, and recorded votes with dates. Distinguish a documented overlap from evidence of causation.

A stronger claim that funding influenced an action needs additional direct evidence. Examples include documented communications, investigative findings, or a suitable causal research design. These three records contain no such claim.

Refresh this file when committee membership changes. Do not auto-update its verification date when the finance importer runs.
