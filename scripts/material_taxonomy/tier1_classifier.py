"""Classify every TMS medium token into the curator 12-Tier-1 material taxonomy.

The curators hand-mapped ~280 high-frequency terms (the *head*, ~65% of object
mentions) into 12 material-group Tier-1s in `MediumFilterTaxonomy-12Tier1Terms`.
This module extends that to *total* coverage by auto-classifying the long tail of
~16K rarer tokens, so faceting is complete. It does NOT re-decide the curated
head - those mappings are authoritative overrides.

Resolution order per token (first hit wins), each carries a `source` +
`confidence` so curators triage the shaky rows, not the whole 17K:

  0. suppressed  bare colour tokens curators want dropped from the facet
               entirely ("green", "yellow"). Confidence 1.0, `suppressed=True`;
               callers must skip nodes with this flag rather than render them.
  0b. normalised  curator-reviewed near-duplicate tokens collapsed to one bucket
               label (colour/composite variants of watercolor, ink, chalk,
               paint, pigment, glass, engraving, earthenware, …). Exact-token
               match, confidence 1.0.
  1. curated   exact match on a curated leaf / Tier-2 / Tier-3 label (or its
               canonical_final). Confidence 1.0, pre-approved.
  2. override  high-priority composite rules that MUST beat the greedy keyword
               pass: photographic prints -> Prints (not Metal via "silver"),
               metalpoint -> Ink & drawing media, and a "…paper" suffix guard ->
               Paper (not Paint/Textiles via a colour/fibre word). Confidence 0.9.
  3. not_medium  master_v2.facet_final == "not_medium": routed to Tier-1 "Other"
               with Suppress? suggested, BEFORE the keyword pass so a descriptive
               non-medium isn't grabbed by an incidental material word. Curators
               decide per-token (they may keep a real medium mis-flagged). 0.5.
  4. keyword   substring/word match against keyword sets *derived from the
               curated leaves themselves* (silk -> Textiles & fiber / Silk;
               etching -> Prints). Confidence 0.6.
  5. supplementary  hand-picked roots (paper, canvas, photo, …) + technique-gap
               keywords (burin, gilding, hardground, …). Confidence 0.5.
  6. unresolved  no signal: Tier-1 "Other", empty Tier-2/3. Confidence 0.0.

Keyword tables are built once from the curated sheet at load time, so editing the
sheet re-derives them - no second place to maintain the vocab.
"""

import re
from dataclasses import dataclass

# A keyword this long may match as a substring ("etching" catches "etchings");
# shorter ones need a whole-word match so "tin" doesn't fire inside "painting".
SUBSTRING_MIN_LEN = 6

# The 12 curator Tier-1 groups. Order = priority for the derived keyword pass:
# process/technique groups (Prints, Ink & drawing media, Paint & pigment) are
# tried before the material substance groups, because a "silk-screen on paper"
# print should read as a Print, not Textile or Paper. Prints first for the same
# reason it wins in the object-type classifier.
TIER1_ORDER = [
    "Prints",
    "Ink & drawing media",
    "Paint & pigment",
    "Paper & parchment",
    "Textiles & fiber",
    "Ceramic",
    "Glass",
    "Stone",
    "Metal",
    "Organic",
    "Inorganic",
    "Other",
]

_CONJUNCTION = re.compile(r"\b(and|with)\b|&|,|/", re.IGNORECASE)

