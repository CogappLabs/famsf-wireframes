#!/usr/bin/env python3
"""parquet + medium-token-map.tsv -> medium-taxonomy.json (the facet tree).

Polars transform shaped like the `-real` Dagster asset it will become. Each token
is a plain lookup into the hand-owned map — no classifier. Edit the map, re-run.

    uv run --with polars python scripts/build_medium_facet.py
"""

import json
from pathlib import Path

import polars as pl

ROOT = Path(__file__).resolve().parent.parent
PARQUET = Path(
    "/Users/lukew/git/famsf-collections/collection-flow-famsf-real/"
    "output/collection_documents.parquet"
)
TOKEN_MAP = ROOT / "src" / "data" / "medium-token-map.tsv"
OUT = ROOT / "src" / "data" / "medium-taxonomy.json"

OTHER_TIER1 = "Other"
# Hard delimiters only (comma, semicolon, slash, pipe, newline). A composite
# phrase like "oil on canvas" stays ONE token; "and"/"with"/"on" are NOT splits.
# Normalised to a single comma before str.split so one split call covers all.
MEDIUM_DELIMS = r"[;/|\r\n]"


def load_map() -> pl.DataFrame:
    """token -> path (+ suppress flag), the hand-owned mapping to join on."""
    return pl.read_csv(TOKEN_MAP, separator="\t").with_columns(
        pl.col("section", "subcategory", "specific").fill_null("")
    )


def tokens_to_nodes(objects: pl.LazyFrame, token_map: pl.DataFrame) -> pl.LazyFrame:
    """One row per (object, distinct facet node): tokenise, map, dedupe."""
    exploded = (
        objects.select(pl.col("medium"))
        .drop_nulls()
        .with_row_index("obj")
        .with_columns(
            pl.col("medium")
            .str.to_lowercase()
            .str.replace_all(MEDIUM_DELIMS, ",")
            .str.split(",")
            .alias("token")
        )
        .explode("token")
        .with_columns(pl.col("token").str.strip_chars())
        # drop the empty pieces "a,,b" or a trailing delimiter leaves behind
        .filter(pl.col("token").is_not_null() & (pl.col("token") != ""))
    )

    mapped = (
        exploded.join(token_map.lazy(), on="token", how="left")
        .with_columns(  # unmapped token -> Other (section is null after the join)
            pl.col("section").fill_null(OTHER_TIER1),
            pl.col("subcategory").fill_null(""),
            pl.col("specific").fill_null(""),
            pl.col("suppress").fill_null(False),
        )
        .filter(~pl.col("suppress"))
        .select("obj", "section", "subcategory", "specific")
        .unique()
    )

    # Drop the Other residue for any object that already has a real group.
    has_real = mapped.filter(pl.col("section") != OTHER_TIER1).select("obj").unique()
    return mapped.join(
        has_real.with_columns(pl.lit(True).alias("_real")), on="obj", how="left"
    ).filter(~((pl.col("section") == OTHER_TIER1) & pl.col("_real").fill_null(False)))


def transform(objects: pl.LazyFrame, token_map: pl.DataFrame) -> list[dict]:
    """parquet LazyFrame + map -> nested count tree (the asset output)."""
    nodes = tokens_to_nodes(objects, token_map)

    # Distinct-object counts per tier, all in Polars.
    t1 = (
        nodes.group_by("section").agg(pl.col("obj").n_unique().alias("count")).collect()
    )
    t2 = (
        nodes.filter(pl.col("subcategory") != "")
        .group_by("section", "subcategory")
        .agg(pl.col("obj").n_unique().alias("count"))
        .collect()
    )
    t3 = (
        nodes.filter(pl.col("specific") != "")
        .group_by("section", "subcategory", "specific")
        .agg(pl.col("obj").n_unique().alias("count"))
        .collect()
    )

    t1c = dict(zip(t1["section"], t1["count"], strict=True))
    t2c = {(s, sub): c for s, sub, c in t2.iter_rows()}
    t3c = {(s, sub, sp): c for s, sub, sp, c in t3.iter_rows()}

    # Assemble the nested tree, count-desc within each tier (Other pinned last).
    def children_t3(sec: str, sub: str) -> list[dict]:
        rows = [(sp, c) for (s, b, sp), c in t3c.items() if s == sec and b == sub]
        rows.sort(key=lambda x: (-x[1], x[0]))
        return [{"value": sp, "count": c, "children": []} for sp, c in rows]

    def children_t2(sec: str) -> list[dict]:
        rows = [(sub, c) for (s, sub), c in t2c.items() if s == sec]
        rows.sort(key=lambda x: (-x[1], x[0]))
        return [
            {"value": sub, "count": c, "children": children_t3(sec, sub)}
            for sub, c in rows
        ]

    tier1_rows = sorted(t1c.items(), key=lambda x: (-x[1], x[0]))
    tree = [
        {"value": sec, "count": c, "children": children_t2(sec)}
        for sec, c in tier1_rows
        if sec != OTHER_TIER1
    ]
    if OTHER_TIER1 in t1c:  # pin Other to the bottom
        tree.append(
            {
                "value": OTHER_TIER1,
                "count": t1c[OTHER_TIER1],
                "children": children_t2(OTHER_TIER1),
            }
        )
    return tree


def main() -> None:
    token_map = load_map()
    print(f"token map: {token_map.height:,} rows", flush=True)

    objects = pl.scan_parquet(PARQUET)
    tree = transform(objects, token_map)

    OUT.write_text(json.dumps(tree, ensure_ascii=False, indent="\t") + "\n")
    n_nodes = sum(
        1 + len(t2["children"]) for t1 in tree for t2 in t1["children"]
    ) + len(tree)
    print(f"Done. {len(tree)} Tier-1, ~{n_nodes} nodes -> {OUT}", flush=True)
    for t1 in tree:
        print(f"    {t1['value']:22} {t1['count']:>7,}", flush=True)


if __name__ == "__main__":
    main()
