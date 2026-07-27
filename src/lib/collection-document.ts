/**
 * TypeScript types for the FAMSF collection document as served by Elasticsearch.
 *
 * Source of truth: the `develop` alias mapping on the FAMSF ES cluster.
 * Sample files:    src/data/sample-docs/ (pulled by
 *                  scripts/pull_sample_docs_from_es.py)
 *
 * Field names are the ES snake_case ones. Several fields the wireframes were
 * built against (dimensions_structured, exhibitions[], child_cards,
 * named_collection, the *_structured transcriptions) are not in the served
 * index; see "Not served by the index" at the foot of CollectionDocument.
 */

export interface TermNode {
	depth: number;
	cn: string;
	term: string;
}

export interface TermEntry {
	id: number;
	term: string;
	/** Thesaurus term type, e.g. "Descriptor". */
	type: string;
	certainty: string | null;
	/** Getty TGN/AAT ancestry, general → specific, usually rooted at "World". */
	path: TermNode[];
}

/** One node of the pre-built place hierarchy, as a "A > B > C" path string. */
export interface PlaceNode {
	value: string;
	/** Facet level this node is exposed at, or null for intermediate tiers. */
	search_level: string | null;
	cn: string;
}

/**
 * Pre-built place hierarchy for an object. `lvl0`–`lvl3` are the flattened
 * facet levels; `nodes` carries every tier including the intermediate ones the
 * levels skip. Cleaner than walking `term_place_of_creation[].path`, which is
 * raw Getty ancestry.
 */
export interface PlaceFacetTree {
	lvl0: string[] | null;
	lvl1: string[] | null;
	lvl2: string[] | null;
	lvl3: string[] | null;
	nodes: PlaceNode[] | null;
	historic: boolean | null;
}

/**
 * Hierarchical place facet derived from the REGION_REMAP curator workbook:
 * region → country → state → notable place. The `state` tier is **US-only**
 * (per ADR 0002 amend) — empty for every non-US place. Any of `country` /
 * `state` / `notable` may be empty when the mapped node is itself that tier.
 *
 * Wireframe-only: added by scripts/export_grid_facets_docs.py, not served.
 */
export interface PlaceFacet {
	region: string;
	country: string;
	state: string;
	notable: string;
}

/**
 * Three-level medium facet (Tier-1 material group → Tier-2 → Tier-3), e.g.
 * Textiles + fiber → Weaving → Plain weave. Any of `subcategory` / `specific`
 * may be empty when the classified node is itself that level.
 *
 * Wireframe-only: added by scripts/export_grid_facets_docs.py, not served.
 */
export interface MediumFacet {
	section: string;
	subcategory: string;
	specific: string;
}

export interface ProvenanceLine {
	order: number;
	text: string;
	refs: number[];
	is_uncertain?: boolean;
}

export interface ProvenanceFootnote {
	num: number;
	text: string;
}

export interface ProvenanceStructured {
	lines: ProvenanceLine[];
	footnotes: ProvenanceFootnote[];
	/** False when the raw provenance text could not be split into lines. */
	parsed?: boolean;
}

export interface TitleEntry {
	title: string;
	/** e.g. "Primary Title", "Foreign Language Title". */
	type: string;
	active: boolean;
	language: string;
	display_order: number;
}

export interface Constituent {
	id: number;
	role: string;
	role_id: number;
	name: string;
	name_sort: string;
	nationality: string | null;
	/** Artist-side geography (TMS constituent places). Free-text place names with
	 *  no Getty TGN path, so they can scope a search but not build a place tree. */
	place_born?: string | null;
	place_died?: string | null;
	place_active?: string | null;
	/** Uncertainty qualifier, e.g. "Attributed to", "Possibly". */
	attribution_prefix?: string | null;
	begin_date: number | null;
	end_date: number | null;
	/** Life dates as display text, e.g. "French, 1840–1926". */
	dates: string | null;
	institution?: string | null;
	constituent_type: string;
	display_order: number;
	/** Name plus life dates, e.g. "Claude Monet (1840–1926)". */
	display_label: string;
}

