/**
 * Sample collection data for wireframe interactivity.
 *
 * A small representative set drawn from the real FAMSF collection
 * (144,511 objects). Enough to demonstrate search, browse, and
 * detail page behaviour without loading the full dataset.
 *
 * `topViewedObjects` is generated from real ES records for the top
 * 50 GA-viewed artworks — see scripts/fetch-top-artworks.ts.
 */

import { topViewedObjects } from "./sample-data.generated";

// ── Types ───────────────────────────────────────────────────────────

export type CopyrightStatus =
	| "public-domain"
	| "in-copyright"
	| "copyright-unknown";

export type GeoXrefType = "Path" | "Place" | "Region" | "Find Site";

export interface GeoXref {
	place: string;
	type?: GeoXrefType;
	certainty?: string;
}

export interface ObjectImage {
	label: string;
	altText: string;
}

export interface AudioMedia {
	title: string;
	duration: string;
	description?: string;
}

export interface Constituent {
	id: string;
	name: string;
	role: string;
	dates?: string;
	nationality?: string;
	/** Attribution qualifier: "Attributed to", "Circle of", "Possibly", etc. */
	attribution?: string;
	/** Role hidden from public display per CIDA convention but kept in record */
	invisibleRole?: boolean;
}

export interface SampleObject {
	id: string;
	title: string;
	/** Additional titles (former, foreign language) */
	alternateTitles?: string[];
	/** TMS Object Names — controlled vocabulary terms distinct from titles */
	objectNames?: string[];
	artist: string;
	/** Attribution qualifier: "Attributed to", "Circle of", "After", etc. */
	attribution?: string;
	artistDates: string;
	artistNationality: string;
	/** Full constituent records grouped by Constituent ID */
	constituents?: Constituent[];
	date: string;
	medium: string;
	/** Technique distinct from medium */
	technique?: string;
	dimensions: string;
	creditLine: string;
	accession: string;
	/** Legacy/alternate accession numbers */
	alternateAccessions?: string[];
	/** Primary department (legacy single-value) */
	department: string;
	/** Multi-department membership; first is primary */
	departments?: string[];
	classification: string;
	/** Subclassification or object name */
	subclassification?: string;
	onView: boolean;
	gallery?: string;
	labelText?: string;
	culture?: string;
	/** Geographic hierarchy with type — Paths sorted first */
	geography?: GeoXref[];
	/** Artist identity tags */
	identityTags?: string[];

	// Physical description block
	marks?: string;
	inscriptions?: string;
	signed?: string;
	labelsOnObject?: string;
	identifyingDescription?: string;

	// Image metadata
	images?: ObjectImage[];

	// Audio/video media
	audioMedia?: AudioMedia[];

	// Attribute fields (TMS)
	keywords?: string[];
	period?: string;
	school?: string;
	style?: string;
	movement?: string;

	// Acquisition
	accessionDate?: string;

	// Numeric date range — drives date-range search; coverage ~72% in TMS export
	dateBegin?: number;
	dateEnd?: number;

	// Print-specific (Achenbach) — edition info, e.g. "3/50"
	edition?: string;

	// Multiple structured measurements — overall, canvas, frame, with frame, weight.
	// Currently `dimensions` is a flat single-line string; this exposes the breakdown.
	dimensionsStructured?: {
		description: string;
		displayDimensions: string;
	}[];

	// Controlled-vocab place-of-creation (term_place_of_creation in TMS) — preferred
	// over free-text `geography` where present. Hierarchical strings, deepest first.
	placeOfCreation?: string[];

	// Rights
	copyrightStatus?: CopyrightStatus;
	copyrightHolder?: string;

	// Hierarchy / parent record
	parent?: {
		id: string;
		title: string;
		type: "Ensemble" | "Portfolio" | "Series";
	};
}

export interface SampleExhibition {
	title: string;
	date: string;
	venue: string;
}

export interface SampleArtist {
	name: string;
	dates: string;
	nationality: string;
	bio?: string;
	objectIds: string[];
}

