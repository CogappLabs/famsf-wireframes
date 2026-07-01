"""Curated taxonomy data for the FAMSF medium facet.

Three ordered keyword tables drive a 3-level tree, organised by **object type**
(how a visitor thinks: "show me prints / paintings / photographs"), not by the
material-vs-technique distinction TMS records:

  SECTIONS      level 1 - the object-type bucket (Print, Drawing, Painting,
                Photograph, Sculpture, Textile, Ceramic & glass,
                Decorative & other). A print stays a Print whatever it is printed
                on, so "lithograph on wove paper" is a Print, not filed under
                paper.
  SUBCATEGORIES level 2 - within a type, the technique or material family
                (Intaglio / Lithograph / Silk / Porcelain …).
  SPECIFICS     level 3 - the canonical leaf (Etching, Engraving, Silk …) that
                every raw variant collapses to.

Labels are public-first with the specialist term in parentheses. Keyword order
IS priority: the first entry whose keyword the token matches wins, so lists run
specific-before-general. An empty keyword list marks a table's catch-all entry.

The raw TMS term is never a facet value - it is preserved for object-page display
in the crosswalk's `token` column.
"""

# The catch-all section label, used when nothing else matches.
OTHER_SECTION = "Other / unclassified"

# ---------------------------------------------------------------------------
# Level 1 - object-type sections. Ordered by priority (first match wins), which
# also roughly tracks FAMSF collection volume. Photograph is tried before Print
# because photographic works often say "print"; Drawing/Painting are split by
# their media; Sculpture and the material types catch 3-D and craft objects.
#
# `aat_facet` optionally constrains which AAT facet a section accepts
# ("technique" | "material" | None). A type that is a process (Print, Drawing,
# Painting, Photograph) leans technique; a type defined by substance (Textile,
# Ceramic & glass) leans material; Sculpture and Decorative accept either.
# ---------------------------------------------------------------------------
SECTIONS: list[dict] = [
    {
        "name": "Photograph",
        "aat_facet": None,
        "keywords": [
            "photograph",
            "photo",
            "gelatin silver",
            "silver gelatin",
            "silver print",
            "albumen",
            "platinum print",
            "palladium print",
            "carbon print",
            "cyanotype",
            "daguerreotype",
            "ambrotype",
            "tintype",
            "polaroid",
            "chromogenic",
            "c print",
            "c-print",
            "dye transfer",
            "inkjet",
            "giclee",
            "digital print",
            "woodburytype",
            "photogravure",
            "photomechanical",
            "negative",
            "transparency",
            "slide",
        ],
    },
    {
        "name": "Print",
        "aat_facet": "technique",
        "keywords": [
            "etching",
            "engraving",
            "lithograph",
            "woodcut",
            "wood engraving",
            "woodblock",
            "wood block",
            "drypoint",
            "aquatint",
            "mezzotint",
            "screenprint",
            "serigraph",
            "silkscreen",
            "linocut",
            "linoleum",
            "monotype",
            "monoprint",
            "relief print",
            "relief etching",
            "intaglio",
            "letterpress",
            "line block",
            "offset",
            "collotype",
            "pochoir",
            "stencil",
            "stipple",
            "chromolithograph",
            "heliogravure",
            "gillotage",
            "print",
            "printing",
        ],
    },
    {
        "name": "Drawing",
        "aat_facet": None,
        "keywords": [
            "ink",
            "graphite",
            "pencil",
            "charcoal",
            "chalk",
            "pastel",
            "crayon",
            "conté",
            "conte",
            "sanguine",
            "sepia",
            "pen",
            "felt-tip",
            "marker",
            "drawing",
            "silverpoint",
            "metalpoint",
        ],
    },
    {
        "name": "Painting",
        "aat_facet": None,
        "keywords": [
            "oil",
            "watercolor",
            "watercolour",
            "gouache",
            "tempera",
            "acrylic",
            "encaustic",
            "enamel paint",
            "painting",
            "painted",
            "paint",
            # NB: bare "pigment" is deliberately NOT a Painting keyword - it drags
            # pigment-decorated ceramic/wood ("earthenware and pigment", "wood and
            # pigment") into Painting. Pigment as a paint medium is caught by the
            # "paint" family; a standalone pigment object stays in its material
            # section or Other.
        ],
    },
    {
        "name": "Textile",
        "aat_facet": "material",
        "keywords": [
            "silk",
            "wool",
            "cotton",
            "linen",
            "fiber",
            "fibre",
            "textile",
            "thread",
            "yarn",
            "lace",
            "velvet",
            "satin",
            "damask",
            "felt",
            "muslin",
            "tapestry",
            "ribbon",
            "cloth",
            "fabric",
            "hemp",
            "jute",
            "rayon",
            "nylon",
            "polyester",
            "tulle",
            "gauze",
            "embroidery",
            "weave",
            "weaving",
            "woven",
            "knitting",
            "knotted",
            "batik",
            "ikat",
            "brocade",
            "applique",
            "appliqué",
            "weft",
            "warp",
            "raffia",
            "bark cloth",
            "camelid",
            "alpaca",
            "cashmere",
            "mohair",
        ],
    },
    {
        "name": "Ceramic & glass",
        "aat_facet": "material",
        "keywords": [
            "ceramic",
            "porcelain",
            "earthenware",
            "stoneware",
            "terracotta",
            "terra cotta",
            "faience",
            "majolica",
            "delftware",
            "clay",
            "pottery",
            "glaze",
            "glass",
            "crystal",
        ],
    },
    {
        "name": "Sculpture",
        "aat_facet": None,
        "keywords": [
            "bronze",
            "marble",
            "cast",
            "carved",
            "plaster",
            "terra cotta sculpture",
            "sculpture",
            "modelled",
            "modeled",
        ],
    },
    {
        "name": "Decorative & other materials",
        "aat_facet": None,
        "keywords": [
            "silver",
            "gold",
            "brass",
            "copper",
            "iron",
            "steel",
            "pewter",
            "tin",
            "metal",
            "wood",
            "ivory",
            "bone",
            "shell",
            "leather",
            "horn",
            "jade",
            "stone",
            "lacquer",
            "plastic",
            "enamel",
            "gilt",
            "gilding",
            "beads",
            "bead",
            "bamboo",
            "rattan",
            "feather",
            "feathers",
            "straw",
            "wax",
            "amber",
            "coral",
        ],
    },
]

