/**
 * ES field name -> TMS source mapping.
 *
 * Derived from:
 *   collection-flow-famsf/src/collection_flow_famsf/defs/assets/prepare/collection_documents.py
 *
 * Top-level CollectionDocument fields are keyed directly.
 * Struct sub-fields use the "array[].field" convention.
 */

export interface FieldMapping {
	/** Canonical TMS source: table.Column, or a short description of the derivation. */
	source: string;
	/** Extra context when the derivation is non-obvious. */
	notes?: string;
}

export const FIELD_MAP: Record<string, FieldMapping> = {
	// ── Identifiers ─────────────────────────────────────────────────────
	id: { source: "Objects.ObjectID" },
	accession_number: { source: "Objects.ObjectNumber" },
	sort_number: {
		source: "Objects.SearchObjectNumber",
		notes: "pre-padded sort key from TMS",
	},

	// ── Tombstone / Tier 1 Descriptive ──────────────────────────────────
	title: {
		source: "Objects.DisplayedTitle",
		notes: "joined from ObjTitles; primary title selected by TMS",
	},
	object_name: { source: "Objects.ObjectName" },
	portfolio: { source: "Objects.Portfolio" },
	display_date: { source: "Objects.Dated" },
	begin_iso_date: {
		source: "Objects.BeginISODate",
		notes: "TMS 11-char encoding cleaned to plain AD year string in prepare",
	},
	end_iso_date: {
		source: "Objects.EndISODate",
		notes: "TMS 11-char encoding cleaned; mirrors begin_iso_date when null",
	},
	medium: { source: "Objects.Medium" },
	medium_parts: {
		source: "Objects.Medium",
		notes: "derived: split on ';' in transform/objects.py, each part stripped",
	},
	dimensions: { source: "Objects.Dimensions" },
	dimensions_display_primary: { source: "Objects.DisplayDimensionsStr" },
	credit_line: { source: "Objects.CreditLine" },

	// ── Tier 1 Admin / Descriptive lookups ──────────────────────────────
	department: { source: "Objects.Department" },
	classification: { source: "Objects.Classification" },
	named_collection: {
		source: "Objects.UF_NamedCollection",
		notes: "user-field, FAMSF-specific",
	},

	// ── Tier 1 Rights ───────────────────────────────────────────────────
	copyright: { source: "Objects.Copyright" },
	object_rights_type: { source: "Objects.ObjectRightsType" },

	// ── Admin flags ─────────────────────────────────────────────────────
	on_view: { source: "Objects.OnView" },
	last_modified: { source: "Objects.LastModified" },
	is_virtual: { source: "Objects.IsVirtual" },
	physical_parent_id: { source: "Objects.PhysicalParentID" },
	is_compound: {
		source: "Objects.ObjectNumber",
		notes: "derived: regex \\d+-\\d+$ on accession number in transform",
	},

	// ── Text entries ────────────────────────────────────────────────────
	identifying_description: {
		source: "TextEntries.TextEntry",
		notes: "where TextTypeID = 230 (Identifying Description)",
	},
	web_text: {
		source: "TextEntries.TextEntry",
		notes: "where TextTypeID = 192 (Web Text)",
	},
	didactic_label: {
		source: "TextEntries.TextEntry",
		notes: "where TextTypeID = 185 (Didactic Label)",
	},
	exhibition_history_text: { source: "Objects.Exhibitions" },
	bibliography_text: { source: "Objects.Bibliography" },
	provenance: {
		source: "Objects.Provenance",
		notes: "the Objects column, not the TextEntries copy",
	},
	label_text: {
		source: "TextEntries.TextEntry",
		notes: "where TextTypeID = 158 (Label(s) on Object)",
	},

	// ── Accession + location scalars ────────────────────────────────────
	accession_iso_date: {
		source: "ObjAccession.AccessionISODate",
		notes: "joined via ObjAccession; first row by AccessionID",
	},
	location_string: {
		source: "Locations.LocationString",
		notes: "via ObjComponents -> ObjLocations -> Locations",
	},
	location_building: {
		source: "Locations.LocationString",
		notes: "derived: first comma-delimited token of location_string",
	},
	location_room: {
		source: "Locations.Room",
		notes: "via ObjComponents -> ObjLocations -> Locations",
	},

	// ── Marks / physical description ────────────────────────────────────
	edition: { source: "Objects.Edition" },
	signed: { source: "Objects.Signed" },
	inscribed: { source: "Objects.Inscribed" },
	markings: { source: "Objects.Markings" },

	// ── Derived primary-artist fields ────────────────────────────────────
	primary_artist: {
		source: "Constituents.DisplayName",
		notes:
			"derived: first constituent by DisplayOrder; 'Unknown artist' fallback",
	},
	primary_artist_display: {
		source: "Constituents.DisplayName + Constituents.BeginDate/EndDate",
		notes:
			"derived: '{DisplayName} ({BeginDate}–{EndDate})' from first constituent",
	},
	sort_artist: {
		source: "primary_artist",
		notes: "derived: ASCII-folded, lowercased, leading articles stripped",
	},

	// ── Derived date fields ──────────────────────────────────────────────
	display_year: {
		source: "begin_iso_date / end_iso_date",
		notes: "derived: compact year string, '1965' or '1965–67'",
	},
	sort_year: {
		source: "begin_iso_date",
		notes: "derived: integer parse of begin_iso_date for numeric sort",
	},

	// ── IIIF URL fields ──────────────────────────────────────────────────
	iiif_info_url: {
		source: "MediaMaster.MediaMasterID",
		notes:
			"derived: https://famsf.emuseum.com/apis/iiif/image/v2/{id}/info.json",
	},
	iiif_thumbnail_url: {
		source: "MediaMaster.MediaMasterID",
		notes:
			"derived: https://famsf.emuseum.com/apis/iiif/image/v2/{id}/full/300,/0/default.jpg",
	},

	// ── Boolean roll-ups ─────────────────────────────────────────────────
	has_image: {
		source: "media[]",
		notes: "derived: media list length > 0",
	},
	has_iiif: {
		source: "iiif_info_url",
		notes: "derived: iiif_info_url is not null",
	},
	has_provenance: {
		source: "Objects.Provenance",
		notes: "derived: provenance is not null",
	},
	has_children: {
		source: "physical_child_ids",
		notes: "derived: physical_child_ids list is non-empty",
	},

	// ── Parent denorm ────────────────────────────────────────────────────
	parent_accession_number: {
		source: "Objects.ObjectNumber",
		notes: "derived: self-join on physical_parent_id -> accession_number",
	},
	parent_title: {
		source: "Objects.DisplayedTitle",
		notes: "derived: self-join on physical_parent_id -> title",
	},

	// ── Child arrays ─────────────────────────────────────────────────────
	physical_child_ids: {
		source: "Objects.PhysicalParentID",
		notes:
			"derived: reverse lookup: ObjectIDs whose PhysicalParentID == this id",
	},
	virtual_child_ids: {
		source: "ObjAssocXrefs / virtual parent links",
		notes:
			"derived: reverse virtual-parent lookup in transform/object_relationships.py",
	},
	virtual_parent_ids: {
		source: "ObjAssocXrefs / virtual parent links",
		notes: "derived: virtual parent IDs for this object",
	},
	child_cards: {
		source: "physical_child_ids + virtual_child_ids",
		notes:
			"derived: self-join, up to 60 children, struct with id/accession_number/title/...",
	},

	// ── Pipeline metadata ────────────────────────────────────────────────
	indexed_at: {
		source: "(pipeline)",
		notes: "added at index time by ElasticsearchIndexer",
	},

	// ── Nested relations ─────────────────────────────────────────────────
	titles: {
		source: "ObjTitles",
		notes: "all title entries for this object",
	},
	constituents: {
		source: "ConXrefs -> ConXrefDetails -> Constituents",
		notes: "filtered by vCI_PrismPeopleFilter; sorted by DisplayOrder",
	},
	media: {
		source: "MediaXrefs -> MediaMaster + ConXrefs",
		notes: "filtered by vCI_PrismMediaFilter",
	},
	exhibitions: {
		source: "ExhObjXrefs -> Exhibitions -> ExhVenues",
	},
	dimensions_structured: {
		source: "DimItemElemXrefs -> DimensionElements",
	},
	associations: {
		source: "ObjAssocXrefs",
		notes: "raw association records; shape TBD",
	},

	// ── Thesaurus term arrays ────────────────────────────────────────────
	term_rights_statement: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Rights Statement",
	},
	term_place_of_creation: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Place of Creation",
	},
	term_place_of_fabrication: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Place of Fabrication",
	},
	term_place_name_at_creation: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Place Name at Creation",
	},
	term_related_geography: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Related Geography",
	},
	term_find_spot: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Find Spot",
	},
	term_period: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Period",
	},
	term_reign: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Reign",
	},
	term_dynasty: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Dynasty",
	},
	term_style: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Style",
	},
	term_movement: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Movement",
	},
	term_school: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for School",
	},
	term_materials: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Materials",
	},
	term_subject: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Subject",
	},
	term_intended_market: {
		source: "ThesXrefs -> Terms",
		notes: "AttributeTypeID for Intended Market",
	},

	// ── titles[] sub-fields ──────────────────────────────────────────────
	"titles[].Title": { source: "ObjTitles.Title" },
	"titles[].TitleType": { source: "ObjTitles.TitleType" },
	"titles[].Language": { source: "ObjTitles.Language" },
	"titles[].DisplayOrder": { source: "ObjTitles.DisplayOrder" },

	// ── constituents[] sub-fields ────────────────────────────────────────
	"constituents[].ConstituentID": { source: "Constituents.ConstituentID" },
	"constituents[].Role": { source: "ConXrefs.Role" },
	"constituents[].RoleID": { source: "ConXrefs.RoleID" },
	"constituents[].DisplayName": {
		source: "Constituents.DisplayName",
		notes: "via ConXrefDetails.ConstituentID",
	},
	"constituents[].AlphaSort": { source: "Constituents.AlphaSort" },
	"constituents[].Nationality": { source: "Constituents.Nationality" },
	"constituents[].BeginDate": { source: "Constituents.BeginDate" },
	"constituents[].EndDate": { source: "Constituents.EndDate" },
	"constituents[].BeginDateISO": { source: "Constituents.BeginDateISO" },
	"constituents[].EndDateISO": { source: "Constituents.EndDateISO" },
	"constituents[].DisplayDate": { source: "Constituents.DisplayDate" },
	"constituents[].Biography": { source: "Constituents.Biography" },
	"constituents[].Institution": { source: "Constituents.Institution" },
	"constituents[].ConstituentType": { source: "Constituents.ConstituentType" },
	"constituents[].DisplayOrder": { source: "ConXrefs.DisplayOrder" },
	"constituents[].DisplayLabel": { source: "ConXrefs.DisplayLabel" },
	"constituents[].display_bios": {
		source: "ConDisplayBios (separate extract)",
		notes: "bio text + display_order per constituent",
	},

	// ── media[] sub-fields ───────────────────────────────────────────────
	"media[].media_xref_id": { source: "MediaXrefs.MediaXrefID" },
	"media[].media_master_id": { source: "MediaMaster.MediaMasterID" },
	"media[].rank": { source: "MediaXrefs.Rank" },
	"media[].is_primary": { source: "MediaXrefs.PrimaryDisplay" },
	"media[].display_order": { source: "MediaXrefs.DisplayOrder" },
	"media[].media_view": { source: "MediaMaster.MediaView" },
	"media[].public_caption": { source: "MediaMaster.PublicCaption" },
	"media[].copyright": { source: "MediaMaster.Copyright" },
	"media[].photographer": {
		source: "ConXrefs.PhotographerConxrefID -> Constituents.DisplayName",
	},
	"media[].credit_line": { source: "MediaMaster.CreditLine" },
	"media[].use_quality": { source: "MediaMaster.UseQuality" },
	"media[].copyright_status": { source: "MediaMaster.MediaCopyrightStatus" },
	"media[].web_publishing_size": { source: "MediaMaster.WebPublishingSize" },
	"media[].remarks": { source: "MediaMaster.MediaRemarks" },
	"media[].approved_for_web": { source: "MediaMaster.ApprovedForWeb" },
	"media[].display_in_report": { source: "MediaMaster.DisplayInReport" },
	"media[].media_type": { source: "MediaMaster.MediaType" },
	"media[].pixel_h": { source: "MediaMaster.PixelH" },
	"media[].pixel_w": { source: "MediaMaster.PixelW" },

	// ── exhibitions[] sub-fields ─────────────────────────────────────────
	"exhibitions[].ExhibitionID": { source: "Exhibitions.ExhibitionID" },
	"exhibitions[].ExhTitle": { source: "Exhibitions.ExhTitle" },
	"exhibitions[].DisplayDate": { source: "Exhibitions.DisplayDate" },
	"exhibitions[].BeginISODate": { source: "Exhibitions.BeginISODate" },
	"exhibitions[].EndISODate": { source: "Exhibitions.EndISODate" },
	"exhibitions[].IsInHouse": { source: "Exhibitions.IsInHouse" },
	"exhibitions[].VenueName": {
		source: "ExhVenues.VenueName",
		notes: "first venue by display order",
	},

	// ── dimensions_structured[] sub-fields ──────────────────────────────
	"dimensions_structured[].DisplayDimensions": {
		source: "DimItemElemXrefs.DisplayDimensions",
	},
	"dimensions_structured[].Description": {
		source: "DimensionElements.Description",
	},
	"dimensions_structured[].ElementName": {
		source: "DimensionElements.ElementName",
	},
	"dimensions_structured[].Displayed": {
		source: "DimItemElemXrefs.Displayed",
	},
	"dimensions_structured[].Rank": { source: "DimItemElemXrefs.Rank" },

	// ── Constituent document top-level fields ────────────────────────────
	constituent_id: { source: "Constituents.ConstituentID" },
	constituent_name: { source: "Constituents.DisplayName" },
	constituent_alpha_sort: { source: "Constituents.AlphaSort" },
	constituent_display_date: { source: "Constituents.DisplayDate" },
	constituent_nationality: { source: "Constituents.Nationality" },
	constituent_begin_date_iso: { source: "Constituents.BeginDateISO" },
	constituent_end_date_iso: { source: "Constituents.EndDateISO" },
	constituent_biography: {
		source: "ConBios.Biography",
		notes: "first non-null bio entry for this constituent",
	},
	constituent_institution: { source: "Constituents.Institution" },
	constituent_display_bios: {
		source: "ConDisplayBios pivot",
		notes: "all bio entries per constituent, sorted by display_order",
	},
	constituent_object_count: {
		source: "derived",
		notes: "count of distinct ObjectID per ConstituentID via ConXrefs",
	},
	constituent_sample_objects: {
		source: "Objects + MediaMaster",
		notes: "up to N objects linked to this constituent, with thumbnail URLs",
	},

	// ── child_cards[] sub-fields ─────────────────────────────────────────
	"child_cards[].id": { source: "Objects.ObjectID", notes: "child record" },
	"child_cards[].accession_number": {
		source: "Objects.ObjectNumber",
		notes: "child record",
	},
	"child_cards[].title": {
		source: "Objects.DisplayedTitle",
		notes: "child record",
	},
	"child_cards[].primary_artist_display": {
		source: "primary_artist_display",
		notes: "child record; same derivation as top-level",
	},
	"child_cards[].display_date": {
		source: "Objects.Dated",
		notes: "child record",
	},
	"child_cards[].iiif_thumbnail_url": {
		source: "MediaMaster.MediaMasterID",
		notes: "child record; derived IIIF thumbnail URL",
	},
	"child_cards[].has_iiif": {
		source: "iiif_info_url",
		notes: "child record; derived boolean",
	},
};
