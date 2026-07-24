#!/usr/bin/env python3
"""Data-driven medium-facet transform: parquet + token map -> facet tree.

Shaped like the Dagster asset the `-real` pipeline will eventually run: a pure
transform of two inputs (the collection parquet + a frozen token->path mapping)
into the facet outputs, with no classifier heuristics at runtime. The heuristics
were baked into `medium-token-map.json` once by build_medium_token_map.py; here
we only look each token up and roll the results into a tree.

Editing the medium facet is now editing the JSON map, not Python: change a
token's answer in medium-token-map.json (or re-bake it from the sheet with
build_medium_token_map.py) and re-run this.

  transform(medium_strings, token_map) -> nested tree
    [{ value, count, children: [{ value, count, children: [...] }] }]

Distinct-object counts per node, rolled up (an object counts once per node no
matter how many of its tokens land there). Output: src/data/medium-taxonomy.json.

Run (wireframes repo root):

    uv run python scripts/build_medium_facet.py
"""

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARQUET = Path(
    "/Users/lukew/git/famsf-collections/collection-flow-famsf-real/"
    "output/collection_documents.parquet"
)
TOKEN_MAP = ROOT / "src" / "data" / "medium-token-map.json"
OUT = ROOT / "src" / "data" / "medium-taxonomy.json"

OTHER_TIER1 = "Other"
MEDIUM_SPLIT = re.compile(r"[;,/|\r\n]")


def load_token_map() -> dict[str, dict]:
    return json.loads(TOKEN_MAP.read_text())


def doc_nodes(medium: str, token_map: dict) -> set[tuple[str, str, str]]:
    """Distinct (section, subcategory, specific) nodes for one object's medium.

    Unknown tokens (not in the frozen map) fall to Other, matching the map's own
    unresolved handling. Other residue is dropped once a real group is present.
    """
    seen: set[tuple[str, str, str]] = set()
    for part in MEDIUM_SPLIT.split((medium or "").lower()):
        tok = part.strip()
        if not tok:
            continue
        entry = token_map.get(tok)
        if entry is None:
            seen.add((OTHER_TIER1, "", ""))
            continue
        if entry.get("suppress"):
            continue
        seen.add(
            (
                entry.get("section", OTHER_TIER1),
                entry.get("subcategory", ""),
                entry.get("specific", ""),
            )
        )
    if any(sec != OTHER_TIER1 for (sec, _, _) in seen):
        seen = {n for n in seen if n[0] != OTHER_TIER1}
    return seen


def transform(medium_strings: list[str], token_map: dict) -> list[dict]:
    """The asset body: media strings + map -> nested count tree."""
    t1c: dict[str, int] = {}
    t2c: dict[tuple[str, str], int] = {}
    t3c: dict[tuple[str, str, str], int] = {}
    for i, medium in enumerate(medium_strings):
        nodes = doc_nodes(medium, token_map)
        for t1 in {n[0] for n in nodes}:
            t1c[t1] = t1c.get(t1, 0) + 1
        for k in {(n[0], n[1]) for n in nodes if n[1]}:
            t2c[k] = t2c.get(k, 0) + 1
        for k in {n for n in nodes if n[2]}:
            t3c[k] = t3c.get(k, 0) + 1
        if (i + 1) % 20000 == 0:
            print(f"  counted {i + 1:,}/{len(medium_strings):,}", flush=True)

    # Labels in the map are already DISPLAY-formatted, so assemble directly.
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
    return tree


def load_media() -> list[str]:
    query = f"""
        COPY (
            SELECT medium FROM read_parquet('{PARQUET}')
            WHERE medium IS NOT NULL
        ) TO '/dev/stdout' (FORMAT JSON);
    """
    proc = subprocess.run(
        ["duckdb", "-c", query], capture_output=True, text=True, check=True
    )
    return [
        json.loads(ln).get("medium") or ""
        for ln in proc.stdout.splitlines()
        if ln.strip()
    ]


def main() -> None:
    token_map = load_token_map()
    print(f"token map: {len(token_map):,} entries", flush=True)
    media = load_media()
    print(f"objects with a medium: {len(media):,}", flush=True)

    tree = transform(media, token_map)
    OUT.write_text(json.dumps(tree, ensure_ascii=False, indent="\t") + "\n")
    n_nodes = sum(
        1 + len(t2["children"]) for t1 in tree for t2 in t1["children"]
    ) + len(tree)
    print(f"Done. {len(tree)} Tier-1, ~{n_nodes} nodes -> {OUT}", flush=True)
    for t1 in tree:
        print(f"    {t1['value']:22} {t1['count']:>7,}", flush=True)


if __name__ == "__main__":
    main()