// ── Objects ─────────────────────────────────────────────────────────

export const objects: SampleObject[] = [
	{
		id: "100167",
		title: "The Road Near the Farm",
		alternateTitles: ["Route pr\u00e8s de la ferme"],
		objectNames: ["Landscape painting", "Oil sketch"],
		artist: "Camille Pissarro",
		artistDates: "1830\u20131903",
		artistNationality: "French",
		constituents: [
			{
				id: "C-2041",
				name: "Camille Pissarro",
				role: "Artist",
				dates: "1830\u20131903",
				nationality: "French",
			},
			{
				id: "C-7892",
				name: "Paul Durand-Ruel",
				role: "Former owner",
				dates: "1831\u20131922",
				nationality: "French",
			},
		],
		date: "1871",
		dateBegin: 1871,
		dateEnd: 1871,
		medium: "Oil on canvas",
		technique: "Oil painting",
		dimensions: "39.5 \u00d7 55.3 cm (15 9/16 \u00d7 21 3/4 in.)",
		dimensionsStructured: [
			{
				description: "Canvas",
				displayDimensions: "39.5 \u00d7 55.3 cm (15 9/16 \u00d7 21 3/4 in.)",
			},
			{
				description: "Framed",
				displayDimensions:
					"61 \u00d7 76.8 \u00d7 7.6 cm (24 \u00d7 30 1/4 \u00d7 3 in.)",
			},
		],
		placeOfCreation: ["Pontoise", "\u00cele-de-France", "France"],
		creditLine: "Gift of Prentis Cobb Hale",
		accessionDate: "1974",
		accession: "1974.5",
		alternateAccessions: ["1974.005"],
		department: "European Paintings",
		departments: ["European Paintings", "19th-Century Art"],
		classification: "Painting",
		subclassification: "Landscape painting",
		onView: true,
		gallery: "Gallery 10, Legion of Honor",
		geography: [
			{
				place: "Pontoise to Louveciennes",
				type: "Path",
				certainty: "Probable",
			},
			{ place: "France > \u00cele-de-France > Pontoise", type: "Place" },
			{ place: "\u00cele-de-France", type: "Region" },
		],
		marks: "Lower right: studio stamp in red",
		inscriptions: 'Verso, in pencil: "\u00e0 mon ami Durand-Ruel"',
		signed: 'Signed and dated lower right: "C. Pissarro 1871"',
		labelsOnObject:
			'Stretcher: "Galerie Durand-Ruel, Paris" label, partially torn',
		identifyingDescription:
			"Rural landscape with a curving road through ploughed fields, two figures in the middle distance, low farmhouse at right. Loose Impressionist brushwork; muted greens and ochres.",
		images: [
			{
				label: "Front",
				altText:
					"Painting showing a country road curving through ploughed fields with two figures and a low farmhouse.",
			},
			{
				label: "Detail \u2014 figures",
				altText:
					"Detail of two small figures walking along the road, painted with loose dabs of paint.",
			},
			{
				label: "Frame",
				altText: "Gilt wood frame, ornate carving, period-appropriate.",
			},
		],
		audioMedia: [
			{
				title: "Curator's note: Pissarro's Pontoise",
				duration: "2:34",
				description: "Esther Bell on the road from Pontoise to Louveciennes",
			},
		],
		keywords: ["road", "landscape", "rural", "plein air", "agriculture"],
		period: "19th century",
		school: "French",
		style: "Impressionist",
		movement: "Impressionism",
		copyrightStatus: "public-domain",
		labelText:
			"Camille Pissarro was among the founding figures of French Impressionism, and the only artist to exhibit at all eight of the Impressionist exhibitions between 1874 and 1886. In this early landscape, painted the year before the first exhibition, Pissarro captures a quiet country road near Pontoise with loose, luminous brushwork that anticipates the movement\u2019s radical approach to plein-air painting.",
	},
	{
		id: "169787",
		title: "Ocean Park #116",
		artist: "Richard Diebenkorn",
		artistDates: "1922\u20131993",
		artistNationality: "American",
		date: "1979",
		medium: "Oil and charcoal on canvas",
		dimensions: "208.3 \u00d7 177.8 cm (82 \u00d7 70 in.)",
		creditLine: "Museum purchase, gift of the Phyllis C. Wattis Fund",
		accession: "2000.20",
		department: "American Paintings",
		classification: "Painting",
		onView: true,
		gallery: "Gallery 22, de Young",
		copyrightStatus: "in-copyright",
		copyrightHolder: "\u00a9 Estate of Richard Diebenkorn",
		labelText:
			"Richard Diebenkorn\u2019s Ocean Park series, begun in 1967, is among the most celebrated achievements of postwar American painting. This work from 1979 demonstrates the artist\u2019s mastery of luminous colour fields and geometric structure, inspired by the light and landscape of Southern California.",
	},
	{
		id: "109902",
		title: "A Note (The Libreria Marciana, Venice)",
		artist: "John Singer Sargent",
		artistDates: "1856\u20131925",
		artistNationality: "American",
		date: "1902\u20131908",
		medium: "Watercolor and graphite on paper",
		dimensions: "25.4 \u00d7 35.6 cm (10 \u00d7 14 in.)",
		creditLine: "Gift of Mrs. John D. Rockefeller III",
		accession: "1976.2.21",
		department: "Achenbach Foundation for Graphic Arts",
		classification: "Drawing",
		onView: true,
		gallery: "Gallery 8, Legion of Honor",
	},
	{
		id: "80783",
		title: "Kovsh",
		artist: "Peter Carl Faberg\u00e9",
		artistDates: "1846\u20131920",
		artistNationality: "Russian",
		date: "ca. 1900",
		medium: "Jade, gold, rubies, sapphires, and diamonds",
		dimensions: "7.6 \u00d7 14 \u00d7 8.3 cm",
		creditLine:
			"Gift of Mrs. Henry Potter Russell through the Patrons of Art and Music",
		accession: "1996.145.5",
		department: "European Decorative Arts and Sculpture",
		classification: "Personal Accessory",
		onView: true,
		gallery: "Gallery 6, Legion of Honor",
		copyrightStatus: "copyright-unknown",
	},
	{
		id: "100001",
		title: "The Thinker",
		artist: "Auguste Rodin",
		artistDates: "1840\u20131917",
		artistNationality: "French",
		date: "modeled ca. 1880, cast 1904",
		medium: "Bronze",
		dimensions: "180.3 \u00d7 97.8 \u00d7 139.7 cm",
		creditLine: "Gift of Alma de Bretteville Spreckels",
		accession: "1924.18.1",
		department: "European Decorative Arts and Sculpture",
		classification: "Sculpture",
		onView: true,
		gallery: "Court of Honor, Legion of Honor",
		labelText:
			"One of the most iconic works in the history of sculpture, The Thinker was originally conceived as the central figure of Rodin\u2019s monumental Gates of Hell, representing Dante contemplating the circles of the Inferno. The figure became an independent work and symbol of intellectual activity.",
	},
	{
		id: "100002",
		title: "Water Lilies",
		artist: "Claude Monet",
		artistDates: "1840\u20131926",
		artistNationality: "French",
		date: "ca. 1914\u20131917",
		medium: "Oil on canvas",
		dimensions: "160 \u00d7 180.3 cm (63 \u00d7 71 in.)",
		creditLine: "Mildred Anna Williams Collection",
		accession: "1979.4",
		department: "European Paintings",
		classification: "Painting",
		onView: true,
		gallery: "Gallery 11, Legion of Honor",
	},
	{
		id: "100003",
		title: "Morning Sunlight on the Snow, \u00c9ragny-sur-Epte",
		artist: "Camille Pissarro",
		artistDates: "1830\u20131903",
		artistNationality: "French",
		date: "1895",
		medium: "Oil on canvas",
		dimensions: "82.3 \u00d7 61.5 cm (32 3/8 \u00d7 24 3/16 in.)",
		creditLine: "Mildred Anna Williams Collection",
		accession: "1960.29",
		department: "European Paintings",
		classification: "Painting",
		onView: true,
		gallery: "Gallery 10, Legion of Honor",
	},
	{
		id: "100004",
		title: "The Three Shades",
		artist: "Auguste Rodin",
		artistDates: "1840\u20131917",
		artistNationality: "French",
		constituents: [
			{
				id: "C-1112",
				name: "Auguste Rodin",
				role: "Sculptor",
				dates: "1840\u20131917",
				nationality: "French",
			},
			{
				id: "C-9921",
				name: "Alexis Rudier",
				role: "Foundry",
				dates: "1874\u20131952",
				nationality: "French",
				invisibleRole: true,
			},
			{
				id: "C-7771",
				name: "Camille Claudel",
				role: "Studio assistant",
				dates: "1864\u20131943",
				nationality: "French",
				attribution: "Possibly",
			},
		],
		date: "modeled ca. 1881, cast ca. 1898",
		medium: "Bronze",
		dimensions: "191.8 \u00d7 190.5 \u00d7 101.6 cm",
		creditLine: "Gift of Alma de Bretteville Spreckels",
		accession: "1924.18.3",
		department: "European Decorative Arts and Sculpture",
		departments: ["European Decorative Arts and Sculpture", "Modern Art"],
		classification: "Sculpture",
		onView: true,
		gallery: "Court of Honor, Legion of Honor",
		copyrightStatus: "public-domain",
		parent: { id: "ENS-100", title: "The Gates of Hell", type: "Ensemble" },
		images: [
			{
				label: "Three figures, full view",
				altText:
					"Three identical bronze male nudes leaning together with arms pointing downward.",
			},
		],
		keywords: ["bronze", "nude", "Dante", "Inferno"],
		period: "19th century",
		school: "French",
		style: "Symbolist",
		movement: "Modern sculpture",
	},
	{
		id: "100005",
		title: "Standing Male Figure (Nkisi)",
		artist: "Unknown artist",
		artistDates: "",
		artistNationality: "",
		date: "19th century",
		medium: "Wood, iron, glass, resin, pigment",
		technique: "Carving, assemblage",
		dimensions: "48.3 \u00d7 15.2 \u00d7 12.7 cm",
		creditLine: "Museum purchase",
		accession: "2004.117",
		department: "Arts of Africa, Oceania, and the Americas",
		classification: "Sculpture",
		subclassification: "Power figure",
		onView: true,
		culture: "Kongo",
		geography: [{ place: "Democratic Republic of the Congo > Lower Congo" }],
	},
	{
		id: "100006",
		title: "Robe (Kosode)",
		artist: "Anonymous",
		artistDates: "",
		artistNationality: "",
		date: "18th century",
		medium: "Silk, gold-wrapped thread; embroidery",
		technique: "Embroidery, weaving",
		dimensions: "149.9 \u00d7 124.5 cm",
		creditLine: "Gift of the Connoisseurs\u2019 Council",
		accession: "1987.23.4",
		department: "Costume and Textile Arts",
		classification: "Costume",
		subclassification: "Robe",
		onView: false,
		culture: "Japanese",
		geography: [{ place: "Japan", certainty: "Probably" }],
		identityTags: ["Women artists"],
	},
	{
		id: "100007",
		title: "Stirrup Vessel with Deer",
		artist: "Unknown artist",
		artistDates: "",
		artistNationality: "",
		date: "100\u2013700 CE",
		medium: "Ceramic with slip paint",
		dimensions: "24.1 \u00d7 15.2 \u00d7 13.3 cm",
		creditLine: "Gift of Mr. and Mrs. George T. Guernsey III",
		accession: "1991.66",
		department: "Arts of Africa, Oceania, and the Americas",
		classification: "Vessels & Containers",
		onView: true,
		culture: "Moche",
	},
	{
		id: "100008",
		title: "Woman with Chrysanthemums",
		alternateTitles: ["A Woman Seated beside a Vase of Flowers"],
		artist: "Edgar Degas",
		attribution: "Attributed to",
		artistDates: "1834\u20131917",
		artistNationality: "French",
		date: "1865",
		medium: "Oil on canvas",
		dimensions: "73.7 \u00d7 92.7 cm",
		creditLine: "Museum purchase, M.H. de Young Endowment Fund",
		accession: "1935.4",
		department: "European Paintings",
		classification: "Painting",
		onView: true,
		gallery: "Gallery 11, Legion of Honor",
	},
	{
		id: "100009",
		title: "Untitled fragment",
		artist: "Unknown artist",
		artistDates: "",
		artistNationality: "",
		date: "early 20th century",
		medium: "Plaster",
		dimensions: "12 × 8 cm",
		creditLine: "Museum purchase",
		accession: "2021.9",
		department: "Contemporary Art",
		classification: "Sculpture",
		onView: false,
		copyrightStatus: "copyright-unknown",
	},
	...topViewedObjects,
];

