"""Keyword-driven classifier turning a raw TMS medium token into a facet path.

`MaterialClassifier` holds the curated taxonomy tables (from taxonomy_config, or
custom tables for testing) and resolves a token to a `(section, subcategory,
specific)` triple - the object-type facet path. The matching rules:

  * Long keywords (>= SUBSTRING_MIN_LEN) match as a substring so "etching" also
    catches "etchings"; short ones need a whole word so "tin" doesn't hit inside
    "coating". Substring matching runs only against the token, never the noisy
    AAT chain.
  * First match wins at every level, so keyword lists run specific-before-general.
  * A level-3 leaf collapses to the subcategory's "Mixed" catch-all only for a
    genuine conjunction composite ("etching and engraving"); bare adjacency
    ("offset lithograph") lets the specific win.
  * Where no curated leaf fires, an AAT preferred label (if the token matched a
    concept) is used as the leaf before falling back to the catch-all.
"""

import re
from dataclasses import dataclass

from .taxonomy_config import (
    OTHER_SECTION,
    SECTIONS,
    SPECIFICS,
    SUBCATEGORIES,
)

# Keywords at or above this length may match as a substring; shorter ones need a
# whole-word match (a short token like "tin"/"oil"/"iron" would otherwise hit
# inside unrelated words such as "coating"/"soil").
SUBSTRING_MIN_LEN = 6

# A token joining two techniques by an explicit conjunction is a genuine
# composite (-> "Mixed" leaf); bare adjacency ("offset lithograph") is not.
_CONJUNCTION = re.compile(r"\b(and|with)\b|&|,|/", re.IGNORECASE)


@dataclass(frozen=True)
class FacetPath:
    """A token's resolved 3-level facet path plus how it was decided."""

    section: str
    subcategory: str
    specific: str
    source: str  # "keyword" | "aat" | "other"


def _kw_hit(keywords: list[str], text: str, *, allow_substring: bool) -> bool:
    """True if any keyword matches the text.

    A long keyword (>= SUBSTRING_MIN_LEN) matches as a substring when
    `allow_substring` is set; every other case (short keyword, or substring
    disabled) requires a whole-word match. The whole-word fallback must run for a
    short keyword even when `allow_substring=True`, so the branches are nested,
    not chained with elif (an elif would leave short keywords unmatched whenever
    substring matching is enabled).
    """
    low = text.lower()
    for kw in keywords:
        if allow_substring and len(kw) >= SUBSTRING_MIN_LEN:
            if kw in low:
                return True
        else:
            if re.search(rf"\b{re.escape(kw)}\b", low):
                return True
    return False


def _titlecase_leaf(label: str) -> str:
    """Sentence-case a label for use as a leaf (first letter up, rest kept)."""
    return label[:1].upper() + label[1:] if label else label


class MaterialClassifier:
    """Resolve raw TMS medium tokens to object-type facet paths."""

    def __init__(
        self,
        sections: list[dict] | None = None,
        subcategories: dict[str, list[tuple[str, list[str]]]] | None = None,
        specifics: dict[str, list[tuple[str, list[str]]]] | None = None,
        other_section: str = OTHER_SECTION,
    ) -> None:
        self.sections = sections if sections is not None else SECTIONS
        self.subcategories = (
            subcategories if subcategories is not None else SUBCATEGORIES
        )
        self.specifics = specifics if specifics is not None else SPECIFICS
        self.other_section = other_section

    # -- level 1 --------------------------------------------------------------

    def section_for(self, token: str, aat_facet: str, chain: str) -> str:
        """The object-type section: first whose keyword hits the token, else chain.

        A direct hit on the token text is trusted outright - if the token *is* a
        section keyword ("tapestry" -> Textile), it wins regardless of AAT's
        material/technique facet (AAT calls tapestry a technique, but it is still a
        Textile object). The `aat_facet` constraint is applied only to the noisier
        AAT-chain fallback, where a section that declares a facet won't accept a
        token whose AAT facet disagrees.
        """
        sections = [s for s in self.sections if s["name"] != self.other_section]
        # Pass 1: trust a direct token-keyword hit, no facet gate.
        for sec in sections:
            if _kw_hit(sec["keywords"], token, allow_substring=True):
                return sec["name"]
        # Pass 2: AAT-chain fallback, facet-gated (skip a section whose declared
        # facet disagrees with the token's AAT facet).
        for sec in sections:
            if sec["aat_facet"] and aat_facet and aat_facet != sec["aat_facet"]:
                continue
            if _kw_hit(sec["keywords"], chain, allow_substring=False):
                return sec["name"]
        return self.other_section

    # -- level 2 --------------------------------------------------------------

    def subcategory_for(self, token: str, section: str) -> str:
        """The subcategory within a section, or the section name if none applies."""
        subs = self.subcategories.get(section)
        if not subs:
            return section
        for label, keywords in subs:
            if not keywords:  # catch-all, reached only if nothing above hit
                return label
            if _kw_hit(keywords, token, allow_substring=True):
                return label
        return section

    # -- level 3 --------------------------------------------------------------

    def specific_for(self, token: str, subcategory: str, aat_label: str = "") -> str:
        """The canonical leaf: curated rule, else AAT label, else catch-all."""
        specs = self.specifics.get(subcategory)
        if specs:
            hits = [
                label
                for label, kws in specs
                if kws and _kw_hit(kws, token, allow_substring=True)
            ]
            if len(hits) > 1 and _CONJUNCTION.search(token):
                mixed = next((label for label, kws in specs if not kws), None)
                return mixed or hits[0]
            if hits:
                return hits[0]
        if aat_label and aat_label.strip().lower() != subcategory.strip().lower():
            return _titlecase_leaf(aat_label.strip())
        if specs:
            other = next((label for label, kws in specs if not kws), None)
            if other:
                return other
        return subcategory

    # -- full path ------------------------------------------------------------

    def classify(
        self, token: str, aat_facet: str = "", chain: str = "", aat_label: str = ""
    ) -> FacetPath:
        """Resolve a token to its full 3-level path.

        `aat_facet` / `chain` / `aat_label` come from an AAT match on the token
        (empty when it did not match a concept).
        """
        section = self.section_for(token, aat_facet, chain)
        subcategory = self.subcategory_for(token, section)
        specific = self.specific_for(token, subcategory, aat_label)
        # source reflects how the *section* was decided, not merely whether an AAT
        # label exists: a keyword-routed token is "keyword" even if it also has an
        # AAT entry (which may still supply the leaf).
        if section == self.other_section:
            source = "other"
        elif self._section_hit_by_token(token):
            source = "keyword"
        else:
            source = "aat"
        return FacetPath(section, subcategory, specific, source)

    def _section_hit_by_token(self, token: str) -> bool:
        """True if any section's keyword matches the token text directly."""
        return any(
            sec["name"] != self.other_section
            and _kw_hit(sec["keywords"], token, allow_substring=True)
            for sec in self.sections
        )
