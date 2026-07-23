#!/usr/bin/env python3
"""Export a real-data slice from the -real pipeline parquet for the
search-results `grid-facets` variation, with curator-taxonomy facets
baked on.

Two real, curator-reviewed facets are pre-derived per object so the
wireframe just reads ready-made arrays:

  facet_place[]      hierarchical: {region, country, state, notable} from
                     the REGION_REMAP workbook, keyed on each place term's
                     Getty TGN `cn` code. `state` is US-only (empty elsewhere).
  facet_medium[]     3-level {section, subcategory, specific} paths mapping the
                     curators' 12-Tier-1 MATERIAL-GROUP medium taxonomy
                     (Prints, Ink & drawing media, Textiles & fiber, Paint &
                     pigment, Paper & parchment, Ceramic, Glass, Stone, Metal,
                     Organic, Inorganic, Other) → Tier-1/2/3. `section`=Tier-1,
                     `subcategory`=Tier-2, `specific`=Tier-3. Each object's raw
                     `medium` string is split on hard delimiters (comma,
                     semicolon, slash, pipe, newline — NOT "and"/"with"/"on",
                     matching probe_medium_full_list.py), each token lowercased
                     and resolved by Tier1Classifier (the same full-coverage
                     classifier that push_tier1_full_coverage_sheet.py pushes to
                     the "12-Tier-1 full map" tab): curated exact override →
                     high-priority composite rule → not_medium → keyword derived
                     from the curated leaves → supplementary root → Other.

Slice = objects with geography AND at least one classified medium, capped to
TARGET docs and balanced across place-regions so every left-column facet
populates without committing the whole collection. Output: one JSON per object
in src/data/grid-facets-docs/, matching the sample-doc shape.

Prereqs: `~/Downloads/MediumFilterTaxonomy-12Tier1Terms.xlsx` (the curated head,
read locally by push_tier1_medium_map_sheet.build_rows) + the local
material_master_v2.tsv (token → canonical_final + facet_final, from
scripts/pull_taxonomy_sheets.py). Then:

    uv run --with polars --with openpyxl python scripts/export_grid_facets_docs.py
"""

import csv
import json
import re
import shutil
import subprocess
from pathlib import Path

# Support running as a plain script (no package parent on sys.path). Only retry
# for a missing local-module import; a ModuleNotFoundError from inside those
# modules must surface, not be masked by the shim.
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

# Tier-1 "Other" is the catch-all group (unresolved / not-a-medium tokens land
# here); dropped from a doc's facet_medium when a real material group is present.
OTHER_TIER1 = "Other"

ROOT = Path(__file__).resolve().parent.parent
PARQUET = Path(
    "/Users/lukew/git/famsf-collections/collection-flow-famsf-real/"
    "output/collection_documents.parquet"
)
TSV = ROOT / "src" / "data" / "taxonomy-tsv"
MASTER_V2 = TSV / "material_master_v2.tsv"
OUT_DIR = ROOT / "src" / "data" / "grid-facets-docs"

CONSTITUENT_KEY_MAP = {
    "constituent_id": "ConstituentID",
    "role": "Role",
    "role_id": "RoleID",
    "display_name": "DisplayName",
    "alpha_sort": "AlphaSort",
    "nationality": "Nationality",
    "begin_date": "BeginDate",
    "end_date": "EndDate",
    "display_date": "DisplayDate",
    "institution": "Institution",
    "constituent_type": "ConstituentType",
    "display_order": "DisplayOrder",
    "display_label": "DisplayLabel",
}

PLACE_KEYS = ("term_place_of_creation", "term_related_geography")
# Split the raw medium string into tokens on HARD delimiters only (comma,
# semicolon, slash, pipe, newline), matching probe_medium_full_list.py. A
# composite phrase like "oil on canvas" stays ONE token; connective words
# ("and"/"with"/"on") are deliberately NOT split points.
MEDIUM_SPLIT = re.compile(r"[;,/|\r\n]")

# cap the committed slice; balance per place-region so the facets stay varied
TARGET = 600
PER_REGION_CAP = 90


def _rows(path: Path) -> list[dict]:
    with path.open() as f:
        return list(csv.DictReader(f, delimiter="\t"))


def load_master_lookup() -> dict[str, dict]:
    """Lower-cased medium token -> {canonical, facet_final}, the classifier's
    per-token context. From the local material_master_v2.tsv (the full token
    universe with curator canonicalisation + the not_medium flag)."""
    out: dict[str, dict] = {}
    for r in _rows(MASTER_V2):
        tok = (r.get("token") or "").strip().lower()
        if not tok:
            continue
        out.setdefault(
            tok,
            {
                "canonical": (r.get("canonical_final") or "").strip(),
                "facet_final": (r.get("facet_final") or "").strip(),
            },
        )
    return out