// ── Exhibitions (per object) ────────────────────────────────────────

export const exhibitions: Record<string, SampleExhibition[]> = {
	"100167": [
		{
			title: "Impressionism: Masterworks from the de Young",
			date: "Jun 2019 \u2013 Jan 2020",
			venue: "de Young Museum",
		},
		{
			title: "Pissarro\u2019s People",
			date: "Mar \u2013 Jun 2011",
			venue: "Legion of Honor",
		},
		{
			title: "The Road to Impressionism",
			date: "Sep 1995 \u2013 Jan 1996",
			venue: "Legion of Honor",
		},
	],
	"169787": [
		{
			title: "Richard Diebenkorn: The Ocean Park Series",
			date: "Oct 2011 \u2013 Mar 2012",
			venue: "de Young Museum",
		},
		{
			title: "California Modern",
			date: "Jun \u2013 Sep 2018",
			venue: "de Young Museum",
		},
	],
	"100001": [
		{
			title: "Rodin: The Shock of the Modern Body",
			date: "Mar \u2013 Aug 2017",
			venue: "Legion of Honor",
		},
		{
			title: "Truth and Beauty: The Pre-Raphaelites and Old Masters",
			date: "Jun \u2013 Sep 2018",
			venue: "Legion of Honor",
		},
	],
};