# ---------------------------------------------------------------------------
# Level 2 - subcategory keyword sets per section. First match wins; the empty
# keyword list is the section's catch-all.
# ---------------------------------------------------------------------------
SUBCATEGORIES: dict[str, list[tuple[str, list[str]]]] = {
    "Print": [
        (
            "Relief prints (woodcut, linocut)",
            [
                "woodcut",
                "wood engraving",
                "wood-engraving",
                "woodblock",
                "wood block",
                "linocut",
                "linoleum",
                "relief print",
                "relief etching",
                "letterpress",
                "line block",
            ],
        ),
        (
            "Etching & engraving (intaglio)",
            [
                "etching",
                "engraving",
                "drypoint",
                "aquatint",
                "mezzotint",
                "intaglio",
                "stipple",
                "burin",
            ],
        ),
        (
            "Lithographs (planographic)",
            [
                "lithograph",
                "offset",
                "collotype",
                "monotype",
                "monoprint",
                "chromolithograph",
                "litho",
            ],
        ),
        (
            "Screenprints & stencils",
            ["screenprint", "serigraph", "silkscreen", "pochoir", "stencil"],
        ),
        ("Other print process", []),
    ],
    "Drawing": [
        # One Ink bucket: a visitor doesn't distinguish "ink" from "pen and ink"
        # (pen is the tool, not a separate medium), so pen work folds into Ink.
        ("Ink", ["ink", "pen"]),
        (
            "Pencil, chalk & crayon",
            [
                "graphite",
                "pencil",
                "charcoal",
                "chalk",
                "pastel",
                "crayon",
                "conté",
                "conte",
                "sanguine",
                "sepia",
            ],
        ),
        ("Metalpoint", ["silverpoint", "metalpoint"]),
        ("Other drawing media", []),
    ],
    "Painting": [
        ("Oil", ["oil"]),
        ("Gouache / opaque watercolor", ["gouache", "opaque watercolor"]),
        ("Watercolor", ["watercolor", "watercolour"]),
        ("Tempera", ["tempera"]),
        ("Acrylic", ["acrylic"]),
        ("Encaustic", ["encaustic"]),
        ("Other paint", []),
    ],
    "Photograph": [
        ("Gelatin silver print", ["gelatin silver", "gelatin", "silver print"]),
        ("Albumen print", ["albumen"]),
        ("Platinum / palladium print", ["platinum", "palladium"]),
        ("Carbon print", ["carbon"]),
        ("Cyanotype", ["cyanotype"]),
        ("Daguerreotype", ["daguerreotype"]),
        ("Ambrotype / tintype", ["ambrotype", "tintype"]),
        (
            "Chromogenic / C print",
            ["chromogenic", "c print", "c-print", "dye transfer"],
        ),
        ("Digital / inkjet print", ["inkjet", "giclee", "digital", "xerox"]),
        (
            "Photogravure / photomechanical",
            ["photogravure", "photomechanical", "woodburytype"],
        ),
        ("Negative / transparency", ["negative", "transparency", "slide"]),
        ("Photograph (unspecified)", ["photograph", "photo"]),
        ("Other photographic", []),
    ],
    "Textile": [
        (
            "Natural fiber (silk, wool, cotton)",
            [
                "silk",
                "wool",
                "cotton",
                "linen",
                "hemp",
                "jute",
                "camelid",
                "alpaca",
                "cashmere",
                "mohair",
            ],
        ),
        ("Synthetic fiber (nylon, polyester)", ["rayon", "nylon", "polyester"]),
        (
            "Woven & worked cloth",
            [
                "lace",
                "velvet",
                "satin",
                "damask",
                "felt",
                "brocade",
                "muslin",
                "tulle",
                "gauze",
                "cloth",
                "fabric",
            ],
        ),
        (
            "Textile technique (weaving, embroidery)",
            [
                "weave",
                "weaving",
                "woven",
                "embroidery",
                "embroidered",
                "knitting",
                "knotted",
                "batik",
                "ikat",
            ],
        ),
        ("Thread & trimmings", ["thread", "yarn", "ribbon", "sequin"]),
        ("Other textile", []),
    ],
    "Ceramic & glass": [
        ("Porcelain", ["porcelain", "bone china"]),
        (
            "Earthenware & stoneware",
            [
                "earthenware",
                "stoneware",
                "terracotta",
                "terra cotta",
                "faience",
                "majolica",
                "delftware",
                "redware",
            ],
        ),
        ("Glass", ["glass", "crystal"]),
        ("Other ceramic", ["ceramic", "clay", "pottery", "glaze"]),
        ("Other ceramic & glass", []),
    ],
    "Sculpture": [
        ("Bronze", ["bronze"]),
        ("Marble", ["marble"]),
        ("Stone", ["stone", "granite", "limestone", "alabaster"]),
        ("Wood", ["wood", "carved wood"]),
        ("Plaster", ["plaster"]),
        ("Cast / modelled", ["cast", "modelled", "modeled"]),
        ("Other sculpture material", []),
    ],
    "Decorative & other materials": [
        ("Precious metal (gold, silver)", ["gold", "silver", "sterling", "platinum"]),
        (
            "Base metal (bronze, iron, copper)",
            [
                "bronze",
                "brass",
                "copper",
                "iron",
                "steel",
                "tin",
                "pewter",
                "zinc",
            ],
        ),
        ("Wood", ["wood", "oak", "walnut", "mahogany", "ebony", "bamboo"]),
        (
            "Animal material (ivory, bone, leather)",
            ["ivory", "bone", "shell", "leather", "horn", "tusk", "antler"],
        ),
        ("Lacquer & enamel", ["lacquer", "enamel", "urushi"]),
        ("Plastic & synthetic", ["plastic", "rubber", "vinyl", "resin"]),
        (
            "Beads, feathers & plant material",
            ["bead", "beads", "feather", "bamboo", "rattan", "straw", "coral", "amber"],
        ),
        ("Other material", []),
    ],
}

