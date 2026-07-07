"""Push the FULL-coverage 12-Tier-1 medium map to the Medium audit workbook.

Extends the curated 280-term head map (push_tier1_medium_map_sheet, ~65% of
object mentions) to *every* TMS medium token, so the medium facet is total.

Pipeline:
  1. Read the curated 12-Tier-1 sheet (the .xlsx) for the authoritative head
     mapping + the curators' flagged cleanup notes.
  2. Read master_v2 (the full ~17K-token universe with counts, canonical_final,
     facet_final) from the workbook.
  3. Classify every token with Tier1Classifier: curated exact overrides win, then
     keyword rules derived from the curated leaves, then not_medium -> Other +
     suppress-suggested, then unresolved -> Other.
  4. Write one tab, "12-Tier-1 full map": one row per token, sorted by object
     count desc, with Tier1/2/3 + Source + Review priority + Suppress? +
     Approve? + Cleanup note. Native Sheets table (typed cols, dropdowns, banding).

Curators triage by sorting on Review priority / Source: "Approved" rows (curated
+ override) are pre-checked; "Review" rows near the top (high count) are where
effort goes. `not_medium` rows carry a suggested Suppress? = Yes, which curators
confirm per-token (their call, not auto-dropped).

Idempotent: drops the tab's table + rewrites on each run.

Run (from the wireframes repo root, after `gcloud auth application-default login`):

    uv run --with openpyxl --with google-api-python-client --with google-auth \
        --with-editable ~/git/cogapp-sheets \
        python scripts/push_tier1_full_coverage_sheet.py
"""

from cogapp_sheets import Client

from material_taxonomy.tier1_classifier import Tier1Classifier
from push_tier1_medium_map_sheet import build_rows as build_curated_rows

SHEET_ID = "14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI"
MASTER_TAB = "master_v2"

TAB = "12-Tier-1 full map"
TABLE_ID = "tier1_full_map"
TABLE_NAME = "Tier1_full_map"  # formula-safe: no leading digit / space / hyphen

HEADER = [
    "TMS term (token)",
    "Objects",
    "Tier 1 (Medium group)",
    "Tier 2",
    "Tier 3",
    "Source",
    "Review priority",
    "Suppress?",
    "Approve?",
    "Cleanup / curator note",
]
APPROVE_OPTIONS = [
    "Yes",
    "Change Tier 1",
    "Change Tier 2/3",
    "Merge / normalise",
    "Drop",
]
SUPPRESS_OPTIONS = ["", "Yes", "No"]

# The old numeric "Confidence" (0.0-1.0) read as a computed score, which it never
# was — it just encoded how the row was decided. This maps `source` to a
# plain-language triage cue so curators can sort review effort without reading a
# float as a probability. "Approved" = trust it; "Check" = probable, glance;
# "Review" = a fallback / no-signal call that needs a human decision.
REVIEW_PRIORITY = {
    "curated": "Approved",
    "override": "Approved",
    "keyword": "Check",
    "supplementary": "Review",
    "not_medium": "Review",
    "unresolved": "Review",
}
REVIEW_OPTIONS = ["Approved", "Check", "Review"]


def _curated_note_index() -> dict[str, str]:
    """Map curated leaf term (lowercased) -> its flagged cleanup note, if any."""
    notes: dict[str, str] = {}
    for r in build_curated_rows()[1:]:  # skip header
        tier1, tier2, tier3, leaf, _cnt, _approve, note = r
        if note:
            for label in (leaf, tier3, tier2):
                if label:
                    notes.setdefault(str(label).strip().lower(), note)
    return notes


def _curated_dicts() -> list[dict]:
    """The curated crosswalk as dicts the classifier consumes."""
    out = []
    for r in build_curated_rows()[1:]:
        tier1, tier2, tier3, leaf, _cnt, _approve, _note = r
        out.append({"tier1": tier1, "tier2": tier2, "tier3": tier3, "leaf": leaf})
    return out


def _read_master(client: Client) -> list[dict]:
    """master_v2 rows: token, count, facet_final, canonical_final."""
    vals = client.read(f"'{MASTER_TAB}'!A2:E30000")
    rows = []
    for r in vals:
        if not r or not r[0]:
            continue
        cnt = int(r[1]) if len(r) > 1 and str(r[1]).strip().isdigit() else 0
        rows.append(
            {
                "token": r[0],
                "count": cnt,
                "facet_final": r[2] if len(r) > 2 else "",
                "canonical": r[4] if len(r) > 4 else "",
            }
        )
    return rows