def load_curated_rows() -> list[dict]:
    """The curated 12-Tier-1 head as dicts the Tier1Classifier consumes."""
    return [
        {"tier1": r[0], "tier2": r[1], "tier3": r[2], "leaf": r[3]}
        for r in build_curated_rows()[1:]  # skip header
    ]


def build_place_crosswalk() -> dict[str, dict]:
    """TGN `cn` -> {"region", "country", "state", "notable"} from REGION_REMAP.

    `state` is the US-only tier (ADR 0002 amend): the SQL bakes it onto every
    US row (a US city row carries its parent state), so this is a flat lookup.

    `region` can hold multiple `;`-separated values (e.g. Mexico/Guatemala
    places that belong under both North America and Central America); the
    caller fans a multi-region row out into one facet_place entry per region.
    """
    by_cn: dict[str, dict] = {}
    for r in _rows(TSV / "place_region_remap.tsv"):
        cn = (r.get("cn") or "").strip()
        if not cn:
            continue
        region = (r.get("region_curator_fix") or "").strip() or (
            r.get("region_auto") or ""
        ).strip()
        country = (r.get("country") or "").strip()
        state = (r.get("state") or "").strip()
        tier = (r.get("tier") or "").strip()
        display = (
            (r.get("override_label") or "").strip()
            or (r.get("display_label") or "").strip()
            or (r.get("label") or "").strip()
        )
        by_cn[cn] = {
            "region": region,
            "country": country,
            "state": state,
            "notable": display if tier == "notable place" else "",
        }
    return by_cn


def medium_tokens(doc: dict) -> list[str]:
    """Lower-cased tokens from the raw `medium` string, hard-delimiter split.

    Order-preserving + deduped so the first classification of each distinct
    token wins deterministically.
    """
    seen: set[str] = set()
    out: list[str] = []
    for part in MEDIUM_SPLIT.split((doc.get("medium") or "").lower()):
        p = part.strip()
        if p and p not in seen:
            seen.add(p)
            out.append(p)
    return out


def derive_facets(
    doc: dict,
    master_lookup: dict,
    classifier: Tier1Classifier,
    place_xwalk: dict,
) -> tuple[dict, bool]:
    # Medium is one 3-level MATERIAL-GROUP facet: Tier-1 -> Tier-2 -> Tier-3,
    # mapped onto {section, subcategory, specific} (shape unchanged from the old
    # object-type facet, so the wireframe tree reads it as-is).
    media: dict[tuple[str, str, str], None] = {}
    for tok in medium_tokens(doc):
        m = master_lookup.get(tok, {})
        path = classifier.classify(
            tok,
            canonical=m.get("canonical", ""),
            facet_final=m.get("facet_final", ""),
        )
        if path.suppressed:
            continue
        # Collapse a level that merely repeats its ancestor so the tree never
        # shows a child identical to its parent — case-insensitively, since the
        # curated exact-match path can echo the lowercased token as Tier-3
        # ("silk" under "Silk"). Metal / Metal / Metal, Silk / silk both collapse.
        subcategory = "" if path.tier2.lower() == path.tier1.lower() else path.tier2
        specific = (
            ""
            if path.tier3.lower() in (path.tier2.lower(), path.tier1.lower())
            else path.tier3
        )
        media[(path.tier1, subcategory, specific)] = None

    # Drop the "Other / unclassified" residue when the object already has a real
    # medium group: an object that is Textile + Other doesn't need the Other tag.
    # Other survives only for objects nothing else matched.
    if any(sec != OTHER_TIER1 for (sec, _, _) in media):
        media = {k: None for k in media if k[0] != OTHER_TIER1}

    # place: walk each term's TGN ancestry, map the deepest mapped `cn`.
    places: list[dict] = []
    seen_place: set[tuple] = set()
    for key in PLACE_KEYS:
        for term in doc.get(key) or []:
            mapped = None
            for node in term.get("path") or []:
                cn = (node.get("cn") or "").strip()
                if cn in place_xwalk:
                    mapped = place_xwalk[
                        cn
                    ]  # deepest mapped node wins (path is shallow→deep)
            if not mapped or not mapped["region"]:
                continue
            # A place shared across two regions (e.g. Mexico/Guatemala under
            # both North America and Central America) fans out to one
            # facet_place entry per region so it shows under each branch.
            for region in mapped["region"].split(";"):
                region = region.strip()
                if not region:
                    continue
                # Collapse a country that just repeats its region (REGION_REMAP
                # leaves country == region when no distinct country is assigned),
                # so the tree never shows a child identical to its parent.
                country = mapped["country"] if mapped["country"] != region else ""
                # US-only state tier. Drop it if it just repeats region/country.
                state = mapped.get("state", "")
                if state in (country, region):
                    state = ""
                notable = mapped["notable"] or (
                    term["term"] if term.get("term") != mapped["country"] else ""
                )
                # Same guard one tier down: drop a notable that repeats any
                # ancestor (state included — a US state node has no distinct
                # notable child).
                if notable in (state, country, region):
                    notable = ""
                keyt = (region, country, state, notable)
                if keyt in seen_place:
                    continue
                seen_place.add(keyt)
                places.append(
                    {
                        "region": region,
                        "country": country,
                        "state": state,
                        "notable": notable,
                    }
                )

    doc["facet_medium"] = [
        {
            "section": format_label(sec),
            "subcategory": format_label(sub),
            "specific": format_label(spec),
        }
        for (sec, sub, spec) in sorted(media, key=lambda x: (x[0], x[1], x[2]))
    ]
    doc.pop("facet_material", None)
    doc.pop("facet_technique", None)
    doc["facet_place"] = places
    has_facets = bool(media) and bool(places)
    return doc, has_facets


