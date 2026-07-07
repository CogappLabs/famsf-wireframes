"""Normalise the master_v2 token column: strip LLM-split artefacts, merge counts.

master_v2's `token` column is fed by an upstream LLM noun-phrase split
(`raw_mediums_v2.suggested_split`) that grabs each phrase *with* its leading
determiner / connective, so a long descriptive medium string sheds fragments
like "a drawing", "the spine", "in color", "and crochet lace", plus structured
"a) gold tray" / "b) silk" residue. These orphan tokens then flow into the
12-Tier-1 full map and get mis-classified (the keyword pass matches "drawing"
inside "a drawing", "silver" inside "a) silver", etc.).

This script cleans the token universe at the master_v2 source:

  1. Strip a leading determiner/connective run (a / an / the / and / or / with /
     on / in / of / to / from / by / at) and any "a)"/"b." structured prefix.
  2. Strip a trailing dangling connective ("… and", "… with").
  3. Re-key rows by the cleaned token and MERGE: sum `count`, and for the other
     columns keep the value from the row that had the highest count (the most
     authoritative mapping wins; a bare "drawing" row outweighs "a drawing").

Because most orphans collapse onto a token that already exists ("a drawing" ->
"drawing", "the spine" -> "spine"), merging folds their object counts back into
the real token rather than dropping them. Tokens with no determiner are passed
through untouched, so composite phrases ("gelatin silver print", "oil on
canvas") are unaffected.

Writes the cleaned table back to master_v2 (same columns). Idempotent: a second
run is a no-op because cleaned tokens no longer carry a leading determiner.

Run (wireframes repo root, after `gcloud auth application-default login`):

    uv run --with-editable ~/git/cogapp-sheets python scripts/clean_master_v2_tokens.py
    # add --apply to write; default is a dry-run report
"""

import re
import sys

from cogapp_sheets import Client

SHEET_ID = "14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI"
TAB = "master_v2"

# Leading determiner / connective run: "a drawing" -> "drawing",
# "in brown ink" -> "brown ink", "and crochet lace" -> "crochet lace".
# Anchored + repeatable so "a) and silk" sheds both the a) and the "and".
# The structured-enumerator prefix matches the paren/period forms only:
#   "a) ", "b.", "a)", "a&b) ", "a-c) " — the multipart-object labels curators
# use. A bare "c-" is NOT an enumerator, so "c-print photograph" (a real
# photographic term) survives intact.
_ENUM = r"[a-e](?:\s*[&,\-]\s*[a-e])*[)\.]\s*"
_LEAD = re.compile(
    rf"^(?:{_ENUM}|(?:a|an|the|and|or|with|on|in|of|to|from|by|at)\b\s*)+", re.I
)
# Dangling trailing connective: "color woodcut triptych with" -> "… triptych".
_TRAIL = re.compile(r"\s+(?:and|or|with|the|a|of|in|on)\s*$", re.I)


def clean_token(raw: str) -> str:
    """Strip leading determiner/connective + structured prefixes + trailing conn."""
    t = (raw or "").strip()
    prev = None
    while prev != t:  # peel repeatedly: "a) and silk" -> "and silk" -> "silk"
        prev = t
        t = _LEAD.sub("", t).strip()
        t = _TRAIL.sub("", t).strip()
    return t


def main() -> None:
    apply = "--apply" in sys.argv
    client = Client(SHEET_ID)
    print(f"Reading '{TAB}' …", flush=True)
    vals = client.read(f"'{TAB}'!A1:I30000")
    header, rows = vals[0], vals[1:]
    n_cols = len(header)

    def cell(r: list, i: int) -> str:
        return r[i] if len(r) > i else ""

    # Merge by cleaned token; the highest-count contributor supplies the
    # non-count columns (its mapping is the most trustworthy).
    merged: dict[str, list] = {}
    changed = 0
    dropped_empty = 0
    for r in rows:
        raw = cell(r, 0)
        cleaned = clean_token(raw)
        if not cleaned:  # token was pure determiner junk ("the", "and")
            dropped_empty += 1
            continue
        if cleaned != raw.strip():
            changed += 1
        cnt = int(cell(r, 1)) if cell(r, 1).strip().lstrip("-").isdigit() else 0
        if cleaned not in merged:
            row = list(r) + [""] * (n_cols - len(r))
            row[0] = cleaned
            row[1] = cnt
            merged[cleaned] = row
        else:
            m = merged[cleaned]
            m_cnt = int(m[1]) if str(m[1]).lstrip("-").isdigit() else 0
            # keep the higher-count row's mapping columns
            if cnt > m_cnt:
                row = list(r) + [""] * (n_cols - len(r))
                row[0] = cleaned
                for i in range(2, n_cols):
                    merged[cleaned][i] = row[i]
            merged[cleaned][1] = m_cnt + cnt

    out = sorted(merged.values(), key=lambda x: int(x[1]), reverse=True)
    print(f"  {len(rows):,} rows in", flush=True)
    print(
        f"  {changed:,} tokens rewritten (leading/trailing junk stripped)", flush=True
    )
    print(
        f"  {dropped_empty:,} pure-junk tokens dropped (empty after strip)", flush=True
    )
    print(f"  {len(out):,} rows out ({len(rows) - len(out):,} merged away)", flush=True)

    # Show the biggest merges so a human can sanity-check before --apply.
    print("\n  Sample rewrites (raw -> cleaned):", flush=True)
    seen = 0
    for r in rows:
        raw = cell(r, 0)
        cleaned = clean_token(raw)
        if cleaned and cleaned != raw.strip():
            print(f"    {cell(r, 1):>6}  {raw!r:50} -> {cleaned!r}", flush=True)
            seen += 1
            if seen >= 25:
                break

    if not apply:
        print("\nDry run. Re-run with --apply to write master_v2.", flush=True)
        return

    print(f"\nWriting cleaned '{TAB}' …", flush=True)
    client.clear(f"'{TAB}'!A1:Z30000")
    client.write(f"'{TAB}'!A1", [header] + out)
    print(
        f"Done. {len(out):,} rows. Re-run push_tier1_full_coverage_sheet.py next.",
        flush=True,
    )


if __name__ == "__main__":
    main()
