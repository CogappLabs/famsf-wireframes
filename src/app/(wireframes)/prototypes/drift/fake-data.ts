// Fabricated collection for the drift prototype. Not wired to the ETL
// sample docs — invented objects with dense, overlapping facets so every
// drift thread (era / hue / place / artist) has somewhere to go. Images
// are deterministic placeholders (picsum seeds) so the wall looks real
// without depending on IIIF.

export interface DriftObject {
	id: string;
	title: string;
	artist: string;
	year: number;
	era: string;
	place: string;
	hue: string;
	medium: string;
	seed: string; // picsum image seed
}

// Hue buckets, eras, places kept small so threads overlap heavily.
export const drift: DriftObject[] = [
	{
		id: "o1",
		title: "Harbour at Dawn",
		artist: "Camille Renaud",
		year: 1874,
		era: "1870s",
		place: "France",
		hue: "blue",
		medium: "Oil on canvas",
		seed: "harbour",
	},
	{
		id: "o2",
		title: "Water Garden, Evening",
		artist: "Camille Renaud",
		year: 1878,
		era: "1870s",
		place: "France",
		hue: "green",
		medium: "Oil on canvas",
		seed: "watergarden",
	},
	{
		id: "o3",
		title: "Poppies near Vétheuil",
		artist: "Camille Renaud",
		year: 1881,
		era: "1880s",
		place: "France",
		hue: "red",
		medium: "Oil on canvas",
		seed: "poppies",
	},
	{
		id: "o4",
		title: "Quay in Fog",
		artist: "Henri Tessier",
		year: 1876,
		era: "1870s",
		place: "France",
		hue: "blue",
		medium: "Oil on canvas",
		seed: "quayfog",
	},
	{
		id: "o5",
		title: "Boulevard, Rain",
		artist: "Henri Tessier",
		year: 1877,
		era: "1870s",
		place: "France",
		hue: "grey",
		medium: "Oil on canvas",
		seed: "boulevard",
	},
	{
		id: "o6",
		title: "Still Life with Lemons",
		artist: "Henri Tessier",
		year: 1883,
		era: "1880s",
		place: "France",
		hue: "yellow",
		medium: "Oil on canvas",
		seed: "lemons",
	},

	{
		id: "o7",
		title: "Kilim Fragment",
		artist: "Unknown",
		year: 1890,
		era: "1890s",
		place: "Anatolia",
		hue: "red",
		medium: "Wool, dye",
		seed: "kilim",
	},
	{
		id: "o8",
		title: "Prayer Rug",
		artist: "Unknown",
		year: 1885,
		era: "1880s",
		place: "Anatolia",
		hue: "blue",
		medium: "Wool, dye",
		seed: "prayerrug",
	},
	{
		id: "o9",
		title: "Indigo Resist Panel",
		artist: "Unknown",
		year: 1902,
		era: "1900s",
		place: "Anatolia",
		hue: "blue",
		medium: "Cotton, indigo",
		seed: "indigo",
	},
	{
		id: "o10",
		title: "Saddle Bag",
		artist: "Unknown",
		year: 1888,
		era: "1880s",
		place: "Anatolia",
		hue: "red",
		medium: "Wool, dye",
		seed: "saddlebag",
	},

	{
		id: "o11",
		title: "Tea Bowl, Glazed",
		artist: "Sato Kenji",
		year: 1723,
		era: "1720s",
		place: "Japan",
		hue: "green",
		medium: "Stoneware",
		seed: "teabowl",
	},
	{
		id: "o12",
		title: "Ewer with Cranes",
		artist: "Sato Kenji",
		year: 1731,
		era: "1730s",
		place: "Japan",
		hue: "grey",
		medium: "Porcelain",
		seed: "ewer",
	},
	{
		id: "o13",
		title: "Woodblock: Wave",
		artist: "Mori Hokuto",
		year: 1830,
		era: "1830s",
		place: "Japan",
		hue: "blue",
		medium: "Woodblock print",
		seed: "wave",
	},
	{
		id: "o14",
		title: "Woodblock: Red Bridge",
		artist: "Mori Hokuto",
		year: 1834,
		era: "1830s",
		place: "Japan",
		hue: "red",
		medium: "Woodblock print",
		seed: "redbridge",
	},
	{
		id: "o15",
		title: "Lacquer Box",
		artist: "Sato Kenji",
		year: 1719,
		era: "1710s",
		place: "Japan",
		hue: "black",
		medium: "Lacquer, gold",
		seed: "lacquer",
	},

	{
		id: "o16",
		title: "Mill Town, Noon",
		artist: "George Ault",
		year: 1923,
		era: "1920s",
		place: "USA",
		hue: "grey",
		medium: "Oil on canvas",
		seed: "milltown",
	},
	{
		id: "o17",
		title: "Grain Elevator",
		artist: "George Ault",
		year: 1928,
		era: "1920s",
		place: "USA",
		hue: "yellow",
		medium: "Oil on canvas",
		seed: "grain",
	},
	{
		id: "o18",
		title: "Night Garage",
		artist: "George Ault",
		year: 1931,
		era: "1930s",
		place: "USA",
		hue: "blue",
		medium: "Oil on canvas",
		seed: "garage",
	},
	{
		id: "o19",
		title: "Steel Bridge",
		artist: "Dorothy Vance",
		year: 1929,
		era: "1920s",
		place: "USA",
		hue: "grey",
		medium: "Gelatin silver print",
		seed: "steelbridge",
	},
	{
		id: "o20",
		title: "Factory Windows",
		artist: "Dorothy Vance",
		year: 1933,
		era: "1930s",
		place: "USA",
		hue: "blue",
		medium: "Gelatin silver print",
		seed: "windows",
	},

	{
		id: "o21",
		title: "Funerary Stele",
		artist: "Unknown",
		year: -480,
		era: "Ancient",
		place: "Egypt",
		hue: "yellow",
		medium: "Limestone",
		seed: "stele",
	},
	{
		id: "o22",
		title: "Ibis Figure",
		artist: "Unknown",
		year: -600,
		era: "Ancient",
		place: "Egypt",
		hue: "green",
		medium: "Bronze",
		seed: "ibis",
	},
	{
		id: "o23",
		title: "Painted Cartonnage",
		artist: "Unknown",
		year: -300,
		era: "Ancient",
		place: "Egypt",
		hue: "blue",
		medium: "Cartonnage",
		seed: "cartonnage",
	},
	{
		id: "o24",
		title: "Faience Bowl",
		artist: "Unknown",
		year: -550,
		era: "Ancient",
		place: "Egypt",
		hue: "blue",
		medium: "Faience",
		seed: "faiencebowl",
	},

	{
		id: "o25",
		title: "Abstraction in Black",
		artist: "Lena Roth",
		year: 1952,
		era: "1950s",
		place: "USA",
		hue: "black",
		medium: "Oil on canvas",
		seed: "abstractblack",
	},
	{
		id: "o26",
		title: "Red Field",
		artist: "Lena Roth",
		year: 1956,
		era: "1950s",
		place: "USA",
		hue: "red",
		medium: "Oil on canvas",
		seed: "redfield",
	},
	{
		id: "o27",
		title: "Yellow Interval",
		artist: "Lena Roth",
		year: 1959,
		era: "1950s",
		place: "USA",
		hue: "yellow",
		medium: "Oil on canvas",
		seed: "yellowinterval",
	},
	{
		id: "o28",
		title: "Etching: Drypoint No. 3",
		artist: "Lena Roth",
		year: 1961,
		era: "1960s",
		place: "USA",
		hue: "grey",
		medium: "Drypoint",
		seed: "drypoint3",
	},
];

