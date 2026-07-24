import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Container,
	ExternalLink,
	ImagePlaceholder,
	ScopeMark,
	SectionLabel,
	WireframeSection,
} from "@/components/wireframe";
import {
	type CollectionMember,
	highlightsForDepartment,
} from "@/lib/collection-members";
import { t } from "@/lib/strings";
import { ScopePage } from "@/providers/ScopeProvider";

// Section order follows the June 18 2026 page-layouts spec ("New organization"):
// header → intro text → deep dive / collection history → highlights →
// featured collections → read/watch/listen → other resources.
// The Collection "About" page is folded into the intro here; off-spec sections
// (stats, browse options, provenance statement, related programs) were removed
// to match the doc flow.
//
// Per-area dynamic route: `[slug]` selects the area from the AREAS map below.
// Keys are the nine TMS departments carrying web-visible objects (collection
// areas, CW-30); slugs are kebab-case derivations via slugify. Statically
// generated per area at build time via generateStaticParams. An unmatched slug
// 404s (notFound). European Decorative Arts and Sculpture carries the original
// verbatim copy; the other areas use wireframe-grade placeholder content.
// Featured-collection cards are the real named "(Web)" collections from the
// curated TMS "Topics" package folder. Only the Achenbach department has any in
// TMS, so the other areas render no featured grid (empty `featured`).

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

/** "Other resources" cards are informational *content*, not links: an image,
 *  an info blurb, and optional contact detail (address / email / phone). */
interface ResourceItem {
	title: string;
	desc: string;
	/** Placeholder caption for the resource image. Falls back to the title. */
	image?: string;
	/** Contact line (address, email, phone) shown under the blurb. */
	contact?: string;
}

// Read/watch/listen editorial lives on the main museum site.
const READ_WATCH_LISTEN_URL =
	"https://www.famsf.org/learn-engage/read-watch-listen";

