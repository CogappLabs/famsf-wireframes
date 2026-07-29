#!/usr/bin/env python3
"""Dump every tab of the FAMSF artwork-page field workbook to stdout as TSV.

Run after `gcloud auth application-default login`:

    uv run --with google-api-python-client --with google-auth \
        --with-editable ~/git/cogapp-sheets \
        python scripts/read_artwork_page_sheet.py
"""

from cogapp_sheets import Client

SHEET = "1UiYFYrBERB0prTileo2uoFMJ_QTqgHZ8MmxXCEM-Oh4"


def main() -> None:
    client = Client(SHEET)
    meta = client.meta(fields="properties(title),sheets(properties(title,gridProperties))")
    print("WORKBOOK:", meta.get("properties", {}).get("title"), flush=True)

    tabs = [s["properties"] for s in meta.get("sheets", [])]
    print(f"TABS ({len(tabs)}):", flush=True)
    for p in tabs:
        g = p.get("gridProperties", {})
        print(f"  - {p['title']}  ({g.get('rowCount')}x{g.get('columnCount')})", flush=True)

    for p in tabs:
        title = p["title"]
        print(f"\n{'=' * 70}\nTAB: {title}\n{'=' * 70}", flush=True)
        try:
            rows = client.read(f"'{title}'!A1:Z400")
        except Exception as e:  # noqa: BLE001 - one-off dump, report and continue
            print(f"  FAILED: {e}", flush=True)
            continue
        for row in rows:
            print("\t".join(str(c) for c in row), flush=True)


if __name__ == "__main__":
    main()