# Supplementary root-word keywords for the common tail the curated leaves miss.
# The curated sheet leafs specific terms ("arches satine heavyweight paper") but
# not the bare roots ("paper", "canvas", "photo"), so obvious tokens fall through
# to Other. These hand-picked roots (drawn from the unresolved head + the
# object-type taxonomy_config vocab) plug that gap, mapped to a 12-Tier-1 leaf.
# Tried AFTER curated exact + curated-derived keywords, so they never override a
# curator decision - they only catch what curators haven't leafed. (keyword, t2, t3)
# per Tier-1; longest-first ordering is applied at load like the derived table.
SUPPLEMENTARY_KEYWORDS: dict[str, list[tuple[str, str, str]]] = {
    "Prints": [
        ("chine collé", "Other technique", "Chine collé"),
        ("chine colle", "Other technique", "Chine collé"),
        ("photogravure", "Photogravure", "Photogravure"),
        ("photograph", "Photographic process", "Photograph"),
        ("photo", "Photographic process", "Photograph"),
        ("gelatin silver", "Photographic process", "Gelatin silver print"),
        ("albumen", "Photographic process", "Albumen print"),
        ("polaroid", "Photographic process", "Polaroid"),
        ("collotype", "Collotype", "Collotype"),
        ("gillotage", "Other technique", "Gillotage"),
        ("roulette", "Etching", "Roulette"),
        ("embossing", "Other technique", "Embossing"),
        ("woodblock", "Woodcut", "Woodcut"),
        ("woodcut", "Woodcut", "Woodcut"),
        ("engraving", "Engraving", "Engraving"),
        ("etching", "Etching", "Etching"),
        ("lithograph", "Lithograph", "Lithograph"),
    ],
    "Ink & drawing media": [
        ("hand coloring", "Hand colouring", "Hand colouring"),
        ("hand colouring", "Hand colouring", "Hand colouring"),
        ("hand-color", "Hand colouring", "Hand colouring"),
        ("hand color", "Hand colouring", "Hand colouring"),
        ("charcoal", "Charcoal", "Charcoal"),
        ("pastel", "Pastel", "Pastel"),
    ],
    "Paint & pigment": [
        ("collage", "Surface technique", "Collage"),
    ],
    "Paper & parchment": [
        ("canvas", "Paper", "Canvas"),
        ("parchment", "Parchment & vellum", "Parchment"),
        ("vellum", "Parchment & vellum", "Vellum"),
        ("paperboard", "Paper", "Paperboard"),
        ("cardboard", "Paper", "Cardboard"),
        ("paper", "Paper", "Paper"),
    ],
    "Textiles & fiber": [
        ("knotted pile", "Weaving", "Knotted pile"),
        ("tapestry weave", "Weaving", "Tapestry weave"),
        ("plain weave", "Weaving", "Plain weave"),
        ("tapestry", "Weaving", "Tapestry"),
        ("embroider", "Embroidery", "Embroidery"),
        ("weave", "Weaving", "Weaving"),
        ("woven", "Weaving", "Weaving"),
        ("linen", "Other woven textiles", "Linen"),
        ("velvet", "Other woven textiles", "Velvet"),
        ("brocade", "Other woven textiles", "Brocade"),
    ],
    "Ceramic": [
        ("porcelain", "Porcelain", "Porcelain"),
        ("earthenware", "Earthenware", "Earthenware"),
        ("stoneware", "Ceramic", "Stoneware"),
        ("terracotta", "Terracotta", "Terracotta"),
        ("ceramic", "Ceramic", "Ceramic"),
        ("faience", "Faience", "Faience"),
    ],
    "Glass": [
        ("glass", "Glass", "Glass"),
        ("crystal", "Glass", "Crystal"),
    ],
    "Stone": [
        ("marble", "Marble", "Marble"),
        ("alabaster", "Hardstone", "Alabaster"),
        ("granite", "Hardstone", "Granite"),
        ("limestone", "Hardstone", "Limestone"),
        ("sandstone", "Hardstone", "Sandstone"),
        ("plaster", "", "Plaster"),
        ("stone", "", "Stone"),
    ],
    "Metal": [
        ("bronze", "", "Bronze"),
        ("brass", "", "Brass"),
        ("copper", "", "Copper"),
        ("silver", "", "Silver"),
        ("gold", "", "Gold"),
        ("pewter", "", "Pewter"),
        ("iron", "", "Iron"),
        ("steel", "", "Steel"),
        ("metal", "", "Metal"),
    ],
    "Organic": [
        ("leather", "Leather & hide", "Leather"),
        ("ivory", "Ivory & bone", "Ivory"),
        ("bone", "Ivory & bone", "Bone"),
        ("shell", "Shell & pearl", "Shell"),
        ("feather", "Hair, fur & feather", "Feather"),
        ("bamboo", "Wood & plant", "Bamboo"),
        ("lacquer", "Wood & plant", "Lacquer"),
        ("wood", "Wood & plant", "Wood"),
    ],
    "Inorganic": [
        ("plastic", "Plastic", "Plastic"),
        ("acetate", "Acetate", "Acetate"),
        ("celluloid", "Celluloid", "Celluloid"),
        ("synthetic", "Synthetic", "Synthetic"),
    ],
}