export interface MediaItem {
	media_xref_id: number;
	image_id: number;
	rank: number;
	primary: boolean;
	media_view: string | null;
	public_caption: string | null;
	copyright: string | null;
	copyright_status: string | null;
	credit_line: string | null;
	approved_for_web: boolean;
	media_type: string;
	file_date: string;
	file_name: string;
	file_path: string;
	height: number;
	width: number;
	/** Tiler output. Null across the current index — the tiler has not been run
	 *  over these objects, so derive image URLs from `image_id` instead. */
	iiif_id: string | null;
	iiif_info_url: string | null;
	iiif_image_url: string | null;
	iiif_width: number | null;
	iiif_height: number | null;
	thumb_400_url: string | null;
	thumb_800_url: string | null;
	social_url: string | null;
	blurhash: string | null;
	color_swatches: unknown[] | null;
	source_key?: string | null;
	run_id?: string | null;
}

/** One pre-formatted exhibition-history line. The served index has no
 *  structured venue/date fields, only this rendered prose. */
export interface ExhibitionHistoryLine {
	order: number;
	text: string;
}

/** Membership of a curated highlights collection (the "named collection"). */
export interface HighlightEntry {
	collection_slug: string;
	collection_name: string;
	rank: number;
}

/** A related object via a TMS association (portfolio siblings, sets, pairs). */
export interface AssociationEntry {
	relationship_id: number;
	role: string;
	related_object_id: number;
	related_accession_number: string;
	related_sort_number: string;
	related_title: string;
	related_role: string;
	related_display_date?: string | null;
	is_reciprocal: boolean;
	is_primary_parent: boolean | null;
	remarks?: string | null;
}

/** Editorial cross-links. Every sub-field is null across the current index. */
export interface EditorialRelatedContent {
	stories: unknown[] | null;
	events: unknown[] | null;
	audio_items: unknown[] | null;
}

export interface SampleMeta {
	reason: string;
	picked_at: string;
	populated_fields: number;
}

/** Full ES document shape for a FAMSF collection object. */
export interface CollectionDocument {
	id: number;
	doc_id: string;
	accession_number: string;
	sort_number: string;
	/** Permanent URL slug — pipeline `{title-slug}-{accession-slug}`. */
	slug?: string;
	title: string;
	titles: TitleEntry[];
	/** Display date, e.g. "ca. 1914–1917". */
	date_display?: string | null;
	date_start?: string | null;
	date_end?: string | null;
	display_year?: string | null;
	sort_year?: number | null;
	medium?: string | null;
	medium_parts?: string[] | null;
	dimensions?: string | null;
	credit_line?: string | null;
	department: string;
	classification?: string | null;
	subclassification?: string | null;
	/** Culture group (tribes + ancient civilisations), e.g. "Maya", "Asante". */
	culture?: string | null;
	culture_group?: string[] | null;
	copyright?: string | null;
	object_rights_type?: string | null;
	on_view: boolean;
	last_modified?: string | null;
	entered_date?: string;
	is_virtual: boolean;
	is_compound: boolean;
	is_highlight: boolean;
	web_text?: string | null;
	didactic_label?: string | null;
	/** Curator label copy (TMS wall text). Excluded from the object page per the
	 *  FAMSF field-exclusion list. */
	label_text?: string | null;
	publication_text?: string | null;
	exhibition_history_text?: string | null;
	exhibition_history_lines?: ExhibitionHistoryLine[];
	bibliography_text?: string | null;
	provenance?: string | null;
	provenance_structured?: ProvenanceStructured | null;
	edition?: string | null;
	constituents: Constituent[] | null;
	media: MediaItem[] | null;
	associations?: AssociationEntry[];
	highlights?: HighlightEntry[];
	editorial_related_content?: EditorialRelatedContent;
	place?: PlaceFacetTree | null;
	term_rights_statement?: TermEntry[] | null;
	term_place_of_creation?: TermEntry[] | null;
	term_place_of_fabrication?: TermEntry[] | null;
	term_place_name_at_creation?: TermEntry[] | null;
	term_related_geography?: TermEntry[] | null;
	term_find_spot?: TermEntry[] | null;
	term_reign?: TermEntry[] | null;
	term_dynasty?: TermEntry[] | null;
	term_movement?: TermEntry[] | null;
	term_school?: TermEntry[] | null;
	term_materials?: TermEntry[] | null;
	term_intended_market?: TermEntry[] | null;
	/**
	 * Curator-taxonomy facets, pre-derived for the search-results
	 * `grid-facets` variation by scripts/export_grid_facets_docs.py from the
	 * REGION_REMAP workbook + the 12-Tier-1 medium taxonomy. NOT served by the
	 * index — present only on src/data/grid-facets-docs/ exports.
	 */
	facet_place?: PlaceFacet[];
	facet_medium?: MediumFacet[];
	primary_artist: string;
	primary_artist_display: string;
	sort_artist?: string | null;
	has_image: boolean;
	has_iiif: boolean;
	has_provenance: boolean;
	has_children: boolean;
	/** Primary-image derivatives. Null on most objects (tiler not yet run). */
	primary_iiif_info_url?: string | null;
	primary_thumbnail_url?: string | null;
	primary_social_url?: string | null;
	primary_blurhash?: string | null;
	accession_iso_date?: string | null;
	location_string?: string | null;
	location_building?: string | null;
	location_room?: string | null;
	physical_child_ids?: number[] | null;
	virtual_child_ids?: number[] | null;
	virtual_parent_ids?: number[] | null;
	_sample_meta?: SampleMeta | null;

