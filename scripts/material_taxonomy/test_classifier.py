"""Tests for the object-type medium classifier.

Run: uv run --with pytest python -m pytest scripts/material_taxonomy/test_classifier.py
"""

import pytest

from material_taxonomy import MaterialClassifier


@pytest.fixture
def clf() -> MaterialClassifier:
    """A classifier using the shipped curated tables."""
    return MaterialClassifier()


@pytest.mark.parametrize(
    ("token", "section"),
    [
        # A print stays a Print whatever it is printed on (the paper-support fix).
        ("lithograph on arches wove paper", "Print"),
        ("color woodcut", "Print"),
        ("wood engraving", "Print"),
        # Drawing media -> Drawing, not Paper.
        ("ink on paper", "Drawing"),
        ("black ink on paper", "Drawing"),
        ("graphite on paper", "Drawing"),
        # Paint -> Painting.
        ("oil on canvas", "Painting"),
        ("watercolor on paper", "Painting"),
        # Photographs by process.
        ("gelatin silver print", "Photograph"),
        ("albumen silver print", "Photograph"),
        # 3-D and craft.
        ("cast bronze", "Sculpture"),
        ("silver", "Decorative & other materials"),
        ("porcelain", "Ceramic & glass"),
        ("silk", "Textile"),
    ],
)
def test_section_by_object_type(
    clf: MaterialClassifier, token: str, section: str
) -> None:
    """Tokens land in the visitor's object-type bucket."""
    assert clf.classify(token).section == section


@pytest.mark.parametrize(
    ("token", "specific"),
    [
        ("color etching", "Etching"),
        ("etchings", "Etching"),
        ("wood engraving", "Wood engraving"),
        ("offset lithograph", "Offset lithograph"),
        ("soft-paste porcelain", "Soft-paste porcelain"),
        ("tapestry weave", "Tapestry"),
        ("opaque watercolor on paper", "Gouache / opaque watercolor"),
    ],
)
def test_specific_canonical_leaf(
    clf: MaterialClassifier, token: str, specific: str
) -> None:
    """Raw variants collapse to the right canonical leaf."""
    assert clf.classify(token).specific == specific


def test_conjunction_is_mixed(clf: MaterialClassifier) -> None:
    """A genuine multi-technique composite collapses to the Mixed leaf."""
    assert clf.classify("etching and engraving").specific == "Mixed / other intaglio"


def test_bare_adjacency_is_not_mixed(clf: MaterialClassifier) -> None:
    """Bare adjacency (general + specific) is not a composite."""
    assert clf.classify("offset lithograph").specific == "Offset lithograph"


def test_aat_fallback_leaf(clf: MaterialClassifier) -> None:
    """An AAT label becomes the leaf when no curated rule fires."""
    path = clf.classify("quartzite", aat_facet="material", aat_label="quartzite")
    assert path.specific == "Quartzite"


def test_everything_maps(clf: MaterialClassifier) -> None:
    """No token is ever left without a section (total faceting)."""
    path = clf.classify("wholly unrecognised gibberish xyzzy")
    assert path.section  # non-empty; the catch-all at minimum
