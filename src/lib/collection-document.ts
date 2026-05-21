/**
 * TypeScript types derived from the FAMSF ETL pipeline ES document shape.
 *
 * Source of truth: collection-flow-famsf/src/collection_flow_famsf/defs/assets/prepare/schemas.py
 * Sample files:    src/data/sample-docs/
 *
 * When the pipeline schema changes, run `npm run sync:samples` to pull new
 * JSON files, then update these types to match.
 */

export interface TermNode {
	depth: number;
	cn: string;
	term: string;
}

export interface TermEntry {
	term: string;
	certainty: string | null;
	path: TermNode[];
}

export interface TitleEntry {
	Title: string;
	TitleType: string;
	Language: string;
	DisplayOrder: number;
}

export interface BiographyEntry {
	bio: string;
	display_order: number;
}

export interface Constituent {
	ConstituentID: number;
	Role: string;
	RoleID: number;
	DisplayName: string;
	AlphaSort: string;
	Nationality: string | null;
	BeginDate: number | null;
	EndDate: number | null;
	BeginDateISO: string | null;
	EndDateISO: string | null;
	DisplayDate: string | null;
	Biography: string | null;
	display_bios: BiographyEntry[];
	Institution: string | null;
	ConstituentType: "Individual" | "Entity";
	DisplayOrder: number;
	DisplayLabel: string;
}

export interface MediaItem {
	media_xref_id: number;
	media_master_id: number;
	rank: number;
	is_primary: boolean;
	display_order: number;
	media_view: string | null;
	public_caption: string | null;
	copyright: string | null;
	photographer: string | null;
	credit_line: string | null;
	use_quality: string | null;
	copyright_status: string | null;
	web_publishing_size: string | null;
	remarks: string | null;
	approved_for_web: boolean;
	display_in_report: boolean;
	media_type: string;
	pixel_h: number | null;
	pixel_w: number | null;
}

export interface ExhibitionEntry {
	ExhibitionID: number;
	ExhTitle: string;
	DisplayDate: string;
	BeginISODate: string;
	EndISODate: string;
	IsInHouse: boolean;
	VenueName: string;
}

export interface DimensionEntry {
	DisplayDimensions: string;
	Description: string | null;
	/** e.g. "Overall", "Framed", "Frame", "Sheet" (TMS Element). */
	ElementName: string | null;
	Displayed: boolean;
	Rank: number;
}

export interface ChildCard {
	id: number;
	accession_number: string;
	title: string | null;
	primary_artist_display: string | null;
	display_date: string | null;
	iiif_thumbnail_url: string | null;
	has_iiif: boolean;
}

export interface SampleMeta {
	reason: string;
	picked_at: string;
	populated_fields: number;
}

/** Full ES document shape for a FAMSF collection object. */
export interface CollectionDocument {
	id: number;
	accession_number: string;
	sort_number: string;
	title: string;
	object_name?: string;
	display_date?: string;
	begin_iso_date?: string;
	end_iso_date?: string;
	medium?: string;
	medium_parts?: string[];
	dimensions?: string;
	dimensions_display_primary?: string;
	credit_line?: string;
	department?: string;
	classification?: string;
	copyright?: string;
	object_rights_type?: string;
	on_view: boolean;
	last_modified: string;
	is_virtual: boolean;
	web_text?: string;
	didactic_label?: string;
	exhibition_history_text?: string;
	bibliography_text?: string;
	provenance?: string;
	edition?: string;
	signed?: string;
	inscribed?: string;
	markings?: string;
	titles: TitleEntry[];
	constituents: Constituent[];
	media: MediaItem[];
	exhibitions: ExhibitionEntry[];
	dimensions_structured: DimensionEntry[];
	associations: unknown[];
	is_compound: boolean;
	term_rights_statement?: TermEntry[];
	term_place_of_creation?: TermEntry[];
	term_place_of_fabrication?: TermEntry[];
	term_place_name_at_creation?: TermEntry[];
	term_related_geography?: TermEntry[];
	term_find_spot?: TermEntry[];
	term_period?: TermEntry[];
	term_reign?: TermEntry[];
	term_dynasty?: TermEntry[];
	term_style?: TermEntry[];
	term_movement?: TermEntry[];
	term_school?: TermEntry[];
	term_materials?: TermEntry[];
	term_subject?: TermEntry[];
	term_intended_market?: TermEntry[];
	primary_artist: string;
	iiif_info_url?: string;
	iiif_thumbnail_url?: string;
	has_image: boolean;
	primary_artist_display?: string;
	display_year?: string;
	has_iiif: boolean;
	has_provenance: boolean;
	has_children: boolean;
	sort_artist: string;
	sort_year?: number;
	indexed_at: string;
	identifying_description?: string | null;
	accession_iso_date?: string | null;
	location_string?: string | null;
	location_building?: string | null;
	location_room?: string | null;
	physical_child_ids?: number[] | null;
	virtual_child_ids?: number[] | null;
	physical_parent_id?: number | null;
	parent_accession_number?: string | null;
	parent_title?: string | null;
	child_cards?: ChildCard[] | null;
	_sample_meta?: SampleMeta | null;
}

/** Derive a IIIF image URL from a media_master_id. */
export function iiifImageUrl(mediaMasterId: number, size = "!600,600"): string {
	return `https://famsf.emuseum.com/apis/iiif/image/v2/${mediaMasterId}/full/${size}/0/default.jpg`;
}

/** Return the primary media item for a document, if any. */
export function primaryMedia(doc: CollectionDocument): MediaItem | undefined {
	return doc.media.find((m) => m.is_primary) ?? doc.media[0];
}

/**
 * Return all images for a document, sorted by:
 * 1. is_primary first
 * 2. display_order ascending
 * 3. rank ascending
 *
 * Filters out non-Image media types only. The approved_for_web flag is
 * intentionally ignored in the wireframes: it is unreliable on the
 * current sample exports and would hide every image otherwise. Production
 * surfaces (Searchkit / Craft) should reapply the filter.
 */
export function allMedia(doc: CollectionDocument): {
	visible: MediaItem[];
	hiddenCount: number;
} {
	const images = doc.media.filter((m) => m.media_type === "Image");
	const visible = images.sort((a, b) => {
		if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
		if (a.display_order !== b.display_order)
			return a.display_order - b.display_order;
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
