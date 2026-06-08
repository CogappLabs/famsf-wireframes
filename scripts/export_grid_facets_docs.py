#!/usr/bin/env python3
"""Export a real-data slice from the -real pipeline parquet for the
search-results `grid-facets` variation, with curator-taxonomy facets
baked on.

Three real, curator-reviewed facets are pre-derived per object so the
wireframe just reads ready-made arrays:

  facet_place[]      hierarchical: {region, country, notable} from the
                     REGION_REMAP workbook, keyed on each place term's
                     Getty TGN `cn` code.
  facet_material[]   2-tier {parent, specific} pairs (Metal → bronze,
                     Ceramic → earthenware …) from the FACET_DESIGN_v2
                     parent/specific design.
  facet_technique[]  flat Technique labels (Etching, Lithograph …).
                     Both via the Material workbook bridge: raw token ->
                     master_v2.canonical_final + facet_final -> joined to
                     FACET_DESIGN_v2; matched against term_materials + the
                     `medium` prose.

Slice = objects with geography AND at least one mapped material/technique,
capped to TARGET docs and balanced across place-regions so every left-column
facet populates without committing the whole collection. Output: one JSON
per object in src/data/grid-facets-docs/, matching the sample-doc shape.

Prereqs: run scripts/pull_taxonomy_sheets.py first (writes the TSVs under
src/data/taxonomy-tsv/). Then:

    uv run --no-project python scripts/export_grid_facets_docs.py
"""

import csv
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARQUET = Path(
    "/Users/lukew/git/famsf-collections/collection-flow-famsf-real/"
    "output/collection_documents.parquet"
)
TSV = ROOT / "src" / "data" / "taxonomy-tsv"
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
# split the free-text medium prose into candidate tokens for the crosswalk
MEDIUM_SPLIT = re.compile(r"[;,/()]| and | with | on | over | in ")

# cap the committed slice; balance per place-region so the facets stay varied
TARGET = 600
PER_REGION_CAP = 90


def _rows(path: Path) -> list[dict]:
    with path.open() as f:
        return list(csv.DictReader(f, delimiter="\t"))


def build_material_crosswalk() -> dict[str, dict]:
    """raw token -> facet hit, via the curator Material workbook.

    Authoritative bridge is `master_v2` (token -> canonical_final +
    facet_final) joined to `FACET_DESIGN_v2` (the 2-tier design: Material
    `specific` labels roll up to a `parent`; Technique labels are `flat`).

    Material hits carry both tiers:  {"facet": "Material", "parent", "specific"}
    Technique hits are flat:         {"facet": "Technique", "label"}
    """
    # DESIGN: specific material label -> parent; set of flat technique labels.
    spec_parent: dict[str, str] = {}
    tech_flat: set[str] = set()
    for r in _rows(TSV / "material_FACET_DESIGN_v2.tsv"):
        group = (r.get("facet_group") or "").strip()
        level = (r.get("level") or "").strip()
        label = (r.get("label") or "").strip()
        if group == "Material" and level == "specific":
            spec_parent[label.lower()] = r.get("parent", "").strip()
        elif group == "Technique" and level == "flat":
            tech_flat.add(label.lower())

    token_to_hit: dict[str, dict] = {}
    for r in _rows(TSV / "material_master_v2.tsv"):
        tok = (r.get("token") or "").strip().lower()
        canon = (r.get("canonical_final") or "").strip()
        facet = (r.get("facet_final") or "").strip()
        if not tok or not canon:
            continue
        cl = canon.lower()
        if facet == "material" and cl in spec_parent:
            token_to_hit.setdefault(
                tok,
                {"facet": "Material", "parent": spec_parent[cl], "specific": canon},
            )
        elif facet == "technique" and cl in tech_flat:
            token_to_hit.setdefault(tok, {"facet": "Technique", "label": canon})
    return token_to_hit


