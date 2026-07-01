"""Build the FAMSF medium taxonomy from the full TMS token list + Getty AAT.

Maps every distinct TMS medium token to a 3-level facet path organised by
**object type** (Print, Drawing, Painting, Photograph, Sculpture, Textile,
Ceramic & glass, Decorative & other) - how a visitor browses - while keeping the
verbatim TMS term for object-page display. Every token is mapped, so faceting is
total.

Pipeline:

  1. `probe_medium_full_list.py` (in collection-flow-famsf-real) dumps the full
     TMS medium vocabulary to output/medium_tokens.tsv.
  2. `aat_xml_to_parquet.py` flattens the Getty AAT dump to aat_index.parquet.
  3. This script joins the two, runs the MaterialClassifier (see the
     material_taxonomy module), and writes:

       token_facet_map.tsv   crosswalk: token -> section/subcategory/specific +
                             facet + object_count + aat_id + source
       facet_sections.tsv    the 3-level tree rolled up per leaf, for the UI

The classifier logic + curated keyword tables live in the `material_taxonomy`
package so they can be unit-tested and edited independently of this driver.

Run (from the wireframes repo root):

    uv run --with polars python scripts/build_material_taxonomy.py
"""

from pathlib import Path

import polars as pl

# Support running as a plain script (no package parent on sys.path). Only retry
# for a missing *material_taxonomy* import; a ModuleNotFoundError from inside the
# package (e.g. a missing dependency) must surface, not be masked by the shim.
try:
    from material_taxonomy import MaterialClassifier
except ModuleNotFoundError as exc:  # pragma: no cover - script-invocation shim
    if exc.name != "material_taxonomy":
        raise
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from material_taxonomy import MaterialClassifier

ROOT = Path(__file__).resolve().parent.parent
TSV = ROOT / "src" / "data" / "taxonomy-tsv"
AAT_INDEX = TSV / "aat_index.parquet"
TOKENS = ROOT.parent / "collection-flow-famsf-real" / "output" / "medium_tokens.tsv"

OUT_MAP = TSV / "token_facet_map.tsv"
OUT_TREE = TSV / "facet_sections.tsv"


def load_aat() -> pl.DataFrame:
    """Preferred AAT term rows that carry a facet, one row per term (de-duped).

    A term string can map to several concepts; keep the faceted, preferred sense
    and, among those, the lowest subject_id for determinism.
    """
    return (
        pl.read_parquet(AAT_INDEX)
        .filter((pl.col("is_preferred")) & (pl.col("facet") != ""))
        .sort(["term", "subject_id"])
        .unique(subset=["term"], keep="first")
        .select("term", "facet", "subject_id", "parent_string", "pref_label")
    )


def load_tokens() -> pl.DataFrame:
    """Distinct TMS medium tokens with a normalised lower-cased key."""
    return (
        pl.read_csv(TOKENS, separator="\t")
        .with_columns(
            token_lc=pl.col("token").str.to_lowercase().str.strip_chars(" ,;/|")
        )
        .filter(pl.col("token_lc") != "")
    )


def classify_tokens(
    tokens: pl.DataFrame, aat: pl.DataFrame, classifier: MaterialClassifier
) -> pl.DataFrame:
    """Left-join tokens to AAT and resolve each to a facet path.

    Row-wise Python over the collected frame is fine: ~24K rows, all small.
    """
    joined = tokens.join(
        aat.rename({"term": "token_lc"}), on="token_lc", how="left"
    ).with_columns(
        facet=pl.col("facet").fill_null(""),
        parent_string=pl.col("parent_string").fill_null(""),
        aat_id=pl.col("subject_id").fill_null(""),
        pref_label=pl.col("pref_label").fill_null(""),
    )

    out = []
    for r in joined.select(
        "token",
        "token_lc",
        "object_count",
        "facet",
        "aat_id",
        "parent_string",
        "pref_label",
    ).iter_rows(named=True):
        path = classifier.classify(
            r["token_lc"],
            aat_facet=r["facet"],
            chain=r["parent_string"],
            aat_label=r["pref_label"],
        )
        out.append(
            {
                "token": r["token"],  # verbatim TMS term (object-page display)
                "token_lc": r["token_lc"],
                "object_count": r["object_count"],
                "facet": r["facet"] or "",
                "section": path.section,
                "subcategory": path.subcategory,
                "specific": path.specific,
                "aat_id": r["aat_id"],
                "source": path.source,
            }
        )
    return pl.DataFrame(out).sort("object_count", descending=True)


def rollup_tree(fmap: pl.DataFrame) -> pl.DataFrame:
    """Section -> subcategory -> specific leaves with term + object counts."""
    return (
        fmap.group_by("section", "subcategory", "specific")
        .agg(tokens=pl.len(), objects=pl.col("object_count").sum())
        .sort("objects", descending=True)
    )


def _print_report(fmap: pl.DataFrame) -> None:
    """Coverage + mapping-source summary to stdout."""
    total = fmap["object_count"].sum() or 1
    print("\nSection coverage (by object volume):", flush=True)
    rep = (
        fmap.group_by("section")
        .agg(tokens=pl.len(), objects=pl.col("object_count").sum())
        .sort("objects", descending=True)
    )
    for row in rep.iter_rows(named=True):
        print(
            f"  {row['section']:<32} {row['tokens']:>6,} tokens  "
            f"{row['objects']:>9,} objects  {row['objects'] / total:>5.1%}",
            flush=True,
        )
    src = fmap.group_by("source").agg(n=pl.len()).sort("n", descending=True)
    print("\nMapping source:", flush=True)
    for row in src.iter_rows(named=True):
        print(f"  {row['source']:<10} {row['n']:>6,}", flush=True)


def main() -> None:
    """Build the crosswalk + tree and write both TSVs."""
    print(f"Loading AAT index from {AAT_INDEX} …", flush=True)
    aat = load_aat()
    print(f"  {aat.height:,} faceted AAT terms", flush=True)

    print(f"Loading TMS tokens from {TOKENS} …", flush=True)
    tokens = load_tokens()
    print(f"  {tokens.height:,} distinct tokens", flush=True)

    classifier = MaterialClassifier()
    fmap = classify_tokens(tokens, aat, classifier)
    fmap.write_csv(OUT_MAP, separator="\t")
    print(f"Wrote crosswalk: {fmap.height:,} tokens -> {OUT_MAP}", flush=True)

    tree = rollup_tree(fmap)
    tree.write_csv(OUT_TREE, separator="\t")
    print(
        f"Wrote tree: {tree.height:,} (section,subcat,specific) leaves -> {OUT_TREE}",
        flush=True,
    )

    _print_report(fmap)


if __name__ == "__main__":
    main()
