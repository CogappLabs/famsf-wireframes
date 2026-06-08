#!/usr/bin/env python3
"""Pull the live curator taxonomy workbooks (Place REGION_REMAP + Material
rollup) to TSV via cogapp-sheets (ADC-authed).

Run after `gcloud auth application-default login`:

    uv run --with google-api-python-client --with google-auth \
        --with-editable ~/git/cogapp-sheets \
        python scripts/pull_taxonomy_sheets.py
"""

import sys
from pathlib import Path

from cogapp_sheets import Client, pull_to_tsv

PLACE_SHEET = "1_uqqeFeUViwDKUYWGCfjLesqA-tA8Uwe8siqWKrR0z0"
MATERIAL_SHEET = "14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI"

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "taxonomy-tsv"


def list_tabs(client: Client) -> list[str]:
    meta = client.meta(fields="sheets(properties(title))")
    return [s["properties"]["title"] for s in meta.get("sheets", [])]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    place = Client(PLACE_SHEET)
    print("Place workbook tabs:", list_tabs(place), flush=True)

    material = Client(MATERIAL_SHEET)
    print("Material workbook tabs:", list_tabs(material), flush=True)

    # Pull the deliverable tabs. Tab names confirmed from the listing above;
    # adjust here if the curator renamed them.
    targets = [
        (place, "REGION_REMAP", OUT / "place_region_remap.tsv"),
        # Material facet: master_v2 (token -> canonical + facet_final) joined to
        # FACET_DESIGN_v2 (parent/specific 2-tier design) drives the 2-tier
        # Material + flat Technique facets. FACET_PUBLIC_v2 kept for reference.
        (material, "master_v2", OUT / "material_master_v2.tsv"),
        (material, "FACET_DESIGN_v2", OUT / "material_FACET_DESIGN_v2.tsv"),
        (material, "FACET_PUBLIC_v2", OUT / "material_remap.tsv"),
    ]
    for client, tab, path in targets:
        try:
            n = pull_to_tsv(client, tab, path)
            print(f"  pulled {n} rows from {tab!r} -> {path.name}", flush=True)
        except Exception as e:  # noqa: BLE001 - one-off pull, report and continue
            print(f"  FAILED {tab!r}: {e}", flush=True)


if __name__ == "__main__":
    main()
