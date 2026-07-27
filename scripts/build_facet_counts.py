"""Build real full-collection facet counts for the search-results wireframe.

The grid-facets variation is backed by a ~600-doc slice, so its own counts are
a sample, not the collection. This aggregates the full pipeline parquet so the
flat facets can show real numbers.

Place and Medium are deliberately excluded: both render curated hierarchies
with their own build steps (build_medium_facet.py, the REGION_REMAP crosswalk).

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
            "as collection-wide totals rather than slice counts. Place and "
            "Medium are excluded: they have their own curated build steps. "
            "Rebuild with scripts/build_facet_counts.py after a re-export."
        ),
        "source": PARQUET.name,
        "totalDocuments": int(total),
    }

    for key, column in FLAT.items():
        vals = flat_counts(con, column)
        out[key] = vals
        print(f"  {key:16} {len(vals):6} values", flush=True)

    # Maker role lives inside the constituents struct array.
    role_rows = con.execute("""
        SELECT c.role AS value, COUNT(DISTINCT d.id) AS n
        FROM read_parquet($parquet) d, UNNEST(d.constituents) AS t(c)
        WHERE c.role IS NOT NULL AND trim(c.role) <> ''
        GROUP BY 1
        ORDER BY n DESC, value
    """, {"parquet": str(PARQUET)}).fetchall()
    out["role"] = [{"value": r[0], "count": int(r[1])} for r in role_rows]
    print(f"  {'role':16} {len(role_rows):6} values", flush=True)

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

    DEST.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"\nWrote {DEST}")


if __name__ == "__main__":
    main()