def main() -> None:
    master_lookup = load_master_lookup()
    classifier = Tier1Classifier(load_curated_rows())
    place_xwalk = build_place_crosswalk()
    print(
        f"crosswalks: {len(master_lookup)} master_v2 medium tokens, "
        f"{len(place_xwalk)} place TGN nodes",
        flush=True,
    )

    print(f"Reading {PARQUET} …", flush=True)
    query = f"""
        COPY (
            SELECT *
            FROM read_parquet('{PARQUET}')
            WHERE (len(term_place_of_creation) > 0 OR len(term_related_geography) > 0)
              AND medium IS NOT NULL
            ORDER BY id
        ) TO '/dev/stdout' (FORMAT JSON);
    """
    proc = subprocess.run(
        ["duckdb", "-c", query], capture_output=True, text=True, check=True
    )
    lines = [ln for ln in proc.stdout.splitlines() if ln.strip()]
    print(f"Candidate docs (geo + medium): {len(lines)}", flush=True)

    # Pass 1 — collect every qualifying doc with its derived facets.
    candidates: list[dict] = []
    for i, line in enumerate(lines):
        doc = json.loads(line)
        doc["constituents"] = [
            {CONSTITUENT_KEY_MAP.get(k, k): v for k, v in c.items()}
            for c in (doc.get("constituents") or [])
        ]
        # Top-level `culture` (tribes + ancient civilisations) is carried
        # straight through from the parquet (SELECT *); normalise empty -> null.
        culture = doc.get("culture")
        doc["culture"] = culture if (culture or "").strip() else None
        doc, keep = derive_facets(doc, master_lookup, classifier, place_xwalk)
        if keep:
            candidates.append(doc)
        if (i + 1) % 20000 == 0:
            print(
                f"  scanned {i + 1}/{len(lines)}, qualifying {len(candidates)}",
                flush=True,
            )
    print(f"Qualifying docs: {len(candidates)}", flush=True)

    # Pass 2 — balance across the primary place-region, round-robin, richest
    # first within each region, so no single region floods the slice.
    def richness(d: dict) -> int:
        return (
            len(d["facet_medium"])
            + len(d["facet_place"])
            + (5 if d.get("has_image") else 0)
            + (3 if d.get("primary_artist") else 0)
        )

    by_region: dict[str, list[dict]] = {}
    for d in candidates:
        region = d["facet_place"][0]["region"] if d["facet_place"] else "Other"
        by_region.setdefault(region, []).append(d)
    for region, docs in by_region.items():
        docs.sort(key=richness, reverse=True)
        del docs[PER_REGION_CAP:]

    picked: list[dict] = []
    cursors = {r: 0 for r in by_region}
    while len(picked) < TARGET and any(
        cursors[r] < len(by_region[r]) for r in by_region
    ):
        for region in sorted(by_region):
            if len(picked) >= TARGET:
                break
            c = cursors[region]
            if c < len(by_region[region]):
                picked.append(by_region[region][c])
                cursors[region] = c + 1

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    for doc in picked:
        mats = [
            m["specific"] or m["subcategory"] or m["section"]
            for m in doc["facet_medium"]
        ]
        plc = [p["notable"] or p["country"] or p["region"] for p in doc["facet_place"]]
        doc["_sample_meta"] = {
            "reason": (
                f"grid-facets real slice — {', '.join(mats[:4])}"
                f"{' …' if len(mats) > 4 else ''}"
                f" · {', '.join(plc[:3])}"
            ),
            "source": "collection_documents.parquet + curator taxonomy workbooks",
            "populated_fields": sum(1 for v in doc.values() if v not in (None, [], "")),
        }
        (OUT_DIR / f"{doc.get('id')}.json").write_text(
            json.dumps(doc, ensure_ascii=False, indent="\t") + "\n"
        )

    regions = ", ".join(f"{r}:{cursors[r]}" for r in sorted(cursors) if cursors[r])
    print(f"Done. wrote {len(picked)} docs -> {OUT_DIR}", flush=True)
    print(f"  per region: {regions}", flush=True)


if __name__ == "__main__":
    main()
