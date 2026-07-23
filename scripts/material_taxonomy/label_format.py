"""Display formatting for medium-facet labels (curator house style).

Applied at output time (facet-tree build + doc export), not inside the
classifier, so the classifier's internal Tier-1/2/3 keys stay stable for
matching and tests.
"""

import re


def format_label(label: str) -> str:
    """"&" -> "+" and sentence case (capitalise the first letter only).

    Leaves the rest of the string untouched so proper nouns and existing
    mixed-case labels (place names, acronyms) survive unchanged.
    """
    if not label:
        return label
    out = re.sub(r"\s*&\s*", " + ", label)
    return out[:1].upper() + out[1:]
