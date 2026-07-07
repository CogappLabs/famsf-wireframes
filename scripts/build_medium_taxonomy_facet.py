#!/usr/bin/env python3
"""Build the FULL 12-Tier-1 medium facet tree with REAL object counts.

The grid-facets Medium facet used to show only the Tier-1/2/3 nodes that the
~600-doc slice happened to contain, counted within the slice. This builds the
*complete* curated hierarchy (every Tier-1/2/3 node reachable by classifying the
whole collection's medium vocabulary) with **real, full-collection distinct-object
counts** — so the visitor sees the true shape + magnitude of the medium taxonomy
even though the wireframe only actually filters the 600-doc slice.

Counts are DISTINCT objects per node (an object counts once for a node no matter
how many of its medium tokens land there), rolled up so a Tier-1 count is the
distinct objects with any descendant leaf. Computed over every object in
collection_documents.parquet with a non-null medium (~137K).

Output: src/data/medium-taxonomy.json — a nested tree
  [{ value, count, children: [{ value, count, children: [...] }] }]
matching the wireframe's FacetTreeNode shape. Loaded by grid-facets.tsx and
merged over the slice-derived tree so every node renders with its real count.

Run (wireframes repo root):

    uv run --with openpyxl python scripts/build_medium_taxonomy_facet.py
"""

import csv
import json
import re
import subprocess
from pathlib import Path

try:
    from material_taxonomy.tier1_classifier import Tier1Classifier
    from push_tier1_medium_map_sheet import build_rows as build_curated_rows
except ModuleNotFoundError as exc:  # pragma: no cover - script-invocation shim
    if exc.name not in ("material_taxonomy", "push_tier1_medium_map_sheet"):
        raise
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from material_taxonomy.tier1_classifier import Tier1Classifier
    from push_tier1_medium_map_sheet import build_rows as build_curated_rows

ROOT = Path(__file__).resolve().parent.parent
PARQUET = Path(
    "/Users/lukew/git/famsf-collections/collection-flow-famsf-real/"
    "output/collection_documents.parquet"
)
TSV = ROOT / "src" / "data" / "taxonomy-tsv"
MASTER_V2 = TSV / "material_master_v2.tsv"
OUT = ROOT / "src" / "data" / "medium-taxonomy.json"

OTHER_TIER1 = "Other"
# Same hard-delimiter split as export_grid_facets_docs.py (a composite phrase
# like "oil on canvas" stays one token; "and"/"with"/"on" are NOT split points).
MEDIUM_SPLIT = re.compile(r"[;,/|\r\n]")


def load_master_lookup() -> dict[str, dict]:
    """token -> {canonical, facet_final} from the local master_v2.tsv."""
    out: dict[str, dict] = {}
    with MASTER_V2.open() as f:
        for r in csv.DictReader(f, delimiter="\t"):
            tok = (r.get("token") or "").strip().lower()
            if tok:
                out.setdefault(
                    tok,
                    {
                        "canonical": (r.get("canonical_final") or "").strip(),
                        "facet_final": (r.get("facet_final") or "").strip(),
                    },
                )
    return out


def load_curated_rows() -> list[dict]:
    return [
        {"tier1": r[0], "tier2": r[1], "tier3": r[2], "leaf": r[3]}
        for r in build_curated_rows()[1:]
    ]


def classify_doc(
    medium: str, master: dict, clf: Tier1Classifier
) -> set[tuple[str, str, str]]:
    """Distinct (t1, t2, t3) nodes for one object's medium string, ancestors
    collapsed the same way the export does so parents roll up cleanly."""
    seen: set[tuple[str, str, str]] = set()
    for part in MEDIUM_SPLIT.split((medium or "").lower()):
        tok = part.strip()
        if not tok:
            continue
        m = master.get(tok, {})
        p = clf.classify(
            tok, canonical=m.get("canonical", ""), facet_final=m.get("facet_final", "")
        )
        t2 = "" if p.tier2.lower() == p.tier1.lower() else p.tier2
        t3 = "" if p.tier3.lower() in (p.tier2.lower(), p.tier1.lower()) else p.tier3
        seen.add((p.tier1, t2, t3))
    # Drop Other residue when a real group is present (mirrors the export).
    if any(t1 != OTHER_TIER1 for (t1, _, _) in seen):
        seen = {n for n in seen if n[0] != OTHER_TIER1}
    return seen


def main() -> None:
    master = load_master_lookup()
    clf = Tier1Classifier(load_curated_rows())
    print(f"crosswalk: {len(master)} master_v2 tokens", flush=True)

    print(f"Streaming media from {PARQUET.name} …", flush=True)
    query = f"""
        COPY (
            SELECT medium FROM read_parquet('{PARQUET}')
            WHERE medium IS NOT NULL
        ) TO '/dev/stdout' (FORMAT JSON);
    """
    proc = subprocess.run(
        ["duckdb", "-c", query], capture_output=True, text=True, check=True
    )
    lines = [ln for ln in proc.stdout.splitlines() if ln.strip()]
    print(f"  {len(lines):,} objects with a medium", flush=True)

    # Distinct-object counts per node, rolled up: an object increments Tier-1,
    # Tier-2 and Tier-3 once each for every distinct path it touches.
    t1c: dict[str, int] = {}
    t2c: dict[tuple[str, str], int] = {}
    t3c: dict[tuple[str, str, str], int] = {}
    for i, line in enumerate(lines):
        medium = json.loads(line).get("medium") or ""
        nodes = classify_doc(medium, master, clf)
        t1s = {n[0] for n in nodes}
        t2s = {(n[0], n[1]) for n in nodes if n[1]}
        t3s = {n for n in nodes if n[2]}
        for t1 in t1s:
            t1c[t1] = t1c.get(t1, 0) + 1
        for k in t2s:
            t2c[k] = t2c.get(k, 0) + 1
        for k in t3s:
            t3c[k] = t3c.get(k, 0) + 1
        if (i + 1) % 20000 == 0:
            print(f"  classified {i + 1:,}/{len(lines):,}", flush=True)

    # Assemble the nested tree, count-desc within each tier (Other pinned last).
    def kids_t3(t1: str, t2: str) -> list[dict]:
        rows = [(t3, c) for (a, b, t3), c in t3c.items() if a == t1 and b == t2]
        rows.sort(key=lambda x: (-x[1], x[0]))
        return [{"value": t3, "count": c, "children": []} for t3, c in rows]

    def kids_t2(t1: str) -> list[dict]:
        rows = [(t2, c) for (a, t2), c in t2c.items() if a == t1]
        rows.sort(key=lambda x: (-x[1], x[0]))
        return [
            {"value": t2, "count": c, "children": kids_t3(t1, t2)} for t2, c in rows
        ]

    tier1_rows = sorted(t1c.items(), key=lambda x: (-x[1], x[0]))
    tree = [
        {"value": t1, "count": c, "children": kids_t2(t1)}
        for t1, c in tier1_rows
        if t1 != OTHER_TIER1
    ]
    if OTHER_TIER1 in t1c:  # pin Other to the bottom
        tree.append(
            {
                "value": OTHER_TIER1,
                "count": t1c[OTHER_TIER1],
                "children": kids_t2(OTHER_TIER1),
            }
        )

    OUT.write_text(json.dumps(tree, ensure_ascii=False, indent="\t") + "\n")
    n_nodes = len(t1c) + len(t2c) + len(t3c)
    print(f"Done. {len(tree)} Tier-1, {n_nodes} nodes total -> {OUT}", flush=True)
    for t1, c in tier1_rows:
        print(f"    {t1:22} {c:>7,}", flush=True)


if __name__ == "__main__":
    main()
