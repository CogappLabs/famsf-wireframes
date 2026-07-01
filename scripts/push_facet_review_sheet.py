"""Push the material-facet proposal to the curator Material workbook for review.

Writes two tabs the FAMSF curators review in-sheet:

  "Facet review"  one row per distinct TMS medium term, ordered by how many
                  objects carry it (highest-impact first). Shows the verbatim TMS
                  term beside the proposed 3-level facet path (Section ->
                  Subcategory -> Specific) plus the AAT id and how the mapping was
                  decided. Two empty columns - "Approve?" and "Curator note" -
                  are the curators' work surface; "Approve?" is a native table
                  DROPDOWN column (Yes / Change / Drop) so responses stay tidy.
  "Facet tree"    the rolled-up Section -> Subcategory shape with object counts
                  and share, so the workbook opens on the big picture.

Both tabs are written as native Google Sheets tables (addTable), so they carry
typed columns (counts numeric, share as percent, Approve? a dropdown), banded
rows and a filter UI without any manual formatting.

Reads the generator outputs (token_facet_map.tsv + facet_sections.tsv); run
build_material_taxonomy.py first. Idempotent: drops the existing table + rewrites
both tabs on each run.

Run (from the wireframes repo root, after `gcloud auth application-default login`):

    uv run --with google-api-python-client --with google-auth \
        --with-editable ~/git/cogapp-sheets \
        python scripts/push_facet_review_sheet.py
"""

import csv
from pathlib import Path

from cogapp_sheets import Client

SHEET_ID = "14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI"
TSV = Path(__file__).resolve().parent.parent / "src" / "data" / "taxonomy-tsv"
MAP = TSV / "token_facet_map.tsv"
TREE = TSV / "facet_sections.tsv"

REVIEW_TAB = "Facet review"
TREE_TAB = "Facet tree"

REVIEW_HEADER = [
    "TMS term (original)",
    "Objects",
    "Facet",
    "Section",
    "Subcategory",
    "Specific",
    "AAT ID",
    "Mapped by",
    "Approve?",
    "Curator note",
]
TREE_HEADER = [
    "Section",
    "Subcategory",
    "Specific",
    "TMS terms",
    "Objects",
    "Share of all objects",
]

APPROVE_OPTIONS = ["Yes", "Change section", "Change subcategory", "Drop / not a medium"]


def _rows(path: Path) -> list[dict]:
    with path.open() as f:
        return list(csv.DictReader(f, delimiter="\t"))


def _tab_id(client: Client, title: str) -> int | None:
    meta = client.meta(fields="sheets(properties(sheetId,title))")
    for s in meta.get("sheets", []):
        if s["properties"]["title"] == title:
            return s["properties"]["sheetId"]
    return None


def ensure_tab(client: Client, title: str) -> int:
    """Return the tab's sheetId, creating the tab if absent."""
    sid = _tab_id(client, title)
    if sid is not None:
        client.clear(f"'{title}'!A1:Z100000")
        return sid
    client.batch_update([{"addSheet": {"properties": {"title": title}}}])
    sid = _tab_id(client, title)
    assert sid is not None
    return sid


def build_review_rows() -> list[list]:
    """Header + one row per TMS term, ordered by object count desc."""
    rows = _rows(MAP)
    rows.sort(key=lambda r: int(r["object_count"]), reverse=True)
    out = [REVIEW_HEADER]
    for r in rows:
        out.append(
            [
                r["token"],
                int(r["object_count"]),
                r["facet"],
                r["section"],
                r["subcategory"],
                r["specific"],
                r["aat_id"],
                r["source"],
                "",  # Approve?
                "",  # Curator note
            ]
        )
    return out


def build_tree_rows() -> list[list]:
    """Header + full Section/Subcategory/Specific rollup with object share.

    Ordered section -> subcategory -> specific, each tier by descending object
    volume, so the tree reads big-to-small at every level.
    """
    rows = _rows(TREE)
    total = sum(int(r["objects"]) for r in rows) or 1
    sec_total: dict[str, int] = {}
    sub_total: dict[tuple[str, str], int] = {}
    for r in rows:
        sec_total[r["section"]] = sec_total.get(r["section"], 0) + int(r["objects"])
        k = (r["section"], r["subcategory"])
        sub_total[k] = sub_total.get(k, 0) + int(r["objects"])
    rows.sort(
        key=lambda r: (
            -sec_total[r["section"]],
            r["section"],
            -sub_total[(r["section"], r["subcategory"])],
            r["subcategory"],
            -int(r["objects"]),
        )
    )
    out = [TREE_HEADER]
    for r in rows:
        out.append(
            [
                r["section"],
                r["subcategory"],
                r["specific"],
                int(r["tokens"]),
                int(r["objects"]),
                round(int(r["objects"]) / total, 4),  # fraction; PERCENT col formats it
            ]
        )
    return out