// ── Artists ──────────────────────────────────────────────────────────

export const artists: SampleArtist[] = [
	{
		name: "Camille Pissarro",
		dates: "1830\u20131903",
		nationality: "French",
		bio: "Jacob Abraham Camille Pissarro was a Danish-French Impressionist and Neo-Impressionist painter. His importance resides in his contributions to both Impressionism and Post-Impressionism. He was the only artist to have shown his work at all eight Paris Impressionist exhibitions, from 1874 to 1886.",
		objectIds: ["100167", "100003"],
	},
	{
		name: "Auguste Rodin",
		dates: "1840\u20131917",
		nationality: "French",
		bio: "Fran\u00e7ois Auguste Ren\u00e9 Rodin was a French sculptor generally considered the founder of modern sculpture. Rodin possessed a unique ability to model a complex, turbulent, deeply pocketed surface in clay.",
		objectIds: ["100001", "100004"],
	},
	{
		name: "Richard Diebenkorn",
		dates: "1922\u20131993",
		nationality: "American",
		bio: "Richard Diebenkorn was an American painter known for his abstract and representational paintings. His best-known works are the Ocean Park series of large abstract paintings, begun in 1967.",
		objectIds: ["169787"],
	},
	{
		name: "Claude Monet",
		dates: "1840\u20131926",
		nationality: "French",
		bio: "Oscar-Claude Monet was a French painter and founder of Impressionist painting. The term \u2018Impressionism\u2019 is derived from his painting Impression, Sunrise.",
		objectIds: ["100002"],
	},
	{
		name: "John Singer Sargent",
		dates: "1856\u20131925",
		nationality: "American",
		bio: "John Singer Sargent was an American expatriate artist, considered the leading portrait painter of his generation. During his career, he created roughly 900 oil paintings and more than 2,000 watercolours.",
		objectIds: ["109902"],
	},
	{
		name: "Peter Carl Faberg\u00e9",
		dates: "1846\u20131920",
		nationality: "Russian",
		objectIds: ["80783"],
	},
	{
		name: "Edgar Degas",
		dates: "1834\u20131917",
		nationality: "French",
		objectIds: ["100008"],
	},
];

