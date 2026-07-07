"""Tests for the 12-Tier-1 material classifier.

Locks the six fix classes found 2026-07-07 (see
`docs/medium-taxonomy-pipeline.md` §"Issues found and fixed") plus the
guardrails that stop each fix from over-reaching.

Run: uv run --with pytest python -m pytest scripts/material_taxonomy/test_tier1_classifier.py
"""

import pytest

from material_taxonomy.tier1_classifier import Tier1Classifier

# A curated fixture that deliberately seeds the *keyword traps* the overrides
# must beat: "silver" -> Metal, colour "green" -> Paint, "chiffon"/"linen" ->
# Textiles, plus the honest substance/technique leaves. If the override pass ever
# regresses, these keywords will (wrongly) win and the tests fail — which is the
# whole point.
CURATED_ROWS = [
    {"tier1": "Prints", "tier2": "Etching", "tier3": "Etching", "leaf": "etching"},
    {
        "tier1": "Prints",
        "tier2": "Engraving",
        "tier3": "Engraving",
        "leaf": "engraving",
    },
    {
        "tier1": "Prints",
        "tier2": "Lithograph",
        "tier3": "Lithograph",
        "leaf": "lithograph",
    },
    {"tier1": "Ink & drawing media", "tier2": "Ink", "tier3": "ink", "leaf": "ink"},
    {
        "tier1": "Ink & drawing media",
        "tier2": "Pencil & graphite",
        "tier3": "graphite",
        "leaf": "graphite",
    },
    {
        "tier1": "Paint & pigment",
        "tier2": "Watercolour & wash",
        "tier3": "watercolor",
        "leaf": "watercolor",
    },
    {"tier1": "Paint & pigment", "tier2": "Pigment", "tier3": "green", "leaf": "green"},
    {"tier1": "Paper & parchment", "tier2": "Paper", "tier3": "", "leaf": "paper"},
    {"tier1": "Textiles & fiber", "tier2": "Silk", "tier3": "silk", "leaf": "silk"},
    {
        "tier1": "Textiles & fiber",
        "tier2": "Other woven textiles",
        "tier3": "chiffon",
        "leaf": "chiffon",
    },
    {
        "tier1": "Textiles & fiber",
        "tier2": "Other woven textiles",
        "tier3": "linen",
        "leaf": "linen",
    },
    {"tier1": "Metal", "tier2": "Silver", "tier3": "Silver", "leaf": "silver"},
    {"tier1": "Metal", "tier2": "Bronze", "tier3": "Bronze", "leaf": "bronze"},
    {"tier1": "Organic", "tier2": "Wood & plant", "tier3": "wood", "leaf": "wood"},
    {
        "tier1": "Ceramic",
        "tier2": "Earthenware",
        "tier3": "Earthenware",
        "leaf": "earthenware",
    },
]


@pytest.fixture
def clf() -> Tier1Classifier:
    return Tier1Classifier(CURATED_ROWS)


# --- Issue 1: photographic prints -> Prints, not Metal/Glass -------------------
@pytest.mark.parametrize(
    "token",
    [
        "gelatin silver print",
        "albumen silver print",
        "silver gelatin print",
        "toned gelatin silver print",
        "albumen silver print from wet-collodion-on-glass negative",
    ],
)
def test_photographic_print_is_prints(clf: Tier1Classifier, token: str) -> None:
    """The image-forming silver / the negative's glass must not win over Prints."""
    p = clf.classify(token)
    assert p.tier1 == "Prints"
    assert p.source == "override"


def test_daguerreotype_stays_metal(clf: Tier1Classifier) -> None:
    """A daguerreotype IS a silver-on-copper plate — Metal is correct, not Prints."""
    # Not in the photo-print override list; the "silver"/"plate" keyword decides.
    assert clf.classify("daguerreotype", facet_final="").tier1 != "Prints"