def build_place_crosswalk() -> dict[str, dict]:
    """TGN `cn` -> {"region", "country", "notable"} from REGION_REMAP."""
    by_cn: dict[str, dict] = {}
    for r in _rows(TSV / "place_region_remap.tsv"):
        cn = (r.get("cn") or "").strip()
        if not cn:
            continue
        region = (r.get("region_curator_fix") or "").strip() or (
            r.get("region_auto") or ""
        ).strip()
        country = (r.get("country") or "").strip()
        tier = (r.get("tier") or "").strip()
        display = (r.get("override_label") or "").strip() or (
            r.get("display_label") or ""
        ).strip() or (r.get("label") or "").strip()
        by_cn[cn] = {
            "region": region,
            "country": country,
            "notable": display if tier == "notable place" else "",
        }
    return by_cn


def material_tokens(doc: dict) -> set[str]:
    out: set[str] = set()
    for m in doc.get("term_materials") or []:
        if m.get("term"):
            out.add(m["term"].strip().lower())
    for part in MEDIUM_SPLIT.split((doc.get("medium") or "").lower()):
        p = part.strip()
        if p:
            out.add(p)
    return out


def derive_facets(doc: dict, mat_xwalk: dict, place_xwalk: dict) -> tuple[dict, bool]:
    # Material is 2-tier ({parent, specific}); technique is flat.
    materials: dict[tuple[str, str], None] = {}
    techniques: set[str] = set()
    for tok in material_tokens(doc):
        hit = mat_xwalk.get(tok)
        if not hit:
            continue
        if hit["facet"] == "Material":
            # Collapse a specific that just repeats its parent (FACET_DESIGN
            # has a "silk" specific under the "Silk" parent etc.), so the
            # tree never shows a child identical to its parent.
            specific = (
                ""
                if hit["specific"].strip().lower() == hit["parent"].strip().lower()
                else hit["specific"]
            )
            materials[(hit["parent"], specific)] = None
        else:
            techniques.add(hit["label"])

    # place: walk each term's TGN ancestry, map the deepest mapped `cn`.
    places: list[dict] = []
    seen_place: set[tuple] = set()
    for key in PLACE_KEYS:
        for term in doc.get(key) or []:
            mapped = None
            for node in term.get("path") or []:
                cn = (node.get("cn") or "").strip()
                if cn in place_xwalk:
                    mapped = place_xwalk[cn]  # deepest mapped node wins (path is shallow→deep)
            if not mapped or not mapped["region"]:
                continue
            region = mapped["region"]
            # Collapse a country that just repeats its region (REGION_REMAP
            # leaves country == region when no distinct country is assigned),
            # so the tree never shows a child identical to its parent.
            country = mapped["country"] if mapped["country"] != region else ""
            notable = mapped["notable"] or (
                term["term"] if term.get("term") != mapped["country"] else ""
            )
            # Same guard one tier down: drop a notable that repeats its
            # country or region.
            if notable in (country, region):
                notable = ""
            keyt = (region, country, notable)
            if keyt in seen_place:
                continue
            seen_place.add(keyt)
            places.append(
                {"region": region, "country": country, "notable": notable}
            )

    doc["facet_material"] = [
        {"parent": p, "specific": s}
        for (p, s) in sorted(materials, key=lambda x: (x[0], x[1]))
    ]
    doc["facet_technique"] = sorted(techniques)
    doc["facet_place"] = places
    has_facets = bool(materials or techniques) and bool(places)
    return doc, has_facets


def main() -> None:
    mat_xwalk = build_material_crosswalk()
    place_xwalk = build_place_crosswalk()
    print(
        f"crosswalks: {len(mat_xwalk)} material tokens, "
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
        doc, keep = derive_facets(doc, mat_xwalk, place_xwalk)
        if keep:
            candidates.append(doc)
        if (i + 1) % 20000 == 0:
            print(f"  scanned {i + 1}/{len(lines)}, qualifying {len(candidates)}", flush=True)
    print(f"Qualifying docs: {len(candidates)}", flush=True)

    # Pass 2 — balance across the primary place-region, round-robin, richest
    # first within each region, so no single region floods the slice.
    def richness(d: dict) -> int:
        return (
            len(d["facet_material"]) + len(d["facet_technique"]) + len(d["facet_place"])
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
        mats = [m["specific"] for m in doc["facet_material"]] + doc["facet_technique"]
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