// ── Exhibition records (standalone, for /exhibition-detail) ────────

export interface ExhibitionRecord {
	id: string;
	title: string;
	dates: string;
	venue: string;
	curator?: string;
	description: string;
	objectIds: string[];
}

export const exhibitionRecords: ExhibitionRecord[] = [
	{
		id: "EX-2019-IMP",
		title: "Impressionism: Masterworks from the de Young",
		dates: "Jun 2019 – Jan 2020",
		venue: "de Young Museum",
		curator: "Esther Bell",
		description:
			"A landmark survey of Impressionism drawn entirely from FAMSF holdings. The exhibition traces the movement from its plein-air origins through the late paintings of Monet, with Pissarro, Sargent, and Rodin sculpture as anchor points.",
		objectIds: ["100167", "100002", "100003", "100008"],
	},
	{
		id: "EX-2017-RODIN",
		title: "Rodin: The Shock of the Modern Body",
		dates: "Mar – Aug 2017",
		venue: "Legion of Honor",
		curator: "Martin Chapman",
		description:
			"Mounted around the centenary of Rodin's death, this exhibition examines the sculptor's radical treatment of the human body. The Three Shades and The Thinker anchor a collection of bronzes drawn from the Spreckels gift.",
		objectIds: ["100001", "100004"],
	},
];