export function imageFor(o: DriftObject, w = 700, h = 800): string {
	return `https://picsum.photos/seed/${o.seed}/${w}/${h}`;
}

// Swatch colour per hue bucket — used to render the palette thread as
// actual colour dots rather than the word "blue".
export const HUE_SWATCH: Record<string, string> = {
	blue: "#3b5b8c",
	green: "#4a7a52",
	red: "#a23b32",
	yellow: "#c9a227",
	grey: "#8a8d91",
	black: "#2b2b2b",
};

export function hueSwatch(hue: string): string {
	return HUE_SWATCH[hue] ?? "#cccccc";
}

export type ThreadKey = "artist" | "era" | "hue" | "place" | "medium";

export const THREAD_LABELS: Record<ThreadKey, string> = {
	artist: "Same hand",
	era: "Same era",
	hue: "Same palette",
	place: "Same place",
	medium: "Same technique",
};

// For a given object + thread, the pool of other objects sharing that
// facet value. Used both to label the thread chip and to pick the next
// drift target.
export function thread(
	obj: DriftObject,
	key: ThreadKey,
): { value: string; pool: DriftObject[] } {
	const value = obj[key];
	const pool = drift.filter((o) => o.id !== obj.id && o[key] === value);
	return { value: String(value), pool };
}
