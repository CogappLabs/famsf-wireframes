import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Container,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

// Section order follows the June 18 2026 page-layouts spec ("New organization"):
// header → intro text → deep dive / collection history → highlights →
// featured collections → read/watch/listen → other resources.
// The Collection "About" page is folded into the intro here; off-spec sections
// (stats, browse options, provenance statement, related programs) were removed
// to match the doc flow.
//
// Per-area dynamic route: `[slug]` selects the area from the AREAS map below
// (keys are the canonical collection-area names from the collection-areas index;
// slugs are kebab-case derivations via slugify). Statically generated per area
// at build time via generateStaticParams. An unmatched slug 404s (notFound).
// European Decorative Arts and Sculpture carries the original verbatim copy; the
// other ten areas use plausible wireframe-grade placeholder content.

interface Highlight {
	title: string;
	artist: string;
	date: string;
	medium: string;
}

interface Featured {
	name: string;
	desc: string;
	count: string;
}

interface MediaItem {
	kicker: string;
	title: string;
	desc: string;
	meta: string;
}

interface ResourceItem {
	title: string;
	desc: string;
}

interface AreaData {
	name: string;
	museums: string;
	intro: string[];
	history: string[];
	highlights: Highlight[];
	featured: Featured[];
	media: MediaItem[];
	resources: ResourceItem[];
}