# --- Curator normalisation buckets (Cogapp review, medium-filter feedback) ------
# Curator-reviewed term normalisations: a set of near-duplicate tokens (colour
# variants, composite phrases) that should all read as one bucket label rather
# than a leaf per raw token. Exact-token match, run before every other pass so
# a normalised bucket always wins over the greedy keyword/curated-exact passes.
# (tier1, tier2, tier3) - tier3 "" means the bucket IS the Tier-2 node.
NORMALISATION_KEYWORDS: dict[str, tuple[str, str, str]] = {
    # Watercolour bucket
    "opaque watercolor": ("Paint & pigment", "Watercolour & wash", "Watercolor"),
    "transparent watercolor": ("Paint & pigment", "Watercolour & wash", "Watercolor"),
    "white opaque watercolor": ("Paint & pigment", "Watercolour & wash", "Watercolor"),
    # Wash bucket
    "brown wash": ("Paint & pigment", "Watercolour & wash", "Wash"),
    "brown washe": (
        "Paint & pigment",
        "Watercolour & wash",
        "Wash",
    ),  # canonical_final typo in master_v2
    "watercolor wash": ("Paint & pigment", "Watercolour & wash", "Wash"),
    "gray wash": ("Paint & pigment", "Watercolour & wash", "Wash"),
    "gray washe": (
        "Paint & pigment",
        "Watercolour & wash",
        "Wash",
    ),  # canonical_final typo in master_v2
    # Ink (own Tier 2)
    "ink": ("Ink & drawing media", "Ink", ""),
    "black ink": ("Ink & drawing media", "Ink", ""),
    "brown ink": ("Ink & drawing media", "Ink", ""),
    "blue ink": ("Ink & drawing media", "Ink", ""),
    "red ink": ("Ink & drawing media", "Ink", ""),
    "sepia ink": ("Ink & drawing media", "Ink", ""),
    "sumi ink": ("Ink & drawing media", "Ink", ""),
    "india ink": ("Ink & drawing media", "Ink", ""),
    "double-sided ink": ("Ink & drawing media", "Ink", ""),
    "ink wash": ("Ink & drawing media", "Ink", ""),
    "tones brown ink": ("Ink & drawing media", "Ink", ""),
    "pen": ("Ink & drawing media", "Ink", ""),
    # Pencil bucket
    "blue pencil": ("Ink & drawing media", "Pencil & graphite", "Pencil"),
    # Chalk bucket
    "black chalk": ("Ink & drawing media", "Chalk & crayon", "Chalk"),
    "white chalk": ("Ink & drawing media", "Chalk & crayon", "Chalk"),
    "red chalk": ("Ink & drawing media", "Chalk & crayon", "Chalk"),
    # Crayon bucket
    "black crayon": ("Ink & drawing media", "Chalk & crayon", "Crayon"),
    # Paint (own Tier 2)
    "paint": ("Paint & pigment", "Paint", ""),
    "painted": ("Paint & pigment", "Paint", ""),
    "gold paint": ("Paint & pigment", "Paint", ""),
    "gesso": ("Paint & pigment", "Paint", ""),
    "metallic paint": ("Paint & pigment", "Paint", ""),
    "overglaze painting": ("Paint & pigment", "Paint", ""),
    # Pigment bucket
    "pigment": ("Paint & pigment", "Pigment", ""),
    "metallic pigment": ("Paint & pigment", "Pigment", ""),
    # Gouache bucket
    "gray gouache ground": ("Paint & pigment", "Gouache & tempera", "Gouache"),
    "white gouache": ("Paint & pigment", "Gouache & tempera", "Gouache"),
    # Oil (own Tier 2)
    "oil": ("Paint & pigment", "Oil", ""),
    "oil paint": ("Paint & pigment", "Oil", ""),
    # Acrylic (own Tier 2)
    "acrylic": ("Paint & pigment", "Acrylic", ""),
    "acrylic paint": ("Paint & pigment", "Acrylic", ""),
    # Glass (own Tier 1)
    "glass": ("Glass", "Glass", ""),
    "pressed lead glass": ("Glass", "Glass", ""),
    "free-blown glass": ("Glass", "Glass", ""),
    "blown glass": ("Glass", "Glass", ""),
    # Engraving (own Tier 2)
    "engraving": ("Prints", "Engraving", ""),
    "stipple engraving": ("Prints", "Engraving", ""),
    # Earthenware bucket
    "glazed earthenware": ("Ceramic", "Earthenware", "Earthenware"),
    "tin-glazed earthenware": ("Ceramic", "Earthenware", "Earthenware"),
    # Ceramic bucket
    "glazed ceramic": ("Ceramic", "Ceramic", "Ceramic"),
    # Bead bucket
    "glass bead": ("Textiles & fiber", "Trimmings", "Bead"),
    "glass seed bead": ("Textiles & fiber", "Trimmings", "Bead"),
    # Thread bucket
    "metallic thread": ("Textiles & fiber", "Yarn & thread", "Thread"),
    "metal thread": ("Textiles & fiber", "Yarn & thread", "Thread"),
    # Wool bucket
    "sheep's wool": ("Textiles & fiber", "Wool", "Wool"),
    # Cotton (own Tier 2)
    "white cotton": ("Textiles & fiber", "Cotton", ""),
    # Linen bucket
    "white linen": ("Textiles & fiber", "Other woven textiles", "Linen"),
    "embroidered linen": ("Textiles & fiber", "Other woven textiles", "Linen"),
    # Rattan bucket
    "woven rattan": ("Organic", "Wood & plant", "Rattan"),
    # Ribbon bucket
    "silk ribbon": ("Textiles & fiber", "Trimmings", "Ribbon"),
    # Marble (own Tier 2)
    "marble base": ("Stone", "Marble", ""),
    # Rhinestone moves under Textile & fiber trimmings (was its own Glass leaf).
    "rhinestone": ("Textiles & fiber", "Trimmings", "Rhinestone"),
    "rhinestones": ("Textiles & fiber", "Trimmings", "Rhinestone"),
}