def build_full_rows(client: Client) -> list[list]:
    """Header + one classified row per master_v2 token, sorted by count desc."""
    clf = Tier1Classifier(_curated_dicts())
    notes = _curated_note_index()
    master = _read_master(client)
    master.sort(key=lambda m: m["count"], reverse=True)

    out: list[list] = [HEADER]
    for m in master:
        p = clf.classify(
            m["token"], canonical=m["canonical"], facet_final=m["facet_final"]
        )
        note = notes.get(str(m["token"]).strip().lower(), "")
        if not note and p.source == "not_medium":
            note = f"flagged not-a-medium in {MASTER_TAB}"
        out.append(
            [
                m["token"],
                m["count"],
                p.tier1,
                p.tier2,
                p.tier3,
                p.source,
                REVIEW_PRIORITY.get(p.source, "Review"),
                "Yes" if p.suppress_suggested else "",
                # pre-approve the curated head + the deliberate override rules
                "Yes" if p.source in ("curated", "override") else "",
                note,
            ]
        )
    return out


def _tab_id(client: Client, title: str) -> int | None:
    meta = client.meta(fields="sheets(properties(sheetId,title))")
    for s in meta.get("sheets", []):
        if s["properties"]["title"] == title:
            return s["properties"]["sheetId"]
    return None


def ensure_tab(client: Client, title: str) -> int:
    sid = _tab_id(client, title)
    if sid is not None:
        client.clear(f"'{title}'!A1:Z100000")
        return sid
    client.batch_update([{"addSheet": {"properties": {"title": title}}}])
    sid = _tab_id(client, title)
    assert sid is not None
    return sid


def drop_existing_tables(client: Client, sid: int) -> None:
    meta = client.meta(fields="sheets(properties(sheetId),tables(tableId))")
    reqs = []
    for s in meta.get("sheets", []):
        if s["properties"]["sheetId"] != sid:
            continue
        for t in s.get("tables", []):
            reqs.append({"deleteTable": {"tableId": t["tableId"]}})
    if reqs:
        client.batch_update(reqs, tolerant=True)


def add_table_request(sid: int, n_rows: int) -> dict:
    col_props = []
    for i, label in enumerate(HEADER):
        prop: dict = {"columnIndex": i, "columnName": label, "columnType": "TEXT"}
        if label == "Objects":
            prop["columnType"] = "DOUBLE"
        if label in ("Suppress?", "Approve?", "Review priority"):
            prop["columnType"] = "DROPDOWN"
            opts = {
                "Suppress?": SUPPRESS_OPTIONS,
                "Approve?": APPROVE_OPTIONS,
                "Review priority": REVIEW_OPTIONS,
            }[label]
            prop["dataValidationRule"] = {
                "condition": {
                    "type": "ONE_OF_LIST",
                    "values": [{"userEnteredValue": v} for v in opts if v],
                }
            }
        col_props.append(prop)
    return {
        "addTable": {
            "table": {
                "tableId": TABLE_ID,
                "name": TABLE_NAME,
                "range": {
                    "sheetId": sid,
                    "startRowIndex": 0,
                    "endRowIndex": n_rows + 1,
                    "startColumnIndex": 0,
                    "endColumnIndex": len(HEADER),
                },
                "columnProperties": col_props,
            }
        }
    }


def main() -> None:
    client = Client(SHEET_ID)
    print(
        "Classifying all master_v2 tokens against the curated 12-Tier-1 map …",
        flush=True,
    )
    rows = build_full_rows(client)
    n = len(rows) - 1

    # Coverage report.
    from collections import Counter

    src = Counter(r[5] for r in rows[1:])
    mentions = Counter()
    for r in rows[1:]:
        mentions[r[5]] += int(r[1])
    total_m = sum(mentions.values()) or 1
    print(f"  {n:,} tokens classified", flush=True)
    for s in (
        "curated",
        "override",
        "keyword",
        "supplementary",
        "not_medium",
        "unresolved",
    ):
        print(
            f"    {s:11} {src.get(s, 0):>6,} tokens  "
            f"{100 * mentions.get(s, 0) / total_m:5.1f}% of mentions",
            flush=True,
        )

    print(f"Writing '{TAB}' …", flush=True)
    sid = ensure_tab(client, TAB)
    drop_existing_tables(client, sid)
    client.write(f"'{TAB}'!A1", rows)
    client.batch_update([add_table_request(sid, n)])
    print(f"Done. https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit", flush=True)


if __name__ == "__main__":
    main()