// FAMSF study centers: a standing, featured "Other resources" entry rendered
// as a rich split-column card (prose + CTA + links on the left, images on the
// right) rather than a plain content card.
const STUDY_CENTERS = {
	title: "Study centers",
	lead: "Make an appointment to view works on paper, textiles, and other light-sensitive objects in person.",
	body: [
		"The study centers hold the reference library, object files, and the many works not currently on display. Curators and researchers use them for close looking, condition review, and provenance work.",
		"Appointments are free and open to students, scholars, and members of the public. Requests are usually scheduled within two to three weeks.",
	],
	links: [
		{
			label: "Visiting + hours",
			href: "https://www.famsf.org/visit",
		},
		{
			label: "Research inquiries",
			href: "mailto:research@famsf.org",
		},
	],
	contact: "study.centers@famsf.org · de Young museum, Golden Gate Park",
	images: ["[Study center reading room]", "[Works on paper, table view]"],
};

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
		museums: "Legion of Honor",
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
		museums: "de Young museum",
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
		// Real named collections under AFGA, from the curated TMS "Topics" package
		// folder (web-visible member counts probed from live TMS). These six are
		// the only departments-scoped named "(Web)" collections in TMS; every
		// member of all six resolves to the Achenbach department.
		featured: [
			{
				name: "Crown Point Press Collection",
				desc: "Etchings and aquatints from the influential San Francisco printmaking studio.",
				count: "5,383 objects",
			},
			{
				name: "Logan Collection",
				desc: "Prints and works on paper from the Reva and David Logan gift.",
				count: "2,858 objects",
			},
			{
				name: "Paulson Fontaine Press Collection",
				desc: "Contemporary editions from the Berkeley fine-art printmaking press.",
				count: "715 objects",
			},
			{
				name: "Anderson Collection",
				desc: "Twentieth-century prints from the Harry W. and Mary Margaret Anderson gift.",
				count: "674 objects",
			},
			{
				name: "Theater and Dance Collection",
				desc: "Posters, prints, and graphic works documenting performance.",
				count: "459 objects",
			},
			{
				name: "Ed Ruscha Collection",
				desc: "Prints and artists' books by the American conceptual artist.",
				count: "372 objects",
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
		museums: "de Young museum",
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

	// One TMS department (AOA), not the three separate areas an earlier wireframe
	// pass split it into. The galleries group African, Oceanic, and ancient-American
	// holdings together at the de Young.
	"Arts of Africa, Oceania, and the Americas": {
		name: "Arts of Africa, Oceania, and the Americas",
		museums: "de Young museum",
		intro: [
			"The Arts of Africa, Oceania, and the Americas collection brings together sculpture, masks, textiles, regalia, and ceremonial objects from across the African continent, the islands of the Pacific, and the ancient and indigenous Americas. The works speak to ritual, leadership, navigation, ancestry, and daily life across many cultures and several thousand years.",
			"Strengths range from West and Central African figurative sculpture to Melanesian and Polynesian carving and Mesoamerican and Andean ceramics, gold, and textiles, shown together in dedicated galleries at the de Young.",
		],
		history: [
			"The collection developed through gifts and purchases that brought significant bodies of African, Pacific, and Pre-Columbian art to the de Young, later consolidated into a single curatorial area spanning the three regions.",
			"Curatorial collecting deepened the holdings in figurative sculpture, ceremonial regalia, and ancient American ceramics and metalwork, with attention to documentation, cultural context, and the circumstances of acquisition.",
			"Recent work emphasises provenance research, consultation with originating and descendant communities, and the responsible interpretation of objects with sacred or ceremonial significance.",
		],
		highlights: [
			{
				title: "Reliquary Guardian Figure",
				artist: "Unknown Fang artist",
				date: "19th–20th century",
				medium: "Wood and metal",
			},
			{
				title: "Power Figure (Nkisi)",
				artist: "Unknown Kongo artist",
				date: "19th century",
				medium: "Wood, iron, mixed media",
			},
			{
				title: "Malagan Carving",
				artist: "Unknown artist, New Ireland",
				date: "19th century",
				medium: "Wood, fiber, shell",
			},
			{
				title: "Tiki Pendant",
				artist: "Unknown Māori artist",
				date: "ca. 1800",
				medium: "Nephrite",
			},
			{
				title: "Funerary Mask",
				artist: "Unknown artist, Peru",
				date: "ca. 900–1100 CE",
				medium: "Gold alloy",
			},
			{
				title: "Maya Vase",
				artist: "Unknown Maya artist",
				date: "ca. 600–900 CE",
				medium: "Painted ceramic",
			},
		],
		// No curated named "(Web)" collections under this department in TMS.
		featured: [],
		media: [
			{
				kicker: t("area.mediaArticle"),
				title: "Reading a Reliquary Figure",
				desc: "How form and material carry meaning in Fang sculpture.",
				meta: "7 min read",
			},
			{
				kicker: t("area.mediaVideo"),
				title: "The Art of the Voyage",
				desc: "Navigation, canoe-building, and the material culture of the Pacific.",
				meta: "11 min watch",
			},
			{
				kicker: t("area.mediaAudio"),
				title: "The Goldsmiths of Ancient Peru",
				desc: "Technique and meaning in Andean metalwork.",
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
				desc: "Ongoing documentation of collecting histories across the three regions.",
			},
			{
				title: "Image licensing",
				desc: "Rights and reproduction requests for publication and study.",
			},
		],
	},

	"American Decorative Arts and Sculpture": {
		name: "American Decorative Arts and Sculpture",
		museums: "de Young museum",
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
		museums: "de Young museum",
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
		museums: "de Young museum",
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

/** Sub-collection slug, scoped under its parent area. */
export function featuredSlug(name: string): string {
	return slugify(name);
}

export type { AreaData, Featured };
export { AREA_BY_SLUG };

/** Shared collection-area template. Parent area pages and featured-collection
 *  child pages both render this — the child reuses the identical layout, only
 *  with `showFeatured={false}` (a featured page has no nested featured grid)
 *  and a back link pointing at its parent. */
export function AreaPageLayout({
	area,
	backHref,
	backLabel,
	featuredBasePath,
	showFeatured = true,
}: {
	area: AreaData;
	backHref: string;
	backLabel: string;
	/** Parent-area path featured cards route under (e.g. `/collection-area/x`).
	 *  Only used when `showFeatured`. */
	featuredBasePath?: string;
	showFeatured?: boolean;
}) {
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
								href={backHref}
								className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
							>
								&larr; {backLabel}
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
								{/* "+" / "−" expansion, matching the main famsf.org site. */}
								<span
									aria-hidden
									className="font-mono text-lg leading-none text-gray-400"
								>
									<span className="group-open:hidden">+</span>
									<span className="hidden group-open:inline">−</span>
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

				{/* Highlights module: real Web Highlights members (25-40 in
				    production). Rendered only when there are members to show. */}
				{area.highlights.length > 0 && (
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
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{area.highlights.map((work) => (
									<Link
										key={work.title}
										href="/objects/sample/water-lilies-1973-3"
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
									</Link>
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
				)}

				{/* Featured collections: named sub-collections, each its own page
				    rendered from this same template. Hidden on featured child
				    pages (no nested featured grid) and on areas with no named
				    sub-collections in TMS (empty `featured`). */}
				{showFeatured && featuredBasePath && area.featured.length > 0 && (
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
										href={`${featuredBasePath}/${featuredSlug(col.name)}`}
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
										<span className="mt-3 font-mono text-label text-gray-500 underline">
											{t("area.featuredViewAll")} &rarr;
										</span>
									</Link>
								))}
							</div>
						</Container>
					</WireframeSection>
				)}

				{/* Articles and essays: cards link out to read/watch/listen on famsf.org */}
				<ScopeMark label="Articles and essays">
					<WireframeSection
						label="Articles and essays"
						className="border-b border-gray-300 py-12"
					>
						<Container size="md">
							<SectionLabel className="mb-2">
								{t("area.contentHeading")}
							</SectionLabel>
							<p className="mb-6 font-mono text-meta text-gray-500">
								{t("area.contentNote")}
							</p>
							<div className="flex flex-col gap-3">
								{area.media.map((item) => (
									<ExternalLink
										key={item.title}
										href={READ_WATCH_LISTEN_URL}
										corner
										className="block border border-gray-300 p-5 transition-colors hover:border-gray-500"
									>
										<p className="pr-7 font-mono text-label uppercase tracking-[0.08em] text-gray-400">
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
									</ExternalLink>
								))}
							</div>
							<div className="mt-4">
								<ExternalLink
									href={READ_WATCH_LISTEN_URL}
									className="font-mono text-meta text-gray-500 underline hover:text-gray-600"
								>
									{t("area.contentViewAll")}
								</ExternalLink>
							</div>
						</Container>
					</WireframeSection>
				</ScopeMark>

				{/* Other resources: uniform text entries (no image cards, nothing
				    that links off to a new page), per curator feedback. Study
				    centers lead with their prose + contact, remaining resources
				    follow in the same text style. */}
				<WireframeSection label="Other resources" className="py-8">
					<Container size="md">
						<SectionLabel className="mb-6">
							{t("area.resourcesHeading")}
						</SectionLabel>
						<div className="flex flex-col divide-y divide-gray-200 border-t border-gray-200">
							{/* Study centers */}
							<div className="py-5">
								<h3 className="font-mono text-card font-medium leading-snug">
									{STUDY_CENTERS.title}
								</h3>
								<p className="mt-2 font-mono text-body text-gray-700">
									{STUDY_CENTERS.lead}
								</p>
								<div className="mt-4 space-y-3 font-mono text-meta text-gray-500">
									{STUDY_CENTERS.body.map((para) => (
										<p key={para}>{para}</p>
									))}
								</div>
								<p className="mt-4 font-mono text-label text-gray-400">
									<span className="uppercase tracking-[0.08em]">
										{t("area.resourcesContact")}:
									</span>{" "}
									{STUDY_CENTERS.contact}
								</p>
							</div>

							{/* Remaining resources: same text style */}
							{area.resources.map((res) => (
								<div key={res.title} className="py-5">
									<h3 className="font-mono text-card font-medium leading-snug">
										{res.title}
									</h3>
									<p className="mt-1 font-mono text-meta text-gray-500">
										{res.desc}
									</p>
									{res.contact && (
										<p className="mt-3 font-mono text-label text-gray-400">
											<span className="uppercase tracking-[0.08em]">
												{t("area.resourcesContact")}:
											</span>{" "}
											{res.contact}
										</p>
									)}
								</div>
							))}
						</div>
					</Container>
				</WireframeSection>
			</div>
		</ScopePage>
	);
}

/** Map a real collection member onto the page's Highlight card shape. Title and
 *  medium can be null in TMS; fall back so a card never renders blank. */
export function memberToHighlight(member: CollectionMember): Highlight {
	return {
		title: member.title ?? "Untitled",
		artist: member.artist ?? "",
		date: member.date ?? "",
		medium: member.medium ?? "",
	};
}

type Props = { params: Promise<{ slug: string }> };

export default async function CollectionAreaPage({ params }: Props) {
	const { slug } = await params;
	const area = AREA_BY_SLUG[slug];
	if (!area) notFound();

	// Real Web Highlights members for this collection area, ordered by curator
	// rank. The highlights grid renders only when the export carries members for
	// the department; there is no placeholder fallback.
	const area_ = {
		...area,
		highlights: highlightsForDepartment(area.name).map(memberToHighlight),
	};

	return (
		<AreaPageLayout
			area={area_}
			backHref="/collection-landing"
			backLabel={t("area.backToCollection")}
			featuredBasePath={`/collection-area/${slug}`}
		/>
	);
}