# Bare colour tokens suppressed from the medium facet entirely (curator
# feedback: "green"/"yellow" pigment leaves are noise, not a useful facet node).
SUPPRESSED_TOKENS: frozenset[str] = frozenset({"green", "yellow"})

# Single words distinctive enough to match as a substring too (no common word
# contains them), so "linen and gesso" collapses like the bare "gesso" would.
_NORM_SAFE_SINGLE_WORDS: frozenset[str] = frozenset({"gesso"})

# Normalisation keys matched as a phrase anywhere in a token, so composites
# ("opaque watercolor on paper") collapse like the bare token. Longest-first so
# the specific key wins. Multi-word keys + the safe single words above; other
# single words stay exact-only (0b) to avoid substring traps ("ink" in "thinking").
_NORM_PHRASES: list[tuple[str, tuple[str, str, str]]] = sorted(
    (
        (k, v)
        for k, v in NORMALISATION_KEYWORDS.items()
        if " " in k or "-" in k or k in _NORM_SAFE_SINGLE_WORDS
    ),
    key=lambda kv: len(kv[0]),
    reverse=True,
)

# --- High-priority overrides, run BEFORE the derived-keyword pass ---------------
# The derived-keyword pass is greedy: a single incidental word inside a token
# (image-forming "silver", a colour, a paper-finish name) grabs the token before
# its real substance is seen. These rules run first to stop that.