	// ── Not served by the index ──────────────────────────────────────────
	// Present in earlier pipeline exports and still referenced by parts of the
	// wireframe. Kept optional so those surfaces compile and can show a
	// "no data in the current index" placeholder rather than being deleted:
	//   dimensions_structured  → only the raw `dimensions` string is served
	//   exhibitions[]          → replaced by exhibition_history_lines[]
	//   child_cards / physical_parent_id / parent_title / parent_accession_number
	//                          → only the bare *_child_ids arrays are served
	//   named_collection       → nearest equivalent is highlights[]
	//   signed / inscribed / markings / object_name / identifying_description
	//                          → dropped upstream, matching the exclusion list
}

/** Derive a IIIF image URL from a media image_id. */
export function iiifImageUrl(imageId: number, size = "!600,600"): string {
	return `https://famsf.emuseum.com/apis/iiif/image/v2/${imageId}/full/${size}/0/default.jpg`;
}

/** Return the primary media item for a document, if any. */
export function primaryMedia(doc: CollectionDocument): MediaItem | undefined {
	const media = doc.media ?? [];
	return media.find((m) => m.primary) ?? media[0];
}

/**
 * Return all images for a document, primary first then by rank.
 *
 * Filters out non-Image media types only. The approved_for_web flag is
 * intentionally ignored in the wireframes: it is false on most sample records
 * and would hide every image otherwise. Production surfaces (Searchkit /
 * Craft) should reapply the filter.
 */
export function allMedia(doc: CollectionDocument): {
	visible: MediaItem[];
	hiddenCount: number;
} {
	const images = (doc.media ?? []).filter((m) => m.media_type === "Image");
	const visible = images.slice().sort((a, b) => {
		if (a.primary !== b.primary) return a.primary ? -1 : 1;
		return a.rank - b.rank;
	});
	const hiddenCount = images.length - visible.length;
	return { visible, hiddenCount };
}

/** Count populated top-level fields (non-null, non-empty-array). */
export function populatedFieldCount(doc: CollectionDocument): number {
	return Object.values(doc).filter((v) => {
		if (v === null || v === undefined || v === false) return false;
		if (Array.isArray(v)) return v.length > 0;
		return true;
	}).length;
}

/** Alternate titles — everything bar the highest-priority primary title. */
export function alternateTitles(doc: CollectionDocument): TitleEntry[] {
	const titles = (doc.titles ?? []).filter((t) => t.active);
	const primary = titles
		.filter((t) => t.type === "Primary Title")
		.sort((a, b) => a.display_order - b.display_order)[0];
	return titles.filter((t) => t !== primary);
}

/**
 * Place ancestry for a term, specific → general, with the "World" root and the
 * term's own leaf dropped. Curators asked for the object page to read
 * specific-first rather than the raw Getty general-first order.
 */
export function placeAncestry(entry: TermEntry): TermNode[] {
	return entry.path
		.filter((n) => n.term !== "World" && n.term !== entry.term)
		.slice()
		.reverse();
}

/** True when the object carries a public-domain rights marker. */
export function isPublicDomain(doc: CollectionDocument): boolean {
	if (doc.copyright?.toLowerCase().includes("public domain")) return true;
	return doc.object_rights_type === "Public Domain";
}