# ---------------------------------------------------------------------------
# Level 3 - canonical leaf keyword sets per subcategory. First match wins;
# specific-before-general. The empty keyword list is the subcategory's catch-all
# (also used for genuine conjunction composites). Subcategories omitted here
# collapse to a single leaf named after the subcategory.
# ---------------------------------------------------------------------------
SPECIFICS: dict[str, list[tuple[str, list[str]]]] = {
    # ---- Print ----
    "Relief prints (woodcut, linocut)": [
        ("Wood engraving", ["wood engraving", "wood-engraving"]),
        ("Woodcut", ["woodcut", "woodblock", "wood block", "wood cut"]),
        ("Linocut", ["linocut", "linoleum", "lino"]),
        ("Letterpress & line block", ["letterpress", "line block", "line-block"]),
        ("Relief etching", ["relief etching", "relief"]),
        ("Mixed / other relief", []),
    ],
    "Etching & engraving (intaglio)": [
        ("Etching", ["etching", "etched"]),
        ("Engraving", ["engraving", "engraved", "burin"]),
        ("Drypoint", ["drypoint"]),
        ("Aquatint", ["aquatint"]),
        ("Mezzotint", ["mezzotint"]),
        ("Stipple", ["stipple"]),
        ("Mixed / other intaglio", []),
    ],
    "Lithographs (planographic)": [
        ("Offset lithograph", ["offset"]),
        ("Chromolithograph", ["chromolithograph", "chromo"]),
        ("Collotype", ["collotype"]),
        ("Monotype / monoprint", ["monotype", "monoprint"]),
        ("Lithograph", ["lithograph", "litho"]),
        ("Mixed / other planographic", []),
    ],
    "Screenprints & stencils": [
        ("Screenprint", ["screenprint", "silkscreen", "serigraph"]),
        ("Pochoir", ["pochoir"]),
        ("Stencil", ["stencil"]),
        ("Other stencil work", []),
    ],
    # ---- Drawing ----
    "Ink": [
        ("Black ink", ["black ink", "india ink", "indian ink", "sumi"]),
        ("Brown ink", ["brown ink", "bistre", "sepia ink"]),
        ("Colored ink", ["colored ink", "coloured ink", "color ink"]),
        ("Ink (unspecified)", ["ink"]),
        ("Other ink", []),
    ],
    "Pencil, chalk & crayon": [
        ("Graphite / pencil", ["graphite", "pencil"]),
        ("Charcoal", ["charcoal"]),
        ("Chalk", ["chalk"]),
        ("Pastel", ["pastel"]),
        ("Crayon", ["crayon"]),
        ("Conté / sanguine", ["conté", "conte", "sanguine"]),
        ("Other dry media", []),
    ],
    # ---- Painting ----
    "Oil": [
        ("Oil on canvas", ["canvas"]),
        ("Oil on panel", ["panel", "wood"]),
        ("Oil (other support)", []),
    ],
    # ---- Photograph ----
    "Digital / inkjet print": [
        ("Inkjet / pigment print", ["inkjet", "pigment print", "giclee"]),
        ("Xerox", ["xerox"]),
        ("Digital (unspecified)", ["digital"]),
        ("Other digital", []),
    ],
    # ---- Textile ----
    "Natural fiber (silk, wool, cotton)": [
        ("Silk", ["silk"]),
        ("Wool", ["wool", "fleece"]),
        ("Cotton", ["cotton"]),
        ("Linen", ["linen", "flax"]),
        ("Camelid / alpaca", ["camelid", "alpaca", "llama", "vicuña", "vicuna"]),
        ("Other natural fiber", []),
    ],
    "Textile technique (weaving, embroidery)": [
        ("Tapestry", ["tapestry"]),
        ("Knotted pile", ["knotted pile", "knotted", "pile"]),
        ("Embroidery", ["embroidery", "embroidered", "needlework"]),
        ("Knitting / crochet", ["knitting", "knitted", "crochet"]),
        ("Weaving", ["weave", "weaving", "woven", "warp", "weft"]),
        ("Resist dyeing (batik, ikat)", ["batik", "ikat", "resist"]),
        ("Applique / patchwork", ["applique", "appliqué", "patchwork", "pieced"]),
        ("Other textile technique", []),
    ],
    # ---- Ceramic & glass ----
    "Porcelain": [
        ("Soft-paste porcelain", ["soft-paste", "soft paste"]),
        ("Hard-paste porcelain", ["hard-paste", "hard paste"]),
        ("Bone china", ["bone china"]),
        ("Porcelain (unspecified)", ["porcelain"]),
        ("Other porcelain", []),
    ],
    "Earthenware & stoneware": [
        ("Earthenware", ["earthenware", "redware", "faience", "majolica", "delft"]),
        ("Stoneware", ["stoneware"]),
        ("Terracotta", ["terracotta", "terra cotta"]),
        ("Other", []),
    ],
    "Glass": [
        ("Blown glass", ["blown"]),
        ("Pressed / molded glass", ["pressed glass", "molded", "mold-"]),
        ("Lead / crystal glass", ["lead glass", "crystal"]),
        ("Stained glass", ["stained glass"]),
        ("Glass beads", ["bead"]),
        ("Glass (unspecified)", ["glass"]),
        ("Other glass", []),
    ],
    # ---- Sculpture ----
    "Stone": [
        ("Marble", ["marble"]),
        ("Granite / limestone", ["granite", "limestone", "sandstone"]),
        ("Alabaster", ["alabaster"]),
        ("Other stone", []),
    ],
    # ---- Decorative & other ----
    "Precious metal (gold, silver)": [
        ("Silver", ["silver"]),
        ("Gold", ["gold"]),
        ("Platinum", ["platinum"]),
        ("Other precious metal", []),
    ],
    "Base metal (bronze, iron, copper)": [
        ("Bronze", ["bronze"]),
        ("Brass", ["brass"]),
        ("Copper", ["copper"]),
        ("Iron", ["iron"]),
        ("Steel", ["steel"]),
        ("Pewter / tin", ["pewter", "tin"]),
        ("Other base metal", []),
    ],
    "Animal material (ivory, bone, leather)": [
        ("Ivory / tusk", ["ivory", "tusk", "walrus"]),
        ("Bone / antler / horn", ["bone", "antler", "horn", "baleen"]),
        ("Shell", ["shell"]),
        ("Leather / hide", ["leather", "hide", "suede"]),
        ("Other animal material", []),
    ],
}
