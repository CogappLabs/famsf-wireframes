"""Generate real collection-area highlights + featured-collection member grids.

Reads the pipeline export (`collection_documents.parquet`) and emits a single
JSON the collection-area wireframe pages consume, so the highlights and featured
grids show real curator-picked works (title, artist, date, medium, thumbnail)
instead of hand-typed placeholders.

Two data shapes, both keyed for the wireframe:

1. `highlightsByDepartment` — every Web Highlights package member, grouped by the
   member's own `department` (the collection area), ordered by curator rank.
   Driving off the member's department (not the package name) keeps the mapping
   honest: AOA members from the three regional highlight packages all carry the
   single "Arts of Africa, Oceania, and the Americas" department, so they merge
   automatically.

2. `featuredMembers` — members of the six named "(Web)" collections under the
   Achenbach department (Crown Point Press, Logan, etc.), keyed by collection
   slug. These packages are not in the pipeline's `highlights` field, so their
   member ObjectIDs come from a sidecar list probed from TMS
   (`featured_collection_members.json`); this script joins them to the export
   for render fields.

Run from the wireframes repo root:
  uv run --no-project --with duckdb python scripts/build_collection_data.py
"""

import json
from pathlib import Path

import duckdb

REPO = Path(__file__).resolve().parent.parent
PARQUET = (
    REPO.parent
    / "collection-flow-famsf-real"
    / "output"
    / "collection_documents.parquet"
)
FEATURED_MEMBERS = REPO / "scripts" / "featured_collection_members.json"
OUT = REPO / "src" / "data" / "collection-area-members.json"

# Cap per grid. The page shows a 6-up highlights row and a featured grid; 12
# gives the page room to show a "view all" affordance over a real subset.
PER_GRID = 12


def _render_cols(alias: str = "d") -> str:
    """SQL projection of the render fields a wireframe card needs.

    `primary_artist` is the maker name; `primary_artist_display` holds a
    role/date fragment ("b. 1937") and is the wrong field for a byline. Images
    render as placeholders in the wireframe, so no thumbnail field is carried.
    """
    return f"""
        {alias}.id,
        {alias}.title,
        {alias}.primary_artist AS artist,
        {alias}.date_display   AS date,
        {alias}.medium,
        {alias}.slug
    """


def build_highlights(con: duckdb.DuckDBPyConnection) -> dict:
    """Highlight-package members grouped by the member's department."""
    rows = con.execute(
        f"""
        WITH exploded AS (
            SELECT
                d.department AS department,
                h.rank       AS rank,
                {_render_cols()}
            FROM read_parquet(?) d,
                 UNNEST(d.highlights) AS t(h)
        ),
        ranked AS (
            SELECT *,
                   ROW_NUMBER() OVER (
                       PARTITION BY department ORDER BY rank, title
                   ) AS rn
            FROM exploded
        )
        SELECT department, rank, id, title, artist, date, medium, slug
        FROM ranked
        WHERE rn <= {PER_GRID}
        ORDER BY department, rank, title
        """,
        [str(PARQUET)],
    ).fetchall()

    cols = [c[0] for c in con.description]
    by_dept: dict[str, list] = {}
    for row in rows:
        rec = dict(zip(cols, row, strict=True))
        dept = rec.pop("department")
        by_dept.setdefault(dept, []).append(rec)
    return by_dept


def build_featured(con: duckdb.DuckDBPyConnection) -> dict:
    """Named (Web) collection members, keyed by collection slug.

    Skipped (returns empty) if the sidecar member list is absent, so the
    highlights data still builds without a TMS round-trip.
    """
    if not FEATURED_MEMBERS.exists():
        print(
            f"  (no {FEATURED_MEMBERS.name}; skipping featured members)",
            flush=True,
        )
        return {}

    spec = json.loads(FEATURED_MEMBERS.read_text())
    by_slug: dict[str, list] = {}
    for slug, info in spec.items():
        ids = info["object_ids"][: PER_GRID * 3]  # over-fetch; some may be unindexed
        if not ids:
            continue
        placeholders = ", ".join("?" for _ in ids)
        rows = con.execute(
            f"""
            SELECT {_render_cols()}
            FROM read_parquet(?) d
            WHERE d.id IN ({placeholders})
            ORDER BY d.has_iiif DESC, d.title
            LIMIT {PER_GRID}
            """,
            [str(PARQUET), *[str(i) for i in ids]],
        ).fetchall()
        cols = [c[0] for c in con.description]
        by_slug[slug] = [dict(zip(cols, r, strict=True)) for r in rows]
        print(f"  featured {slug}: {len(rows)} members", flush=True)
    return by_slug


def main() -> None:
    """Build both data shapes and write the combined JSON."""
    if not PARQUET.exists():
        raise SystemExit(f"export not found: {PARQUET}")
    print(f"Reading {PARQUET}", flush=True)
    con = duckdb.connect()

    highlights = build_highlights(con)
    print(f"  highlights: {len(highlights)} departments", flush=True)
    for dept, members in sorted(highlights.items()):
        print(f"    {len(members):>3}  {dept}", flush=True)

    featured = build_featured(con)

    payload = {
        "highlightsByDepartment": highlights,
        "featuredMembers": featured,
    }
    OUT.write_text(json.dumps(payload, indent="\t", ensure_ascii=False) + "\n")
    print(f"Wrote {OUT}", flush=True)


if __name__ == "__main__":
    main()
