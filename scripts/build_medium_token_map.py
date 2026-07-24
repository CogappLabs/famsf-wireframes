#!/usr/bin/env python3
"""Bake the medium classifier into a flat token -> facet-path mapping.

The `Tier1Classifier` heuristic chain (curated head + normalisation buckets +
keyword/supplementary passes) was the right tool to *bootstrap* the medium facet
before curators had reviewed it. Now that the Cogapp medium-filter review is in,
the resolution of each token is settled, so we freeze it: run the classifier once
over every distinct medium token in the collection and write the final, curator-
reviewed answer to a flat JSON map.

Downstream (build_medium_facet.py) then does a plain dict lookup instead of
re-running the heuristics — which is both faster and much closer to what the
`-real` Dagster pipeline will do: read parquet, apply a mapping, emit the facet.
Curators refine the map by editing the JSON (or the upstream sheet + re-baking).

Output: src/data/medium-token-map.json
  { "<raw lower-cased token>": {section, subcategory, specific} }
  { "<raw lower-cased token>": {suppress: true} }         # dropped from the facet
Values are the DISPLAY-formatted, ancestor-collapsed path (what the facet renders),
so the transform never touches label_format or the collapse rules again.

Run (wireframes repo root):

    uv run --with openpyxl python scripts/build_medium_token_map.py
"""

import json
import re
import subprocess
from pathlib import Path

try:
    from material_taxonomy.label_format import format_label
    from material_taxonomy.tier1_classifier import Tier1Classifier
    from push_tier1_medium_map_sheet import build_rows as build_curated_rows
except ModuleNotFoundError as exc:  # pragma: no cover - script-invocation shim
    if exc.name not in ("material_taxonomy", "push_tier1_medium_map_sheet"):
        raise
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from material_taxonomy.label_format import format_label
    from material_taxonomy.tier1_classifier import Tier1Classifier
    from push_tier1_medium_map_sheet import build_rows as build_curated_rows

import csv

ROOT = Path(__file__).resolve().parent.parent
PARQUET = Path(
    "/Users/lukew/git/famsf-collections/collection-flow-famsf-real/"
    "output/collection_documents.parquet"
)
TSV = ROOT / "src" / "data" / "taxonomy-tsv"
MASTER_V2 = TSV / "material_master_v2.tsv"
OUT = ROOT / "src" / "data" / "medium-token-map.json"

OTHER_TIER1 = "Other"
# Same hard-delimiter split the consumers use (a composite phrase like
# "oil on canvas" stays one token; "and"/"with"/"on" are NOT split points).
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


def distinct_tokens() -> list[str]:
    """Every distinct hard-split medium token across the whole collection."""
    query = f"""
        COPY (
            SELECT medium FROM read_parquet('{PARQUET}')
            WHERE medium IS NOT NULL
        ) TO '/dev/stdout' (FORMAT JSON);
    """
    proc = subprocess.run(
        ["duckdb", "-c", query], capture_output=True, text=True, check=True
    )
    toks: set[str] = set()
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        medium = json.loads(line).get("medium") or ""
        for part in MEDIUM_SPLIT.split(medium.lower()):
            tok = part.strip()
            if tok:
                toks.add(tok)
    return sorted(toks)


def resolve(tok: str, master: dict, clf: Tier1Classifier) -> dict:
    """Classify one token to its final DISPLAY path (or {suppress: true})."""
    m = master.get(tok, {})
    p = clf.classify(
        tok, canonical=m.get("canonical", ""), facet_final=m.get("facet_final", "")
    )
    if p.suppressed:
        return {"suppress": True}
    # Collapse a level that merely repeats its ancestor (case-insensitive), as
    # both consumers did inline, so the frozen value is render-ready.
    sub = "" if p.tier2.lower() == p.tier1.lower() else p.tier2
    spec = "" if p.tier3.lower() in (p.tier2.lower(), p.tier1.lower()) else p.tier3
    return {
        "section": format_label(p.tier1),
        "subcategory": format_label(sub),
        "specific": format_label(spec),
    }


def main() -> None:
    master = load_master_lookup()
    clf = Tier1Classifier(load_curated_rows())
    toks = distinct_tokens()
    print(f"{len(toks):,} distinct medium tokens; classifying once …", flush=True)

    mapping: dict[str, dict] = {}
    suppressed = 0
    other = 0
    for i, tok in enumerate(toks):
        r = resolve(tok, master, clf)
        mapping[tok] = r
        if r.get("suppress"):
            suppressed += 1
        elif r.get("section") == OTHER_TIER1:
            other += 1
        if (i + 1) % 5000 == 0:
            print(f"  {i + 1:,}/{len(toks):,}", flush=True)

    OUT.write_text(json.dumps(mapping, ensure_ascii=False, indent="\t") + "\n")
    print(
        f"Done. {len(mapping):,} tokens -> {OUT.name} "
        f"({suppressed:,} suppressed, {other:,} Other)",
        flush=True,
    )


if __name__ == "__main__":
    main()
