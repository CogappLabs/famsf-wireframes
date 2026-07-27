"""Refresh src/data/sample-docs/*.json from the live Elasticsearch index.

Each sample file is keyed by its accession_number, which is the ES `_id` on the
`develop` alias. The fetched `_source` replaces the file wholesale, except for
the `_sample_meta` block, which is carried over from the file on disk (it is a
wireframe-only annotation the pipeline does not emit on the ES path).

Usage:
    uv run python scripts/pull_sample_docs_from_es.py [--index develop] [--dry-run]

Requires the `esq` CLI on PATH and the -real project's .env for credentials.
"""

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "src" / "data" / "sample-docs"
# esq reads credentials from the -real project's .env via its .esq mapping.
ESQ_PROJECT = (
    Path(__file__).resolve().parents[2] / "collection-flow-famsf-real"
)


def fetch(accession: str, index: str, project: Path) -> dict | None:
    """Pull one doc by accession number. Returns the _source, or None on miss."""
    with tempfile.NamedTemporaryFile(suffix=".json") as tmp:
        result = subprocess.run(
            [
                "esq", "doc",
                "--id", accession,
                "-i", index,
                "-p", str(project),
                "-f", "json",
                "-o", tmp.name,
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return None
        payload = json.loads(Path(tmp.name).read_text())
    return payload.get("_source", payload)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--index", default="develop", help="ES index or alias")
    parser.add_argument(
        "--project",
        type=Path,
        default=ESQ_PROJECT,
        help="Directory holding the .esq / .env for credentials",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Report without writing files"
    )
    args = parser.parse_args()

    files = sorted(SAMPLE_DIR.glob("*.json"))
    if not files:
        print(f"No sample docs found in {SAMPLE_DIR}", file=sys.stderr)
        return 1

    print(f"Refreshing {len(files)} sample docs from '{args.index}'…", flush=True)
    updated, missing, mismatched = 0, [], []

    for path in files:
        existing = json.loads(path.read_text())
        accession = existing.get("accession_number")
        source = fetch(accession, args.index, args.project)

        if source is None:
            missing.append((path.name, accession))
            print(f"  MISS  {path.name} ({accession})", flush=True)
            continue

        # Guard against an accession number that resolves to a different object.
        if str(source.get("id")) != str(existing.get("id")):
            mismatched.append((path.name, existing.get("id"), source.get("id")))
            print(
                f"  SKIP  {path.name}: id {existing.get('id')} != ES {source.get('id')}",
                flush=True,
            )
            continue

        if meta := existing.get("_sample_meta"):
            source["_sample_meta"] = meta

        if not args.dry_run:
            path.write_text(json.dumps(source, indent=2, ensure_ascii=False) + "\n")
        updated += 1
        print(f"  OK    {path.name} ({accession})", flush=True)

    verb = "Would update" if args.dry_run else "Updated"
    print(f"\n{verb} {updated}/{len(files)} sample docs.")
    if missing:
        print(f"Not found in '{args.index}': {len(missing)}")
    if mismatched:
        print(f"ID mismatches (left untouched): {len(mismatched)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
