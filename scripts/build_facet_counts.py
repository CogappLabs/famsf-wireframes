"""Build real full-collection facet counts for the search-results wireframe.

The grid-facets variation is backed by a ~600-doc slice, so its own counts are
a sample, not the collection. This aggregates the full pipeline parquet so the
flat facets can show real numbers.

Medium is deliberately excluded: it renders the curators' full 12-Tier-1
hierarchy with its own build step (build_medium_facet.py).

Place counts come from the pipeline's own `place.lvl0`-`lvl3` struct, so they
are the served hierarchy rather than the wireframe's separate `facet_place[]`
stand-in. Note the pipeline currently reads an 18-row placeholder crosswalk
(tests/fixtures/places_remap.ndjson) instead of the 532-row curator REGION_REMAP
sheet, so the region tier still carries raw-TGN artefacts ("Roman Empire",
"Milky Way Galaxy") and endonyms ("Deutschland"). These counts are real; the
labels are not yet curated.

FAMSF Collection is not in the parquet yet (CW-254); its counts live in
src/data/famsf-collection-values.json, probed from TMS.

Usage:
    uv run --with duckdb python scripts/build_facet_counts.py
"""

import json
from pathlib import Path

import duckdb

PARQUET = (
    Path(__file__).resolve().parents[2]
    / "collection-flow-famsf-real"
    / "output"
    / "collection_documents.parquet"
)
DEST = Path(__file__).resolve().parent.parent / "src" / "data" / "facet-counts.json"

# Flat single-value facets: one column, one bucket per distinct value.
FLAT = {
    "artist": "primary_artist",
    "culture": "culture",
    "classification": "classification",
    "department": "department",
}


# Every distinct value, uncapped. This is a totals lookup keyed by value, so a
# missing value means a facet row falls back to its ~600-doc slice count instead
# of the collection-wide one. Artist carries 13.5K values (~570 KB); the whole
# file is static build-time data, so the size is worth the honest counts.
def flat_counts(con: duckdb.DuckDBPyConnection, column: str) -> list[dict]:
    rows = con.execute(f"""
        SELECT {column} AS value, COUNT(*) AS n
        FROM read_parquet($parquet)
        WHERE {column} IS NOT NULL AND trim({column}) <> ''
        GROUP BY 1
        ORDER BY n DESC, value
    """, {"parquet": str(PARQUET)}).fetchall()
    return [{"value": r[0], "count": int(r[1])} for r in rows]


def main() -> None:
    if not PARQUET.exists():
        raise SystemExit(f"parquet not found: {PARQUET}")

    con = duckdb.connect()
    print(f"Reading {PARQUET.name}…", flush=True)

    total = con.execute(
        "SELECT COUNT(*) FROM read_parquet($parquet)", {"parquet": str(PARQUET)}
    ).fetchone()[0]
    print(f"  {total:,} documents", flush=True)

    out: dict[str, object] = {
        "_comment": (
            "Real full-collection facet counts from the -real pipeline parquet. "
            "The grid-facets view renders a ~600-doc slice, so these are shown "
            "as collection-wide totals rather than slice counts. Flat facets "
            "carry every distinct value (uncapped since 2026-08-05, so a facet "
            "row always finds its real count); place keeps its full tree. "
            "Medium has its own build step "
            "(build_medium_facet.py). Rebuild with scripts/build_facet_counts.py "
            "after a re-export."
        ),
        "source": PARQUET.name,
        "totalDocuments": int(total),
    }

    for key, column in FLAT.items():
        vals = flat_counts(con, column)
        out[key] = vals
        print(f"  {key:16} {len(vals):6} values", flush=True)

    # Boolean / derived toggles, including the On view museum split.
    toggles = con.execute("""
        SELECT
            COUNT(*) FILTER (WHERE on_view)                       AS on_view,
            COUNT(*) FILTER (WHERE on_view AND location_building = 'de Young')
                                                                  AS on_view_de_young,
            COUNT(*) FILTER (WHERE on_view AND location_building = 'Legion')
                                                                  AS on_view_legion,
            COUNT(*) FILTER (WHERE has_image)                     AS has_image,
            COUNT(*) FILTER (
                WHERE lower(coalesce(copyright, '')) LIKE '%public domain%'
                   OR object_rights_type = 'Public Domain'
            )                                                     AS open_access
        FROM read_parquet($parquet)
    """, {"parquet": str(PARQUET)}).fetchone()

    out["toggles"] = {
        "onView": int(toggles[0]),
        "onViewDeYoung": int(toggles[1]),
        "onViewLegion": int(toggles[2]),
        "hasImage": int(toggles[3]),
        "openAccess": int(toggles[4]),
    }
    print(f"  toggles          {out['toggles']}", flush=True)

    # Place: the served hierarchy. lvl1+ values are "A > B" cumulative paths, so
    # key them by their own leaf label and keep the parent for nesting.
    place: dict[str, list[dict]] = {}
    for lvl in ("lvl0", "lvl1", "lvl2", "lvl3"):
        rows = con.execute(f"""
            SELECT v AS path, COUNT(DISTINCT d.id) AS n
            FROM read_parquet($parquet) d, UNNEST(d.place.{lvl}) AS t(v)
            WHERE v IS NOT NULL AND trim(v) <> ''
            GROUP BY 1
            ORDER BY n DESC, path
        """, {"parquet": str(PARQUET)}).fetchall()
        place[lvl] = [
            {
                "path": r[0],
                "value": r[0].split(" > ")[-1],
                "count": int(r[1]),
            }
            for r in rows
        ]
        print(f"  place.{lvl:11} {len(place[lvl]):6} values", flush=True)
    out["place"] = place

    # Tab-indented to match Biome's JSON formatting, so a rebuild does not
    # leave the file dirty.
    DEST.write_text(json.dumps(out, indent="\t", ensure_ascii=False) + "\n")
    print(f"\nWrote {DEST}")


if __name__ == "__main__":
    main()
