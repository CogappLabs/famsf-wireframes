#!/usr/bin/env python3
"""Bootstrap-only: seed src/data/medium-token-map.tsv from the classifier.

The runtime medium logic is the flat, hand-owned map (token -> path, or
{suppress: true}). This ran the `Tier1Classifier` once over ~24K distinct tokens
to generate a starting answer for each, so the map didn't have to be typed by
hand. Edit the map directly from here on; re-run this only to re-seed from
scratch — it OVERWRITES hand edits. Values are display-formatted + collapsed.

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
OUT = ROOT / "src" / "data" / "medium-token-map.tsv"

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
    """Classify one token to a TSV row: token + DISPLAY path + suppress flag."""
    m = master.get(tok, {})
    p = clf.classify(
        tok, canonical=m.get("canonical", ""), facet_final=m.get("facet_final", "")
    )
    if p.suppressed:
        return {
            "token": tok,
            "section": "",
            "subcategory": "",
            "specific": "",
            "suppress": "true",
        }
    # Collapse a level that merely repeats its ancestor (case-insensitive) so the
    # frozen value is render-ready, as both consumers did inline before.
    sub = "" if p.tier2.lower() == p.tier1.lower() else p.tier2
    spec = "" if p.tier3.lower() in (p.tier2.lower(), p.tier1.lower()) else p.tier3
    return {
        "token": tok,
        "section": format_label(p.tier1),
        "subcategory": format_label(sub),
        "specific": format_label(spec),
        "suppress": "false",
    }


def main() -> None:
    master = load_master_lookup()
    clf = Tier1Classifier(load_curated_rows())
    toks = distinct_tokens()
    print(f"{len(toks):,} distinct medium tokens; classifying once …", flush=True)

    rows = [resolve(tok, master, clf) for tok in toks]
    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["token", "section", "subcategory", "specific", "suppress"],
            delimiter="\t",
        )
        w.writeheader()
        w.writerows(rows)

    suppressed = sum(r["suppress"] == "true" for r in rows)
    other = sum(r["section"] == OTHER_TIER1 for r in rows)
    print(
        f"Done. {len(rows):,} tokens -> {OUT.name} "
        f"({suppressed:,} suppressed, {other:,} Other)",
        flush=True,
    )


if __name__ == "__main__":
    main()