# (a) Photographic-print composites. A photographic print is a print ON PAPER;
# the silver is the image-forming agent and the glass/collodion is the negative,
# neither is the object's material. Substring-matched (all >= SUBSTRING_MIN_LEN)
# so "toned gelatin silver print", "…from wet-collodion-on-glass negative", etc.
# all resolve to Prints. NB daguerreotype is deliberately NOT here — it is a real
# silver-on-copper plate and correctly stays Metal via the keyword pass.
PHOTO_PRINT_KEYWORDS: list[tuple[str, str, str]] = [
    ("gelatin silver", "Photographic process", "Gelatin silver print"),
    ("silver gelatin", "Photographic process", "Gelatin silver print"),
    ("albumen silver", "Photographic process", "Albumen print"),
    ("albumen print", "Photographic process", "Albumen print"),
    ("silver print", "Photographic process", "Silver print"),
    ("collodion print", "Photographic process", "Collodion print"),
    ("carbon print", "Photographic process", "Carbon print"),
    ("platinum print", "Photographic process", "Platinum print"),
    ("palladium print", "Photographic process", "Palladium print"),
    ("woodburytype", "Photographic process", "Woodburytype"),
    ("cyanotype", "Photographic process", "Cyanotype"),
]

# (b) Metalpoint drawing techniques (silverpoint / goldpoint / metalpoint …).
# A drawing made with a metal stylus on prepared ground — a drawing medium, not
# a Metal object. Substring so "silverpoint", "silver point", "metal point" hit.
METALPOINT_KEYWORDS: list[tuple[str, str, str]] = [
    ("silverpoint", "Metalpoint", "Silverpoint"),
    ("silver point", "Metalpoint", "Silverpoint"),
    ("goldpoint", "Metalpoint", "Goldpoint"),
    ("gold point", "Metalpoint", "Goldpoint"),
    ("metalpoint", "Metalpoint", "Metalpoint"),
    ("metal point", "Metalpoint", "Metalpoint"),
    ("copperpoint", "Metalpoint", "Copperpoint"),
    ("leadpoint", "Metalpoint", "Leadpoint"),
    ("lead point", "Metalpoint", "Leadpoint"),
]

# (c) Paper-stock guard. A token that NAMES a paper stock is Paper, whatever
# colour ("green paper") or paper-finish/furnish word ("somerset satin paper",
# "montgolfier linen paper") sits inside it — as long as the paper is the
# SUBSTANCE, not a substrate. The distinguisher is a support preposition:
# "graphite on paper" / "gouache mounted to paper" is the medium (paper is the
# support, handled by the keyword pass); "green paper" / "somerset satin paper" /
# "hand-made paper by barcham green" is the stock. So: fire when "paper" is
# present as a word AND no support preposition precedes it.
_PAPER_WORD = re.compile(r"\bpapers?\b")
_SUPPORT_PREP = re.compile(r"\b(on|upon|onto|mounted|adhered|affixed|laid|over|to)\b")


def _is_paper_stock(text: str) -> bool:
    return bool(_PAPER_WORD.search(text)) and not _SUPPORT_PREP.search(text)


# --- Technique-vocab gap fill (added to the supplementary pass) -----------------
# Real print / textile / surface techniques the curated leaves don't cover, so
# they were falling through to Other/unresolved. Kept at supplementary confidence
# (0.5) for curator review. Some may ultimately belong to a Technique facet.
TECHNIQUE_KEYWORDS: dict[str, list[tuple[str, str, str]]] = {
    "Prints": [
        ("hardground", "Etching", "Hard-ground etching"),
        ("hard ground", "Etching", "Hard-ground etching"),
        ("soft ground", "Etching", "Soft-ground etching"),
        ("softground", "Etching", "Soft-ground etching"),
        ("offset print", "Offset lithograph", "Offset lithograph"),
        ("oban print", "Woodcut", "Woodcut"),
        ("burin", "Engraving", "Engraving"),
        ("scraping", "Mezzotint", "Mezzotint"),
        ("burnishing", "Mezzotint", "Mezzotint"),
        ("burnish", "Mezzotint", "Mezzotint"),
        ("stipple", "Engraving", "Stipple"),
    ],
    "Ink & drawing media": [
        ("incised", "Incising", "Incising"),
    ],
    "Metal": [
        ("gilding", "Gilt & gold leaf", "Gilding"),
        ("gilt", "Gilt & gold leaf", "Gilt"),
        ("gold leaf", "Gilt & gold leaf", "Gold leaf"),
    ],
    "Paint & pigment": [
        ("polychrome", "Pigment", "Polychrome"),
        ("polychromed", "Pigment", "Polychrome"),
    ],
    "Textiles & fiber": [
        ("supplementary weft", "Weaving", "Supplementary-weft patterning"),
        ("supplementary-weft", "Weaving", "Supplementary-weft patterning"),
        ("weft patterning", "Weaving", "Supplementary-weft patterning"),
    ],
}


