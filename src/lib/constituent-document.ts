/**
 * TypeScript types for FAMSF constituent (artist/entity) ES documents.
 *
 * Source of truth: collection-flow-famsf/src/collection_flow_famsf/defs/assets/prepare/
 * Sample files:    src/data/sample-constituents/
 */

export interface BiographyEntry {
	bio: string;
	display_order: number;
}

export interface SampleObject {
	id: number;
	accession_number: string;
	title: string | null;
	display_date: string | null;
	primary_artist_display: string | null;
	iiif_thumbnail_url: string | null;
	has_iiif: boolean;
}

export interface FacetCount {
	value: string;
	count: number;
}

export interface DecadeBucket {
	decade: number;
	count: number;
}

export interface DateRange {
	earliest_year: number;
	latest_year: number;
}

export interface ConstituentFacets {
	total_works: number;
	on_view_count: number;
	has_iiif_count: number;
	exhibited_count: number;
	date_range: DateRange | null;
	classifications: FacetCount[];
	departments: FacetCount[];
	top_subjects: FacetCount[];
	top_materials: FacetCount[];
	top_places_of_creation: FacetCount[];
	top_styles: FacetCount[];
	top_movements: FacetCount[];
	decade_histogram: DecadeBucket[];
}

export interface SampleMeta {
	reason: string;
	picked_at: string;
	populated_fields: number;
}

/** Full ES document shape for a FAMSF constituent record. */
export interface ConstituentDocument {
	id: number;
	name: string;
	alpha_sort?: string | null;
	display_date?: string | null;
	nationality?: string | null;
	begin_date_iso?: string | null;
	end_date_iso?: string | null;
	biography?: string | null;
	institution?: string | null;
	display_bios?: BiographyEntry[] | null;
	object_count: number;
	sample_objects?: SampleObject[] | null;
	facets?: ConstituentFacets | null;
	indexed_at: string;
	_sample_meta?: SampleMeta | null;
}

/** Count populated top-level fields (non-null, non-empty-array). */
export function populatedFieldCount(doc: ConstituentDocument): number {
	return Object.values(doc).filter((v) => {
		if (v === null || v === undefined || v === false) return false;
		if (Array.isArray(v)) return v.length > 0;
		return true;
	}).length;
}