def add_table_request(
    sid: int,
    table_id: str,
    name: str,
    header: list[str],
    n_rows: int,
    column_types: dict[str, str],
    dropdowns: dict[str, list[str]] | None = None,
) -> dict:
    """An addTable request turning the written range into a native Sheets table.

    `n_rows` is the data-row count (excluding the header). `column_types` maps a
    header label to a Sheets column type (DOUBLE / PERCENT / DROPDOWN / TEXT);
    unlisted columns default to TEXT. `dropdowns` maps a header label to its
    allowed values, attached as the column's data-validation rule (only valid on
    DROPDOWN columns).
    """
    dropdowns = dropdowns or {}
    col_props = []
    for i, label in enumerate(header):
        prop: dict = {
            "columnIndex": i,
            "columnName": label,
            "columnType": column_types.get(label, "TEXT"),
        }
        if label in dropdowns:
            prop["dataValidationRule"] = {
                "condition": {
                    "type": "ONE_OF_LIST",
                    "values": [{"userEnteredValue": v} for v in dropdowns[label]],
                }
            }
        col_props.append(prop)
    return {
        "addTable": {
            "table": {
                "tableId": table_id,
                "name": name,
                "range": {
                    "sheetId": sid,
                    "startRowIndex": 0,
                    "endRowIndex": n_rows + 1,  # + header
                    "startColumnIndex": 0,
                    "endColumnIndex": len(header),
                },
                "columnProperties": col_props,
            }
        }
    }


def drop_existing_tables(client: Client, sid: int) -> None:
    """Delete any tables already on the tab so addTable won't collide on re-run."""
    meta = client.meta(fields="sheets(properties(sheetId),tables(tableId))")
    reqs = []
    for s in meta.get("sheets", []):
        if s["properties"]["sheetId"] != sid:
            continue
        for t in s.get("tables", []):
            reqs.append({"deleteTable": {"tableId": t["tableId"]}})
    if reqs:
        client.batch_update(reqs, tolerant=True)


def main() -> None:
    """Write the review + tree tabs to the Material workbook."""
    client = Client(SHEET_ID)

    print(f"Building rows from {MAP.name} + {TREE.name} …", flush=True)
    review = build_review_rows()
    tree = build_tree_rows()
    print(f"  {len(review) - 1:,} review rows, {len(tree) - 1} tree rows", flush=True)

    print(f"Writing '{TREE_TAB}' …", flush=True)
    tree_sid = ensure_tab(client, TREE_TAB)
    drop_existing_tables(client, tree_sid)
    client.write(f"'{TREE_TAB}'!A1", tree)
    client.batch_update(
        [
            add_table_request(
                tree_sid,
                "facet_tree",
                "Facet tree",
                TREE_HEADER,
                len(tree) - 1,
                column_types={
                    "TMS terms": "DOUBLE",
                    "Objects": "DOUBLE",
                    "Share of all objects": "PERCENT",
                },
            )
        ]
    )

    print(f"Writing '{REVIEW_TAB}' ({len(review) - 1:,} rows) …", flush=True)
    review_sid = ensure_tab(client, REVIEW_TAB)
    drop_existing_tables(client, review_sid)
    client.write(f"'{REVIEW_TAB}'!A1", review)
    client.batch_update(
        [
            add_table_request(
                review_sid,
                "facet_review",
                "Facet review",
                REVIEW_HEADER,
                len(review) - 1,
                column_types={"Objects": "DOUBLE", "Approve?": "DROPDOWN"},
                dropdowns={"Approve?": APPROVE_OPTIONS},
            )
        ]
    )

    print(
        f"Done. https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit",
        flush=True,
    )


if __name__ == "__main__":
    main()
