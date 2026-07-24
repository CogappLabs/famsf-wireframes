"""Display formatting for medium-facet labels (curator house style).

Applied at output time (facet-tree build + doc export), not inside the
classifier, so the classifier's internal Tier-1/2/3 keys stay stable for
matching and tests.
"""

import re

# Display renames applied before the generic formatting, keyed on the internal
# classifier label (kept stable for matching/tests). Curator ask: the Tier-1
# "Ink & drawing media" reads as "Ink + drawing".
_DISPLAY_RENAME: dict[str, str] = {
    "Ink & drawing media": "Ink + drawing",
}


def format_label(label: str) -> str:
    """ "&" -> "+" and sentence case (capitalise the first letter only).

    Leaves the rest of the string untouched so proper nouns and existing
    mixed-case labels (place names, acronyms) survive unchanged. A few labels
    have an explicit display rename (see _DISPLAY_RENAME) applied first.
    """
    if not label:
        return label
    if label in _DISPLAY_RENAME:
        return _DISPLAY_RENAME[label]
    out = re.sub(r"\s*&\s*", " + ", label)
    return out[:1].upper() + out[1:]