/** Kebab-case an area name into a route slug. Lowercase, spaces → hyphens,
 *  strip everything that is not alphanumeric or a hyphen, collapse repeats.
 *  Shared by the index, landing, and this route so hrefs always match keys. */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const AREAS: Record<string, AreaData> = {
	// Default fallback. Original verbatim copy from the hardcoded page.
	"European Decorative Arts and Sculpture": {
		name: "European Decorative Arts and Sculpture",
		museums: "de Young Museum & Legion of Honor",
		intro: [
			"The European Decorative Arts and Sculpture collection encompasses over 6,000 works spanning from the medieval period to the early twentieth century. The collection is particularly distinguished by its world-renowned holdings of sculpture by Auguste Rodin, including The Thinker, The Three Shades, and numerous other works displayed at the Legion of Honor.",
			"The collection also features exceptional examples of French decorative arts from the eighteenth century, including furniture, porcelain, silver, and gilt bronze. Major holdings include works by Peter Carl Fabergé and significant examples of European ceramics and metalwork.",
		],
		history: [
			"The department took shape in the 1920s around Alma de Bretteville Spreckels' founding gift of Rodin sculpture, which anchored the new Legion of Honor on its opening in 1924. Cast during the artist's lifetime and acquired directly through his circle, these bronzes set the collection's early character and remain its signature holding.",
			"Across the twentieth century the holdings broadened through major donor bequests of French eighteenth-century furniture, Sèvres and Meissen porcelain, and goldsmiths' work, including a concentration of Fabergé objects. Period-room installations and the merger of the de Young and Legion collections in 1972 consolidated European decorative arts as a single curatorial area.",
			"Recent growth has focused on filling chronological and regional gaps, deepening provenance research on objects with complex twentieth-century ownership histories, and conserving works for rotation between the two museum sites.",
		],
		highlights: [
			{
				title: "The Thinker",
				artist: "Auguste Rodin",
				date: "modeled ca. 1880, cast 1904",
				medium: "Bronze",
			},
			{
				title: "The Three Shades",
				artist: "Auguste Rodin",
				date: "modeled ca. 1881, cast ca. 1898",
				medium: "Bronze",
			},
			{
				title: "Kovsh",
				artist: "Peter Carl Fabergé",
				date: "ca. 1900",
				medium: "Jade, gold, rubies, sapphires",
			},
			{
				title: "Pair of Candelabra",
				artist: "Pierre Gouthière",
				date: "ca. 1775",
				medium: "Gilt bronze and marble",
			},
			{
				title: "Writing Table",
				artist: "Bernard II van Risenburgh",
				date: "ca. 1750",
				medium: "Oak, lacquer, gilt bronze",
			},
			{
				title: "Virgin and Child",
				artist: "Unknown artist",
				date: "ca. 1320–1340",
				medium: "Ivory with traces of paint",
			},
		],
		featured: [
			{
				name: "The Rodin Collection",
				desc: "One of the most significant holdings of Auguste Rodin's sculpture outside Paris.",
				count: "402 objects",
			},
			{
				name: "Fabergé Holdings",
				desc: "Imperial objects, hardstone carvings, and jeweled works by Peter Carl Fabergé.",
				count: "118 objects",
			},
			{
				name: "French 18th-century Furniture",
				desc: "Ébéniste cabinetry, gilt bronze mounts, and royal-provenance case pieces.",
				count: "276 objects",
			},
			{
				name: "European Ceramics",
				desc: "Sèvres, Meissen, and maiolica spanning the Renaissance to the Rococo.",
				count: "531 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Rodin at the Legion of Honor: A History",
				desc: "The story of how San Francisco came to hold one of the most significant collections of Rodin sculpture outside Paris.",
				meta: "8 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Inside the Conservation Studio: Casting Bronze",
				desc: "Conservators walk through the lost-wax casting process behind the museum's Rodin bronzes.",
				meta: "12 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Fabergé and the Art of the Goldsmith",
				desc: "A curator-led audio tour exploring the craftsmanship behind the museum's Fabergé holdings.",
				meta: "9 min listen",
			},
		],
		resources: [
			{
				title: "Achenbach Foundation Study Room",
				desc: "Works on paper viewable by appointment with the department.",
			},
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Achenbach Foundation for Graphic Arts": {
		name: "Achenbach Foundation for Graphic Arts",
		museums: "de Young Museum",
		intro: [
			"The Achenbach Foundation for Graphic Arts holds the museum's collection of works on paper: prints, drawings, watercolors, and artists' books spanning more than five centuries. With well over 90,000 works, it is one of the largest such collections in the western United States.",
			"Strengths range from Old Master engravings and Japanese woodblock prints to twentieth-century lithographs and contemporary editions, alongside a deep reference library. Most works are housed in the study room and rotate through gallery displays for conservation reasons.",
		],
		history: [
			"The foundation was established in 1948 through the gift of Moore and Hazel Achenbach, whose private collection of prints and drawings formed its founding core. It was incorporated into the Fine Arts Museums of San Francisco at the de Young.",
			"Successive curators expanded the holdings across European, American, and Asian graphic arts, building one of the most comprehensive teaching collections on the West Coast and a study room used by scholars, students, and artists.",
			"Recent acquisitions emphasise contemporary printmaking, under-represented makers, and works that document Bay Area artistic communities, while ongoing conservation supports rotation between storage and the galleries.",
		],
		highlights: [
			{
				title: "The Great Wave off Kanagawa",
				artist: "Katsushika Hokusai",
				date: "ca. 1830–1832",
				medium: "Woodblock print",
			},
			{
				title: "Melencolia I",
				artist: "Albrecht Dürer",
				date: "1514",
				medium: "Engraving",
			},
			{
				title: "Self-Portrait",
				artist: "Rembrandt van Rijn",
				date: "ca. 1639",
				medium: "Etching",
			},
			{
				title: "Los Caprichos (plate)",
				artist: "Francisco de Goya",
				date: "1799",
				medium: "Etching and aquatint",
			},
			{
				title: "Le Jockey",
				artist: "Henri de Toulouse-Lautrec",
				date: "1899",
				medium: "Lithograph",
			},
			{
				title: "Study of Hands",
				artist: "Unknown artist",
				date: "ca. 1600",
				medium: "Red chalk on paper",
			},
		],
		featured: [
			{
				name: "Japanese Woodblock Prints",
				desc: "Ukiyo-e and shin-hanga sheets from the Edo period through the twentieth century.",
				count: "640 objects",
			},
			{
				name: "Old Master Prints",
				desc: "Engravings and etchings by Dürer, Rembrandt, and their contemporaries.",
				count: "1,240 objects",
			},
			{
				name: "Modern Editions",
				desc: "Twentieth-century lithographs, screenprints, and artists' books.",
				count: "880 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Inside the Achenbach Study Room",
				desc: "How a working print room serves scholars, students, and artists at the de Young.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Handling Works on Paper",
				desc: "A conservator demonstrates the care and storage of prints and drawings.",
				meta: "10 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "The Art of the Woodblock Print",
				desc: "A curator-led tour through the museum's Japanese print holdings.",
				meta: "8 min listen",
			},
		],
		resources: [
			{
				title: "Achenbach Foundation Study Room",
				desc: "Works on paper viewable by appointment with the department.",
			},
			{
				title: "Reference library",
				desc: "Catalogues raisonnés and print scholarship available to researchers.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Costume and Textile Arts": {
		name: "Costume and Textile Arts",
		museums: "de Young Museum",
		intro: [
			"The Costume and Textile Arts collection spans more than 13,000 works of dress, fashion, and textiles drawn from cultures across the globe and across two thousand years. It ranges from archaeological fragments to contemporary couture.",
			"Particular strengths include European and American fashion, ecclesiastical and ceremonial textiles, and a broad survey of weaving, embroidery, and dyeing traditions. The light-sensitive nature of textiles means works rotate frequently through dedicated galleries.",
		],
		history: [
			"The department grew from early gifts of lace, costume, and ceremonial textiles to the de Young, later consolidated into a single curatorial area as the collection broadened in scope.",
			"Major donor bequests added depth in European and American fashion, while curatorial collecting extended the holdings into global weaving and dye traditions, supported by a textile conservation program.",
			"Recent acquisitions emphasise contemporary fashion design and the documentation of textile techniques, balanced against the conservation demands of a highly light-sensitive collection.",
		],
		highlights: [
			{
				title: "Evening Gown",
				artist: "Charles James",
				date: "ca. 1950",
				medium: "Silk satin",
			},
			{
				title: "Mantle",
				artist: "Unknown artist",
				date: "ca. 100 BCE–100 CE",
				medium: "Camelid fiber",
			},
			{
				title: "Chasuble",
				artist: "Unknown artist",
				date: "ca. 1500",
				medium: "Silk and metal thread",
			},
			{
				title: "Day Dress",
				artist: "House of Worth",
				date: "ca. 1885",
				medium: "Silk and lace",
			},
			{
				title: "Kimono",
				artist: "Unknown artist",
				date: "ca. 1900",
				medium: "Silk with embroidery",
			},
			{
				title: "Embroidered Sampler",
				artist: "Unknown artist",
				date: "1798",
				medium: "Silk on linen",
			},
		],
		featured: [
			{
				name: "European Fashion",
				desc: "Couture and dress from the eighteenth century to the present day.",
				count: "1,420 objects",
			},
			{
				name: "Andean Textiles",
				desc: "Pre-Columbian weaving and fiber arts from the central Andes.",
				count: "560 objects",
			},
			{
				name: "Ecclesiastical Textiles",
				desc: "Vestments and ceremonial cloths in silk and metal thread.",
				count: "310 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Conserving the Fragile: Light and Textiles",
				desc: "Why textiles rotate so often, and how the museum protects them on display.",
				meta: "6 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Mounting a Couture Gown",
				desc: "Behind the scenes as the team prepares a dress for the gallery.",
				meta: "11 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Threads of the Andes",
				desc: "A curator on the weaving traditions behind the museum's Andean textiles.",
				meta: "9 min listen",
			},
		],
		resources: [
			{
				title: "Textile study appointments",
				desc: "Selected works viewable by appointment with the department.",
			},
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Arts of Africa": {
		name: "Arts of Africa",
		museums: "de Young Museum",
		intro: [
			"The Arts of Africa collection presents sculpture, masks, textiles, and ceremonial objects from across the continent, with particular depth in West and Central African traditions. The works speak to ritual, leadership, and daily life across many cultures and centuries.",
			"Highlights include figurative sculpture, beaded regalia, and masquerade objects, displayed in dedicated galleries at the de Young alongside related holdings from Oceania and the Americas.",
		],
		history: [
			"The collection developed through gifts and purchases that brought significant bodies of West and Central African art to the de Young, establishing African art as a distinct curatorial area.",
			"Curatorial collecting deepened the holdings in figurative sculpture and ceremonial regalia, with attention to documentation, cultural context, and the circumstances of acquisition.",
			"Recent work emphasises provenance research, community consultation, and the responsible interpretation of objects with sacred or ceremonial significance.",
		],
		highlights: [
			{
				title: "Reliquary Guardian Figure",
				artist: "Unknown Fang artist",
				date: "19th–20th century",
				medium: "Wood and metal",
			},
			{
				title: "Mask",
				artist: "Unknown Dan artist",
				date: "20th century",
				medium: "Wood",
			},
			{
				title: "Power Figure (Nkisi)",
				artist: "Unknown Kongo artist",
				date: "19th century",
				medium: "Wood, iron, mixed media",
			},
			{
				title: "Beaded Crown",
				artist: "Unknown Yoruba artist",
				date: "20th century",
				medium: "Glass beads and fiber",
			},
			{
				title: "Seated Couple",
				artist: "Unknown Dogon artist",
				date: "18th–19th century",
				medium: "Wood",
			},
			{
				title: "Kente Cloth",
				artist: "Unknown Asante artist",
				date: "20th century",
				medium: "Silk and cotton",
			},
		],
		featured: [
			{
				name: "West African Sculpture",
				desc: "Figurative and masquerade works from across the western Sahel and forest regions.",
				count: "420 objects",
			},
			{
				name: "Central African Art",
				desc: "Power figures, masks, and regalia from the Congo basin and beyond.",
				count: "260 objects",
			},
			{
				name: "Textiles and Regalia",
				desc: "Woven cloth, beadwork, and ceremonial dress.",
				count: "180 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Reading a Reliquary Figure",
				desc: "How form and material carry meaning in Fang sculpture.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Masquerade in Motion",
				desc: "Masks were made to move; a curator explores their performance context.",
				meta: "10 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Provenance and Responsibility",
				desc: "A conversation on collecting histories and community consultation.",
				meta: "12 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Provenance research",
				desc: "Ongoing documentation of collecting histories for African holdings.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Arts of Oceania": {
		name: "Arts of Oceania",
		museums: "de Young Museum",
		intro: [
			"The Arts of Oceania collection gathers sculpture, carving, and ceremonial objects from the island cultures of Melanesia, Polynesia, and Micronesia. The works reflect navigation, ancestry, and ritual across the vast Pacific.",
			"Strengths include figurative carving, shields, and adornment, shown in dedicated galleries at the de Young alongside the museum's African and American holdings.",
		],
		history: [
			"The collection took shape through gifts and acquisitions that brought significant Pacific material to the de Young, establishing Oceanic art as a curatorial area in its own right.",
			"Curatorial collecting broadened the holdings across Melanesian, Polynesian, and Micronesian traditions, with attention to documentation and cultural context.",
			"Recent work emphasises provenance, consultation with originating communities, and the careful interpretation of objects tied to ancestry and ceremony.",
		],
		highlights: [
			{
				title: "Ancestor Figure",
				artist: "Unknown artist, Papua New Guinea",
				date: "19th–20th century",
				medium: "Wood and pigment",
			},
			{
				title: "Malagan Carving",
				artist: "Unknown artist, New Ireland",
				date: "19th century",
				medium: "Wood, fiber, shell",
			},
			{
				title: "War Shield",
				artist: "Unknown artist, Solomon Islands",
				date: "19th century",
				medium: "Fiber, shell, pigment",
			},
			{
				title: "Tiki Pendant",
				artist: "Unknown Māori artist",
				date: "ca. 1800",
				medium: "Nephrite",
			},
			{
				title: "Canoe Prow Ornament",
				artist: "Unknown artist, Solomon Islands",
				date: "19th century",
				medium: "Wood and shell inlay",
			},
			{
				title: "Mask",
				artist: "Unknown artist, New Britain",
				date: "20th century",
				medium: "Barkcloth and fiber",
			},
		],
		featured: [
			{
				name: "Melanesian Carving",
				desc: "Figurative sculpture and ceremonial objects from New Guinea and island Melanesia.",
				count: "210 objects",
			},
			{
				name: "Polynesian Adornment",
				desc: "Personal ornament, weapons, and regalia from across Polynesia.",
				count: "140 objects",
			},
			{
				name: "Pacific Textiles",
				desc: "Barkcloth and woven fiber from across the region.",
				count: "90 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Carving Ancestry",
				desc: "How Malagan sculpture connects the living and the dead in New Ireland.",
				meta: "6 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "The Art of the Voyage",
				desc: "Navigation, canoe-building, and the material culture of the Pacific.",
				meta: "11 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Objects in Ceremony",
				desc: "A curator on the ritual lives of Oceanic works.",
				meta: "9 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Community consultation",
				desc: "Engagement with originating communities on interpretation and care.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Arts of the Americas": {
		name: "Arts of the Americas",
		museums: "de Young Museum",
		intro: [
			"The Arts of the Americas collection spans the indigenous and ancient cultures of North, Central, and South America, from monumental stone sculpture to ceramics, gold, and textiles. The works range across several thousand years.",
			"Strengths include Mesoamerican and Andean material, with figurative ceramics, metalwork, and stone carving displayed in dedicated galleries at the de Young.",
		],
		history: [
			"The collection grew from early gifts and acquisitions of Pre-Columbian art, later consolidated as a distinct curatorial area encompassing the ancient and indigenous Americas.",
			"Curatorial collecting deepened the Mesoamerican and Andean holdings, with attention to archaeological context, documentation, and the circumstances of acquisition.",
			"Recent work emphasises provenance research, consultation with descendant communities, and the responsible stewardship of culturally significant objects.",
		],
		highlights: [
			{
				title: "Seated Figure",
				artist: "Unknown Olmec artist",
				date: "ca. 1000–600 BCE",
				medium: "Ceramic",
			},
			{
				title: "Funerary Mask",
				artist: "Unknown artist, Peru",
				date: "ca. 900–1100 CE",
				medium: "Gold alloy",
			},
			{
				title: "Stirrup-Spout Vessel",
				artist: "Unknown Moche artist",
				date: "ca. 100–700 CE",
				medium: "Ceramic with slip",
			},
			{
				title: "Maya Vase",
				artist: "Unknown Maya artist",
				date: "ca. 600–900 CE",
				medium: "Painted ceramic",
			},
			{
				title: "Standing Figure",
				artist: "Unknown Aztec artist",
				date: "ca. 1400–1521 CE",
				medium: "Stone",
			},
			{
				title: "Feathered Panel",
				artist: "Unknown artist, Peru",
				date: "ca. 600–900 CE",
				medium: "Feathers on cotton",
			},
		],
		featured: [
			{
				name: "Mesoamerican Art",
				desc: "Olmec, Maya, and Aztec sculpture and ceramics from ancient Mexico and Central America.",
				count: "380 objects",
			},
			{
				name: "Andean Gold and Ceramics",
				desc: "Metalwork and figurative pottery from the central Andes.",
				count: "290 objects",
			},
			{
				name: "Ancient Textiles",
				desc: "Woven and featherwork panels from coastal Peru.",
				count: "150 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "The Goldsmiths of Ancient Peru",
				desc: "Technique and meaning in Andean metalwork.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Reading a Maya Vase",
				desc: "A curator decodes the imagery on a painted ceramic vessel.",
				meta: "10 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Stone and Ceremony",
				desc: "An audio tour through the museum's Mesoamerican sculpture.",
				meta: "8 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Provenance research",
				desc: "Ongoing documentation of collecting histories for ancient American holdings.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"American Decorative Arts and Sculpture": {
		name: "American Decorative Arts and Sculpture",
		museums: "de Young Museum",
		intro: [
			"The American Decorative Arts and Sculpture collection surveys furniture, silver, ceramics, glass, and sculpture made in the United States from the colonial era to the early twentieth century. It traces the development of American craft and taste.",
			"Strengths include early American furniture, silver, and the decorative arts of the Arts and Crafts movement, displayed in galleries and period settings at the de Young.",
		],
		history: [
			"The collection grew from gifts of colonial and federal-period furniture and silver, establishing American decorative arts as a curatorial area at the de Young.",
			"Donor bequests and curatorial collecting broadened the holdings into nineteenth-century and Arts and Crafts material, supported by period-room installations.",
			"Recent acquisitions emphasise regional craft traditions and the documentation of makers, alongside conservation of furniture and metalwork for display.",
		],
		highlights: [
			{
				title: "High Chest of Drawers",
				artist: "Unknown Boston maker",
				date: "ca. 1740",
				medium: "Walnut and gilt",
			},
			{
				title: "Tankard",
				artist: "Paul Revere Jr.",
				date: "ca. 1770",
				medium: "Silver",
			},
			{
				title: "Side Chair",
				artist: "Unknown Philadelphia maker",
				date: "ca. 1760",
				medium: "Mahogany",
			},
			{
				title: "Vase",
				artist: "Tiffany Studios",
				date: "ca. 1900",
				medium: "Favrile glass",
			},
			{
				title: "Settle",
				artist: "Gustav Stickley",
				date: "ca. 1905",
				medium: "Oak and leather",
			},
			{
				title: "Bust of a Woman",
				artist: "Hiram Powers",
				date: "ca. 1850",
				medium: "Marble",
			},
		],
		featured: [
			{
				name: "Early American Furniture",
				desc: "Colonial and federal-period case pieces and seating.",
				count: "340 objects",
			},
			{
				name: "American Silver",
				desc: "Domestic and presentation silver by Revere and his contemporaries.",
				count: "420 objects",
			},
			{
				name: "Arts and Crafts",
				desc: "Furniture, glass, and metalwork from the turn-of-the-century reform movement.",
				count: "210 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Paul Revere, Silversmith",
				desc: "Beyond the midnight ride: the workshop behind the silver.",
				meta: "6 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Joinery and the Cabinetmaker",
				desc: "How early American furniture was built to last.",
				meta: "9 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "The Arts and Crafts Ideal",
				desc: "A curator on craft, reform, and the handmade object.",
				meta: "8 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Decorative arts study",
				desc: "Selected works viewable by appointment with the department.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Ancient Art": {
		name: "Ancient Art",
		museums: "Legion of Honor",
		intro: [
			"The Ancient Art collection presents works from the ancient Mediterranean and Near East, including Egyptian, Greek, Roman, and Mesopotamian objects. Sculpture, pottery, glass, and funerary art trace several thousand years of cultural exchange.",
			"Strengths include Greek vases, Roman portraiture, and Egyptian funerary material, displayed in dedicated galleries at the Legion of Honor.",
		],
		history: [
			"The collection developed through gifts and acquisitions of classical and ancient Near Eastern art, anchoring the Legion of Honor's presentation of the ancient world.",
			"Curatorial collecting deepened the holdings in Greek pottery and Roman sculpture, with attention to archaeological context and documentation.",
			"Recent work emphasises provenance research and the responsible stewardship of antiquities, including ongoing review of collecting histories.",
		],
		highlights: [
			{
				title: "Attic Red-Figure Krater",
				artist: "Unknown Greek artist",
				date: "ca. 450 BCE",
				medium: "Terracotta",
			},
			{
				title: "Portrait of a Roman Man",
				artist: "Unknown Roman artist",
				date: "1st century CE",
				medium: "Marble",
			},
			{
				title: "Coffin Mask",
				artist: "Unknown Egyptian artist",
				date: "ca. 1000 BCE",
				medium: "Gilded cartonnage",
			},
			{
				title: "Cycladic Figure",
				artist: "Unknown Cycladic artist",
				date: "ca. 2500 BCE",
				medium: "Marble",
			},
			{
				title: "Glass Amphora",
				artist: "Unknown Roman artist",
				date: "1st century CE",
				medium: "Blown glass",
			},
			{
				title: "Cuneiform Tablet",
				artist: "Unknown Mesopotamian scribe",
				date: "ca. 2000 BCE",
				medium: "Clay",
			},
		],
		featured: [
			{
				name: "Greek Vases",
				desc: "Black- and red-figure pottery from archaic and classical Greece.",
				count: "180 objects",
			},
			{
				name: "Roman Portraiture",
				desc: "Marble busts and funerary sculpture from the Roman world.",
				count: "120 objects",
			},
			{
				name: "Egyptian Funerary Art",
				desc: "Coffins, masks, and amulets from the Nile valley.",
				count: "210 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Reading a Greek Vase",
				desc: "Myth and daily life painted on terracotta.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "The Roman Portrait",
				desc: "How marble busts shaped reputation and memory in antiquity.",
				meta: "10 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Journey to the Afterlife",
				desc: "A curator on Egyptian funerary belief and its objects.",
				meta: "9 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Provenance research",
				desc: "Ongoing review of collecting histories for antiquities.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"American Paintings": {
		name: "American Paintings",
		museums: "de Young Museum",
		intro: [
			"The American Paintings collection traces the history of painting in the United States from the colonial period to the mid-twentieth century, including portraiture, landscape, genre, and still life. It documents the emergence of a distinct national art.",
			"Strengths include nineteenth-century landscape, trompe l'oeil still life, and California painting, displayed in galleries at the de Young alongside American decorative arts.",
		],
		history: [
			"The collection grew from gifts of colonial portraits and nineteenth-century landscapes, establishing American painting as a curatorial strength at the de Young.",
			"Donor bequests and curatorial collecting added depth in genre painting, still life, and the art of California and the American West.",
			"Recent acquisitions broaden the narrative to include under-represented artists and the documentation of regional schools.",
		],
		highlights: [
			{
				title: "Rainy Season in the Tropics",
				artist: "Frederic Edwin Church",
				date: "1866",
				medium: "Oil on canvas",
			},
			{
				title: "After the Hunt",
				artist: "William Harnett",
				date: "1885",
				medium: "Oil on canvas",
			},
			{
				title: "Portrait of a Gentleman",
				artist: "John Singleton Copley",
				date: "ca. 1770",
				medium: "Oil on canvas",
			},
			{
				title: "The Bridle Path",
				artist: "Winslow Homer",
				date: "1868",
				medium: "Oil on canvas",
			},
			{
				title: "California Spring",
				artist: "Albert Bierstadt",
				date: "1875",
				medium: "Oil on canvas",
			},
			{
				title: "Still Life with Fruit",
				artist: "Severin Roesen",
				date: "ca. 1855",
				medium: "Oil on canvas",
			},
		],
		featured: [
			{
				name: "Hudson River School",
				desc: "Nineteenth-century American landscape painting.",
				count: "140 objects",
			},
			{
				name: "Trompe l'Oeil Still Life",
				desc: "Illusionistic still lifes by Harnett, Peto, and their circle.",
				count: "60 objects",
			},
			{
				name: "California Painting",
				desc: "Views of the West and early California artistic communities.",
				count: "180 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "The American Landscape Tradition",
				desc: "How painters turned the continent into a national subject.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "The Trick of the Eye",
				desc: "A close look at trompe l'oeil still-life painting.",
				meta: "9 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "Painting California",
				desc: "A curator on the art of the American West.",
				meta: "8 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Conservation studio",
				desc: "Ongoing treatment and technical study of paintings.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"European Paintings": {
		name: "European Paintings",
		museums: "Legion of Honor",
		intro: [
			"The European Paintings collection spans the early Renaissance to the early twentieth century, with particular depth in French, Dutch, Flemish, and Spanish painting. It traces the development of European art across five centuries.",
			"Strengths include Old Master and Impressionist painting, with major works displayed at the Legion of Honor alongside the museum's European sculpture and decorative arts.",
		],
		history: [
			"The collection took shape around founding gifts of European Old Masters and nineteenth-century French painting, anchoring the Legion of Honor's galleries.",
			"Donor bequests and curatorial collecting added depth in Dutch and Flemish painting, Spanish portraiture, and French Impressionism.",
			"Recent work focuses on conservation, technical study, and provenance research, particularly for works with complex twentieth-century ownership histories.",
		],
		highlights: [
			{
				title: "Saint John the Baptist",
				artist: "El Greco",
				date: "ca. 1600",
				medium: "Oil on canvas",
			},
			{
				title: "Portrait of a Man",
				artist: "Rembrandt van Rijn",
				date: "ca. 1650",
				medium: "Oil on canvas",
			},
			{
				title: "Waterlilies",
				artist: "Claude Monet",
				date: "ca. 1914–1917",
				medium: "Oil on canvas",
			},
			{
				title: "The Grand Canal, Venice",
				artist: "Canaletto",
				date: "ca. 1730",
				medium: "Oil on canvas",
			},
			{
				title: "Still Life with Flowers",
				artist: "Jan van Huysum",
				date: "ca. 1720",
				medium: "Oil on panel",
			},
			{
				title: "The Dance Class",
				artist: "Edgar Degas",
				date: "ca. 1873",
				medium: "Oil on canvas",
			},
		],
		featured: [
			{
				name: "Old Master Paintings",
				desc: "European painting from the Renaissance through the Baroque.",
				count: "260 objects",
			},
			{
				name: "French Impressionism",
				desc: "Works by Monet, Degas, and their contemporaries.",
				count: "120 objects",
			},
			{
				name: "Dutch and Flemish Painting",
				desc: "Portraits, still lifes, and genre scenes from the Low Countries.",
				count: "180 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Light and the Impressionists",
				desc: "How a generation of painters chased the changing moment.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "Inside an Old Master",
				desc: "Technical imaging reveals what lies beneath the surface.",
				meta: "11 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "The Golden Age in Holland",
				desc: "A curator on Dutch and Flemish painting.",
				meta: "9 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Provenance research",
				desc: "Ongoing study of ownership histories for European paintings.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"Contemporary Art": {
		name: "Contemporary Art",
		museums: "de Young Museum",
		intro: [
			"The Contemporary Art collection presents painting, sculpture, photography, and new media from the mid-twentieth century to the present. It engages with the art of our own time, including work by Bay Area and international artists.",
			"Strengths include postwar American painting, sculpture, and a growing body of work by living artists, displayed in galleries at the de Young and through changing installations.",
		],
		history: [
			"The collection grew from acquisitions of postwar American art, establishing a contemporary curatorial area within the museum's historical holdings.",
			"Donor support and curatorial collecting broadened the holdings into sculpture, photography, and new media, with particular attention to Bay Area artists.",
			"Recent acquisitions emphasise living artists, under-represented voices, and works that respond to the museum's collection and site.",
		],
		highlights: [
			{
				title: "Untitled",
				artist: "Mark Rothko",
				date: "1960",
				medium: "Oil on canvas",
			},
			{
				title: "Ocean Park Series",
				artist: "Richard Diebenkorn",
				date: "1970",
				medium: "Oil on canvas",
			},
			{
				title: "Spider",
				artist: "Louise Bourgeois",
				date: "1996",
				medium: "Bronze",
			},
			{
				title: "Flag",
				artist: "Jasper Johns",
				date: "ca. 1965",
				medium: "Encaustic and collage",
			},
			{
				title: "Untitled (Photograph)",
				artist: "Cindy Sherman",
				date: "1981",
				medium: "Chromogenic print",
			},
			{
				title: "Black Painting",
				artist: "Frank Stella",
				date: "1959",
				medium: "Enamel on canvas",
			},
		],
		featured: [
			{
				name: "Postwar American Painting",
				desc: "Abstract Expressionism and the movements that followed.",
				count: "160 objects",
			},
			{
				name: "Bay Area Art",
				desc: "Painting and sculpture by artists working in Northern California.",
				count: "210 objects",
			},
			{
				name: "Contemporary Photography",
				desc: "Photographic work from the 1960s to the present.",
				count: "240 objects",
			},
		],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Diebenkorn's Ocean Park",
				desc: "Color, light, and abstraction in a landmark series.",
				meta: "6 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "In the Studio",
				desc: "A living artist on the making of a recent acquisition.",
				meta: "12 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "The Bay Area Figurative Movement",
				desc: "A curator on the artists who reshaped postwar painting in California.",
				meta: "9 min listen",
			},
		],
		resources: [
			{
				title: "Research inquiries",
				desc: "research@famsf.org for curatorial and provenance questions.",
			},
			{
				title: "Artist archives",
				desc: "Documentation and ephemera relating to living and recent artists.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},
};

// Slug → area lookup, derived once from the AREAS keys.
const AREA_BY_SLUG: Record<string, AreaData> = Object.fromEntries(
	Object.values(AREAS).map((area) => [slugify(area.name), area]),
);

/** All area slugs, for generateStaticParams + cross-page hrefs. */
export const AREA_SLUGS = Object.keys(AREA_BY_SLUG);

export function generateStaticParams() {
	return AREA_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function CollectionAreaPage({ params }: Props) {
	const { slug } = await params;
	const area = AREA_BY_SLUG[slug];
	if (!area) notFound();

	return (
		<ScopePage id="collection-area">
			<div className="min-h-screen bg-white">
				{/* Hero: header + tagline */}
				<WireframeSection
					label="Hero"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<div className="mb-2">
							<Link
								href="/collection-areas"
								className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
							>
								&larr; {t("area.backToCollection")}
							</Link>
						</div>
						<SectionLabel>{t("area.label")}</SectionLabel>
						<h1 className="mt-2 font-mono text-page font-semibold leading-[1.15] tracking-tight">
							{area.name}
						</h1>
						<ScopeMark label="Museum location">
							<p className="mt-2 font-mono text-body text-gray-500">
								{area.museums}
							</p>
						</ScopeMark>
						<ImagePlaceholder
							aspect="21/9"
							label="[Gallery installation: updated with current display]"
							className="mt-8 border border-gray-300"
						/>
					</Container>
				</WireframeSection>

				{/* Intro text (150-200 words, general audience). The Collection
				    "About" page is folded into this intro per the spec. */}
				<WireframeSection
					label="About"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<SectionLabel className="mb-4">
							{t("area.aboutHeading")}
						</SectionLabel>
						<div className="space-y-4 font-mono text-body text-gray-700">
							{area.intro.map((para) => (
								<p key={para}>{para}</p>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Deep dive / Collection history (expandable) */}
				<WireframeSection
					label="Deep dive"
					className="border-b border-gray-300 py-8"
				>
					<Container size="md">
						<details className="group border border-gray-300">
							<summary className="flex cursor-pointer items-center justify-between p-5 font-mono text-card font-medium transition-colors hover:bg-gray-50">
								<span>{t("area.deepDiveHeading")}</span>
								<span className="font-mono text-meta text-gray-400 group-open:hidden">
									{t("area.deepDiveExpand")}
								</span>
								<span className="hidden font-mono text-meta text-gray-400 group-open:inline">
									{t("area.deepDiveCollapse")}
								</span>
							</summary>
							<div className="space-y-4 border-t border-gray-300 p-5 font-mono text-body text-gray-700">
								{area.history.map((para) => (
									<p key={para}>{para}</p>
								))}
							</div>
						</details>
					</Container>
				</WireframeSection>

				{/* Highlights module (25-40 works in production) */}
				<WireframeSection
					label="Highlights"
					className="border-b border-gray-300 py-12"
				>
					<Container>
						<SectionLabel className="mb-2">
							{t("area.highlightsHeading")}
						</SectionLabel>
						<p className="mb-6 font-mono text-meta text-gray-500">
							{t("area.highlightsNote")}
						</p>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{area.highlights.map((work) => (
								<button
									key={work.title}
									type="button"
									className="flex flex-col border border-gray-300 text-left transition-colors hover:border-gray-500"
								>
									<ImagePlaceholder label={`[${work.title}]`} />
									<div className="p-3">
										<h3 className="font-mono text-card font-medium leading-snug">
											{work.title}
										</h3>
										<p className="mt-0.5 font-mono text-label text-gray-500">
											{work.artist}
										</p>
										<p className="font-mono text-label text-gray-400">
											{work.date}
										</p>
									</div>
								</button>
							))}
						</div>
						<div className="mt-4">
							<Link
								href="/search-results"
								className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
							>
								{t("area.highlightsViewAll")} &rarr;
							</Link>
						</div>
					</Container>
				</WireframeSection>

				{/* Featured collections: named / sub-collections, existing links surfaced */}
				<WireframeSection
					label="Featured collections"
					className="border-b border-gray-300 py-12"
				>
					<Container size="md">
						<SectionLabel className="mb-2">
							{t("area.featuredHeading")}
						</SectionLabel>
						<p className="mb-6 font-mono text-meta text-gray-500">
							{t("area.featuredNote")}
						</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{area.featured.map((col) => (
								<Link
									key={col.name}
									href={`/search-results?q=${encodeURIComponent(col.name)}`}
									className="flex flex-col border border-gray-300 p-5 transition-colors hover:border-gray-500"
								>
									<h3 className="font-mono text-card font-medium leading-snug">
										{col.name}
									</h3>
									<p className="mt-1 font-mono text-meta text-gray-500">
										{col.desc}
									</p>
									<p className="mt-2 font-mono text-label text-gray-400">
										{col.count}
									</p>
								</Link>
							))}
						</div>
					</Container>
				</WireframeSection>

				{/* Read, watch + listen (reframed from Articles & essays) */}
				<ScopeMark label="Articles & essays">
					<WireframeSection
						label="Articles & essays"
						className="border-b border-gray-300 py-12"
					>
						<Container size="md">
							<SectionLabel className="mb-6">
								{t("area.contentHeading")}
							</SectionLabel>
							<div className="flex flex-col gap-3">
								{area.media.map((item) => (
									<div key={item.title} className="border border-gray-300 p-5">
										<p className="font-mono text-label uppercase tracking-[0.08em] text-gray-400">
											{item.kicker}
										</p>
										<h3 className="mt-1 font-mono text-card font-medium">
											{item.title}
										</h3>
										<p className="mt-1 font-mono text-meta text-gray-500">
											{item.desc}
										</p>
										<p className="mt-2 font-mono text-label text-gray-400">
											{item.meta}
										</p>
									</div>
								))}
								<div className="border border-dashed border-gray-300 p-5">
									<h3 className="font-mono text-meta text-gray-400">
										{t("area.moreArticlesPlaceholder")}
									</h3>
								</div>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Other resources: study centers, contacts, department resources */}
				<WireframeSection label="Other resources" className="py-8">
					<Container size="md">
						<SectionLabel className="mb-6">
							{t("area.resourcesHeading")}
						</SectionLabel>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							{area.resources.map((res) => (
								<div key={res.title} className="border border-gray-300 p-5">
									<h3 className="font-mono text-card font-medium leading-snug">
										{res.title}
									</h3>
									<p className="mt-1 font-mono text-meta text-gray-500">
										{res.desc}
									</p>
								</div>
							))}
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}
