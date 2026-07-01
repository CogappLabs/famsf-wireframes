"""FAMSF medium-facet taxonomy: config tables + keyword classifier."""

from .classifier import FacetPath, MaterialClassifier
from .taxonomy_config import OTHER_SECTION, SECTIONS, SPECIFICS, SUBCATEGORIES

__all__ = [
    "FacetPath",
    "MaterialClassifier",
    "OTHER_SECTION",
    "SECTIONS",
    "SPECIFICS",
    "SUBCATEGORIES",
]