export function getExhibitionRecord(id: string): ExhibitionRecord | undefined {
	return exhibitionRecords.find((e) => e.id === id);
}

// ── Parent records (Ensembles, Series) ──────────────────────────────

export interface ParentRecord {
	id: string;
	title: string;
	type: "Ensemble" | "Portfolio" | "Series";
	artist: string;
	date: string;
	description: string;
	childIds: string[];
}

export const parentRecords: ParentRecord[] = [
	{
		id: "ENS-100",
		title: "The Gates of Hell",
		type: "Ensemble",
		artist: "Auguste Rodin",
		date: "modeled 1880–1917",
		description:
			"Rodin's monumental sculptural ensemble, conceived as a portal for a planned Museum of Decorative Arts in Paris. The Gates contain over 180 figures including The Thinker, The Kiss, and The Three Shades, many of which Rodin later cast as independent sculptures.",
		childIds: ["100001", "100004"],
	},
];

export function getParentRecord(id: string): ParentRecord | undefined {
	return parentRecords.find((p) => p.id === id);
}

// ── Lookup helpers ──────────────────────────────────────────────────

export function getObject(id: string): SampleObject | undefined {
	return objects.find((o) => o.id === id);
}

export function getExhibitions(objectId: string): SampleExhibition[] {
	return exhibitions[objectId] ?? [];
}

export function getArtist(name: string): SampleArtist | undefined {
	return artists.find((a) => a.name === name);
}

export function getArtistObjects(artistName: string): SampleObject[] {
	const artist = getArtist(artistName);
	if (!artist) return objects.filter((o) => o.artist === artistName);
	return artist.objectIds
		.map((id) => getObject(id))
		.filter((o): o is SampleObject => o !== undefined);
}

export function getRelatedObjects(obj: SampleObject): SampleObject[] {
	return objects
		.filter(
			(o) =>
				o.id !== obj.id &&
				(o.artist === obj.artist ||
					o.department === obj.department ||
					o.classification === obj.classification),
		)
		.slice(0, 4);
}