# --- Issue 2: paper stocks -> Paper, but "medium on paper" stays the medium ----
@pytest.mark.parametrize(
    "token",
    [
        "green paper",
        "somerset satin paper",
        "montgolfier linen paper",
        "hand-made paper by barcham green",  # Barcham Green = a papermaker
        "watercolor paper",
        "wove paper",
    ],
)
def test_paper_stock_is_paper(clf: Tier1Classifier, token: str) -> None:
    p = clf.classify(token)
    assert p.tier1 == "Paper & parchment"
    assert p.source == "override"


@pytest.mark.parametrize(
    ("token", "tier1"),
    [
        ("watercolor on paper", "Paint & pigment"),
        ("graphite on paper", "Ink & drawing media"),
        ("pen and ink on paper", "Ink & drawing media"),
        ("etching on wove paper", "Prints"),
    ],
)
def test_medium_on_paper_is_the_medium(
    clf: Tier1Classifier, token: str, tier1: str
) -> None:
    """A support preposition means the paper is the substrate, not the substance."""
    assert clf.classify(token).tier1 == tier1


# --- Issue 3: metalpoint -> Ink & drawing media, not Metal ---------------------
@pytest.mark.parametrize(
    "token",
    ["silverpoint", "silver point", "goldpoint", "metalpoint", "aluminum metalpoint"],
)
def test_metalpoint_is_drawing(clf: Tier1Classifier, token: str) -> None:
    p = clf.classify(token)
    assert p.tier1 == "Ink & drawing media"
    assert p.source == "override"


# --- Issue 4: technique-vocab gap now resolves ---------------------------------
@pytest.mark.parametrize(
    ("token", "tier1"),
    [
        ("burin", "Prints"),
        ("burnishing", "Prints"),
        ("hardground", "Prints"),
        ("offset print", "Prints"),
        ("oban print", "Prints"),
        ("gilding", "Metal"),
        ("polychrome", "Paint & pigment"),
        ("supplementary weft patterning", "Textiles & fiber"),
        ("incised", "Ink & drawing media"),
    ],
)
def test_technique_vocab_resolves(clf: Tier1Classifier, token: str, tier1: str) -> None:
    p = clf.classify(token)
    assert p.tier1 == tier1
    assert p.source == "supplementary"


# --- Issue 5: own not_medium flag beats an incidental material keyword ---------
def test_not_medium_beats_keyword(clf: Tier1Classifier) -> None:
    """A descriptive non-medium isn't grabbed by an incidental 'painted'/'silver'."""
    p = clf.classify(
        "hand painted border in a portfolio designed by the artist",
        facet_final="not_medium",
    )
    assert p.tier1 == "Other"
    assert p.source == "not_medium"
    assert p.suppress_suggested is True


# --- Non-regressions: substance-with-a-process-verb keeps the substance --------
@pytest.mark.parametrize(
    ("token", "tier1"),
    [
        ("carved wood", "Organic"),
        ("cast bronze", "Metal"),
        ("glazed earthenware", "Ceramic"),
    ],
)
def test_substance_kept_over_process_verb(
    clf: Tier1Classifier, token: str, tier1: str
) -> None:
    assert clf.classify(token).tier1 == tier1


# --- Base behaviour: curated exact + total coverage ----------------------------
def test_curated_exact_wins(clf: Tier1Classifier) -> None:
    p = clf.classify("etching")
    assert (p.tier1, p.source, p.confidence) == ("Prints", "curated", 1.0)


def test_plain_silver_still_metal(clf: Tier1Classifier) -> None:
    """The override is scoped to photographic composites, not bare 'silver'."""
    assert clf.classify("silver").tier1 == "Metal"


def test_everything_maps(clf: Tier1Classifier) -> None:
    """No token is left without a Tier-1 (total faceting); junk -> Other."""
    p = clf.classify("wholly unrecognised gibberish xyzzy")
    assert p.tier1 == "Other"
    assert p.source == "unresolved"
