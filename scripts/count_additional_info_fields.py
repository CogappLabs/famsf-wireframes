"""How full is the object page's "Additional information" block?

Counts, per object in the served index, how many of the block's five rows would
render: named collection (highlights), accession date, material (medium),
department, alternate titles. Mirrors the render conditions in
`objects/sample/[...variant]/page.tsx` and `alternateTitles()`, so the
distribution answers whether the block earns its collapsed-details treatment.

Pages the index with `search_after` via `esq raw`, so ES credentials stay with
esq (it reads the -real .env itself). Run from the wireframes repo root:

    uv run python scripts/count_additional_info_fields.py
"""

import json
import subprocess
import tempfile
from collections import Counter
from pathlib import Path

INDEX = "develop"
# esq resolves its ES creds from this project's .env.
ESQ_PROJECT = Path("/Users/lukew/git/famsf-collections/collection-flow-famsf-real")
PAGE_SIZE = 5000
SOURCE_FIELDS = [
    "titles",
    "highlights",
    "accession_iso_date",
    "medium",
    "department",
]
# The five rows, in the order the page renders them.
ROWS = ("named_collection", "accession_date", "medium", "department", "alt_titles")


def es_page(search_after: list | None, out_file: Path) -> dict:
    body = {
        "size": PAGE_SIZE,
        "_source": SOURCE_FIELDS,
        "sort": [{"_doc": "asc"}],
        "track_total_hits": True,
    }
    if search_after:
        body["search_after"] = search_after
    # Write to a file rather than reading stdout: esq truncates large responses
    # on the terminal path, which breaks mid-string.
    subprocess.run(
        [
            "esq",
            "raw",
            "-X",
            "POST",
            "--path",
            f"/{INDEX}/_search",
            "--body",
            json.dumps(body),
            "-o",
            str(out_file),
        ],
        cwd=ESQ_PROJECT,
        capture_output=True,
        text=True,
        check=True,
    )
    # strict=False: some TMS titles carry raw control characters.
    return json.loads(out_file.read_text(), strict=False)


def alternate_titles(titles: list[dict] | None) -> list[dict]:
    """Port of `alternateTitles()`: active titles minus the primary."""
    active = [t for t in (titles or []) if t.get("active")]
    primaries = sorted(
        (t for t in active if t.get("type") == "Primary Title"),
        key=lambda t: t.get("display_order") or 0,
    )
    primary = primaries[0] if primaries else None
    return [t for t in active if t is not primary]


def present_rows(doc: dict) -> list[str]:
    """Which of the five rows this doc would render."""
    out = []
    if doc.get("highlights"):
        out.append("named_collection")
    if doc.get("accession_iso_date"):
        out.append("accession_date")
    if doc.get("medium"):
        out.append("medium")
    if doc.get("department"):
        out.append("department")
    if alternate_titles(doc.get("titles")):
        out.append("alt_titles")
    return out


def main() -> None:
    counts = Counter()  # rows rendered -> doc count
    per_row = Counter()  # row name -> doc count carrying it
    seen = 0
    total = None
    search_after = None
    page_file = Path(tempfile.gettempdir()) / "addinfo_page.json"

    while True:
        resp = es_page(search_after, page_file)
        hits = resp["hits"]["hits"]
        if total is None:
            total = resp["hits"]["total"]["value"]
            print(f"Scanning {total:,} docs in '{INDEX}'…", flush=True)
        if not hits:
            break
        for hit in hits:
            rows = present_rows(hit["_source"])
            counts[len(rows)] += 1
            per_row.update(rows)
            seen += 1
        if seen % 25000 < PAGE_SIZE:
            print(f"  {seen:,} / {total:,}", flush=True)
        search_after = hits[-1]["sort"]

    print(f"\nScanned {seen:,} docs\n")
    print("Rows rendered  Objects      % of index   Cumulative %")
    cumulative = 0
    for n in range(len(ROWS) + 1):
        c = counts[n]
        cumulative += c
        print(
            f"{n:>13}  {c:>10,}  {c / seen * 100:>10.1f}%  {cumulative / seen * 100:>12.1f}%"
        )

    three_or_fewer = sum(counts[n] for n in range(4))
    mean = sum(n * c for n, c in counts.items()) / seen
    print(f"\nMean rows per object: {mean:.2f}")
    print(
        f"3 or fewer rows: {three_or_fewer:,} objects "
        f"({three_or_fewer / seen * 100:.1f}%)"
    )

    print("\nPer-row coverage:")
    for row in ROWS:
        c = per_row[row]
        print(f"  {row:<18} {c:>10,}  {c / seen * 100:>6.1f}%")

    out_path = Path("scripts/additional_info_field_counts.json")
    out_path.write_text(
        json.dumps(
            {
                "index": INDEX,
                "scanned": seen,
                "by_row_count": {str(n): counts[n] for n in range(len(ROWS) + 1)},
                "per_row": dict(per_row),
                "mean_rows": mean,
                "three_or_fewer": three_or_fewer,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