@dataclass(frozen=True)
class Tier1Path:
    """A token's resolved Tier-1/2/3 path plus provenance for curator triage."""

    tier1: str
    tier2: str
    tier3: str
    source: str  # curated|override|keyword|supplementary|not_medium|unresolved
    confidence: float
    suppress_suggested: bool
    suppressed: bool = False


def _norm(s: str) -> str:
    return (s or "").strip().lower()


def _kw_hit(keyword: str, text: str) -> bool:
    """Substring match for long keywords, whole-word for short ones."""
    if len(keyword) >= SUBSTRING_MIN_LEN:
        return keyword in text
    return re.search(rf"\b{re.escape(keyword)}\b", text) is not None


class Tier1Classifier:
    """Holds the curated overrides + derived keyword tables; resolves a token.

    `curated_rows` is the crosswalk from the curated sheet: dicts with tier1 /
    tier2 / tier3 / leaf keys (as produced by push_tier1_medium_map_sheet.
    build_rows). Every distinct label becomes both an exact-match override and a
    keyword seed for its Tier-1 (+ Tier-2/3 within that Tier-1).
    """

    def __init__(self, curated_rows: list[dict]):
        # exact label -> (tier1, tier2, tier3)
        self._exact: dict[str, tuple[str, str, str]] = {}
        # tier1 -> list[(keyword, tier2, tier3)], longest-keyword-first so a
        # specific term ("silk velvet") beats a general one ("silk").
        self._kw: dict[str, list[tuple[str, str, str]]] = {t: [] for t in TIER1_ORDER}
        # Same shape, but the hand-picked supplementary roots (source tagged
        # "supplementary" so curators can distinguish them from curator-derived).
        # The technique-gap keywords fold in here too — same confidence tier.
        self._supp: dict[str, list[tuple[str, str, str]]] = {
            t: list(kws) for t, kws in SUPPLEMENTARY_KEYWORDS.items()
        }
        for t1, kws in TECHNIQUE_KEYWORDS.items():
            self._supp.setdefault(t1, []).extend(kws)

        # A bare Tier-2 label must resolve to its own tier (empty Tier-3), never
        # borrow the first child's Tier-3 - so token "paper" -> (…, Paper, "")
        # not (…, Paper, "wove paper"). Register leaf/Tier-3 to the full path
        # FIRST, then Tier-2 labels only where nothing more specific claimed them,
        # and a leaf-level path always wins over the bare-Tier-2 fallback.
        for r in curated_rows:
            t1, t2, t3 = r["tier1"], r.get("tier2", ""), r.get("tier3", "")
            leaf = r.get("leaf") or t3 or t2
            if not (t1 and leaf):
                continue
            # Leaf + explicit Tier-3 -> full path.
            for label in {leaf, t3}:
                if label:
                    self._exact.setdefault(_norm(label), (t1, t2 or leaf, t3))
            # Keyword seed: the leaf word(s) point at this Tier-1 leaf.
            self._kw.setdefault(t1, []).append((_norm(leaf), t2 or leaf, t3 or leaf))
        # Second pass: bare Tier-2 labels, resolving to (t1, t2, "") - but only if
        # no leaf/Tier-3 already claimed that string (a genuine leaf wins).
        for r in curated_rows:
            t1, t2 = r["tier1"], r.get("tier2", "")
            if t2:
                self._exact.setdefault(_norm(t2), (t1, t2, ""))

        for t1 in self._kw:
            self._kw[t1].sort(key=lambda kv: len(kv[0]), reverse=True)
        for t1 in self._supp:
            self._supp[t1].sort(key=lambda kv: len(kv[0]), reverse=True)

    def classify(
        self, token: str, *, canonical: str = "", facet_final: str = ""
    ) -> Tier1Path:
        """Resolve a token, then apply two curator fixups regardless of which
        pass produced the result (so a composite phrase, not just the bare
        token, is corrected the same way):

        - colour-only buckets ("green"/"yellow") are suppressed entirely.
        - "Rhinestone" moves under Textiles & fiber / Trimmings (it was its
          own Glass leaf; rhinestones aren't reliably glass).
        """
        p = self._classify(token, canonical=canonical, facet_final=facet_final)
        if p.tier3.lower() in SUPPRESSED_TOKENS:
            return Tier1Path("Other", "", "", "suppressed", 1.0, False, True)
        if p.tier3.lower() == "rhinestone" and p.tier1 != "Textiles & fiber":
            return Tier1Path(
                "Textiles & fiber", "Trimmings", "Rhinestone", "normalised", 1.0, False
            )
        return p

    def _classify(
        self, token: str, *, canonical: str = "", facet_final: str = ""
    ) -> Tier1Path:
        tok = _norm(token)
        can = _norm(canonical)

        def _hit(kw: str) -> bool:
            return bool(kw) and (_kw_hit(kw, tok) or (can and _kw_hit(kw, can)))

        # 0. bare colour tokens suppressed from the facet entirely.
        if tok in SUPPRESSED_TOKENS or (can and can in SUPPRESSED_TOKENS):
            return Tier1Path("Other", "", "", "suppressed", 1.0, False, True)

        # 0b. curator normalisation buckets — exact-token match, wins outright.
        for key in (tok, can):
            if key and key in NORMALISATION_KEYWORDS:
                t1, t2, t3 = NORMALISATION_KEYWORDS[key]
                return Tier1Path(t1, t2, t3, "normalised", 1.0, False)

        # 0c. same buckets, phrase-matched inside composites (see _NORM_PHRASES).
        for phrase, (t1, t2, t3) in _NORM_PHRASES:
            if phrase in tok or (can and phrase in can):
                return Tier1Path(t1, t2, t3, "normalised", 1.0, False)

        # 1. curated exact override (token or its canonical form)
        for key in (tok, can):
            if key and key in self._exact:
                t1, t2, t3 = self._exact[key]
                return Tier1Path(t1, t2, t3, "curated", 1.0, False)

        # 2. HIGH-PRIORITY overrides — run before the greedy keyword pass so an
        #    incidental word (image-forming silver, a colour, a paper-finish name)
        #    can't grab the token first.
        # 2a. Photographic-print composites -> Prints (not Metal/Glass).
        for kw, t2, t3 in PHOTO_PRINT_KEYWORDS:
            if _hit(kw):
                return Tier1Path("Prints", t2, t3, "override", 0.9, False)
        # 2b. Metalpoint drawing techniques -> Ink & drawing media (not Metal).
        for kw, t2, t3 in METALPOINT_KEYWORDS:
            if _hit(kw):
                return Tier1Path("Ink & drawing media", t2, t3, "override", 0.9, False)
        # 2c. Paper-stock guard: a token naming a paper stock is paper, whatever
        #     colour/fibre word sits inside it (but "medium on paper" is the
        #     medium, not the paper — see _is_paper_stock).
        if _is_paper_stock(tok) or (can and _is_paper_stock(can)):
            return Tier1Path("Paper & parchment", "Paper", "", "override", 0.9, False)

        # 3. explicitly not a medium per master_v2 (own flag): park in Other before
        #    the keyword pass, so "hand painted border in a portfolio…" isn't
        #    grabbed as Paint by an incidental "painted".
        if facet_final == "not_medium":
            return Tier1Path("Other", "", "", "not_medium", 0.5, True)

        # 4. derived-keyword pass (from the curated leaves), Tier-1s in priority order
        for t1 in TIER1_ORDER:
            for kw, t2, t3 in self._kw.get(t1, []):
                if _hit(kw):
                    return Tier1Path(t1, t2, t3, "keyword", 0.6, False)

        # 5. supplementary hand-picked roots + technique-gap keywords
        for t1 in TIER1_ORDER:
            for kw, t2, t3 in self._supp.get(t1, []):
                if _hit(kw):
                    return Tier1Path(t1, t2, t3, "supplementary", 0.5, False)

        # 6. nothing fired
        return Tier1Path("Other", "", "", "unresolved", 0.0, False)
