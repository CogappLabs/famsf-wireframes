# Collection Project 2026

## Landscape Research Synthesis Report

# **Project context**

This report synthesizes findings from the landscape research audit conducted as part of the Collections 2026 Discovery phase. It covers ten institutions in detail (The Met, Art Institute of Chicago, National Gallery of Art DC, Cleveland Museum of Art, Rijksmuseum, The Getty, SFMOMA, Detroit Institute of Arts, Victoria & Albert Museum, and Minneapolis Institute of Art) as well as six cross-industry websites (Unsplash, Google Arts & Culture, Nordstrom, Discogs, and Internet Archive). 

[Figma: 2026 Collections SwimLane Analysis](https://www.figma.com/design/2rq13EmNEdVDWx13Lwf7Dc/2026-Collections-Landscape-Analysis?node-id=2041-789&t=2rpPNc5AcpiJtn3n-1)

* P: 2026Collections

---

# **Methodology**

## Scope

Audit and evaluate 10 peer institutions, including those that were referenced by multiple stakeholders during the stakeholder interviews, across critical evaluation areas listed below. Audit cross-industry examples across five broader evaluation areas listed below.

## Museums

* The Metropolitan Museum of Art (The Met)  
* Rijksmuseum  
* Victoria and Albert Museum (V\&A)  
* San Francisco Museum of Modern Art (SFMOMA)  
* Cleveland Museum of Art (CMA)  
* Art Institute of Chicago (AIC)  
* National Gallery of Art (DC)  
* Minneapolis Institute of Art (Mia)  
* Detroit Institute of Arts (DIA)  
* The Getty

## Cross-industry

* **Unsplash** \- Image-first browsing, open access and licensing communication, visual search  
* **Google Arts & Culture** \- AI and interactive features, cross-institution discovery, general audience engagement.   
* **Nordstrom** \- Search and filter architecture, multi-select behavior, results layout, detail page patterns  
* **Discogs** \- (evaluation in progress)  
* **Internet Archive** \- (evaluation in progress)

## Evaluation

**Museum**  
For each museum evaluated, focus was given to the following areas (these map to the swimlanes found in the Figma):

* **Entry points:** Range of on-ramps each institution offers.  
* **Collections landing page:** How institutions organize and present their full holdings and how the landing page serves both art explorers and researchers.  
* **Search filters (basic and advanced):** Filter placement and persistence, mobile behavior, and how sites handle edge cases like zero results.  
* **Collections results:** Layout, sort controls, and whether the results experience supports serendipitous discovery.  
* **Object detail page**  
  * **Image features:** Deep zoom, multi-view, IIIF compliance.  
  * **Open Access \+ image rights:** How clearly each site communicates rights, download options, and open access status to visitors.  
  * **Metadata:** Presence and hierarchy of core fields and enhanced context.  
  * **Other content:** How institutions cross-link collection objects to related editorial, education resources, publications, and programming.  
  * **Discovery:** Quality and logic of related works recommendations and whether there are clear CTAs to visit and explore further.  
* **AI \+ Interactive elements:** AI tools, games, quizzes, and personalized features.  
* **Design observations:** Strengths, friction points, and specific moments where design either elevates the collection experience or works against it.

**Cross-industry**  
Cross-industry audits focused on similar areas but were broader in their approach due to the nature of the mix of websites: 

* Homepage  
* Search, filters, and results  
* Detail pages  
* AI \+ interactive elements  
* Design observations

---

# **Emerging themes**

#### **Collections as a primary digital product.** 

One of the primary differentiators between evaluated museums is how they position their online collections. Institutions like AIC, NGA, CMA, and the Rijksmuseum treat the online collection as a primary digital product, investing in strong entry point strategies, contextual landing pages, and interaction design to ensure usable, efficient, and engaging experiences. Leading institutions calibrate entry points to multiple visitor types \- researchers, art explorers, and general audiences \- with AIC offering eight distinct paths from the homepage and NGA and Cleveland using games and AI-powered tools as low-barrier hooks. The Rijksmuseum goes further by framing its collection as something broader than an object database, treating visitor stories and publications as equal entry points. Other peer institutions strongly prioritize special exhibitions and editorial content: SFMOMA and DIA offer a single navigation entry point from the homepage with no other collection presence, and MIA requires a minimum of two clicks before a visitor encounters any artwork, routing users through an intermediate "Art & Artists" page that creates friction for visitors who already know what they want to search. V\&A offers a middle ground experience by having a clearly labeled collection entry outside of the main navigation but relegating it to the bottom of the page with a single thumbnail per pathway rather than a gallery view.

#### **Underselling the collection by failing to communicate breadth and character.** 

Underselling the collection by failing to communicate breadth and character. Across most audited institutions, online collections communicate scale ("over 500,000 objects") but fail to communicate institutional identity. SFMOMA's landing page provides no introductory text and no browse pathways, leading directly into a search-and-results interface. This is efficient for visitors who arrive with intent but can be disorienting for everyone else. DIA establishes scale and historical breadth but little of what makes the collection distinct. MIA leads with editorial content before offering any path into the collection itself; its dedicated collection site is stronger, with introductory content that explicitly connects its broad holdings to the museum's mission, but the friction of reaching that page means most visitors will never see it. Some institutions compensate through visual and structural identity rather than text: the Rijksmuseum uses full-bleed artwork, community visitor stories, and an interactive gallery-curation tool to express depth and character without introductory copy \- an approach that works because the visual experience itself carries institutional voice. AIC's language is engaging and friendly, inviting exploration of icons and lesser-known works alongside editorial resources. The Getty's collection composition visualization conveys breadth through data rather than description. The V\&A's tagline "If you're into it, it's in the V\&A" is confident and memorable, but the landing page behind it offers browse modes without much context about what makes the holdings distinctive or why they're worth exploring beyond a specific lookup.

#### **The object detail page should be a node, not an endpoint.** 

The object detail page should be a node, not an endpoint. While commonly a visitor's first stop when arriving from search engines, the object detail page often functions as a dead end, metadata without linked tags, editorial content buried or absent, and discovery modules offering only a single relationship type. The strongest implementations treat the page as a genuine hub. AIC and NGA offer multiple pathways forward by artist, medium, date, and tag, alongside robust related-works galleries. MIA's inline filmstrip expansion is the most distinctive discovery interaction in the audit, surfacing related artworks directly within the page when a visitor clicks "+" next to any metadata term to keep them anchored to the current object rather than routing them elsewhere. Clickable metadata tags, present at the Rijksmuseum, V\&A, DIA, and MIA, create strong discovery pathways without requiring a dedicated recommendation module. The Getty's tiered download pop-up and the Rijksmuseum's two-tab About / Data structure offer strong models for balancing general and researcher audiences on the same page, while V\&A's persistent scrolling module maintains visual connection to the artwork as visitors move through metadata. Many institutions fall short in discovery depth and only surface a single relationship type without giving visitors agency to explore other dimensions. Rights communication is another failure point and remains inconsistently implemented across institutions evaluated.

#### **Collection results and filters serve researchers inconsistently, with no-results states as the most universal failure.**

Results pages and filters across the field serve researchers reasonably well in places but fall short in sort options, view flexibility, attribution granularity, and recovery from failed searches. Among filter implementations, DIA's advanced search is strong with eight filter categories that have dynamically updating search bars, multi-select before applying, and applied filters displayed as removable tags. SFMOMA introduces useful filters like "Acquired Date" but has a critical accessibility failure in that filter search bars use dark backgrounds that make typed text nearly invisible. On the results side, Cleveland's list view which surfaces thumbnail, title, artist, accession number, medium, dimensions, credit line, and rights status in a single scannable row,  is the most robust researcher-oriented view in the audit. NGA surfaces on-view status and a download icon for open-access works directly in the results grid which is great for researchers and casual browsers who may be interested in downloading artwork. V\&A, CMA, and NGA offer both a masonry grid and a list view toggle. MIA introduces a  distinctive results page with a detail/quick view panel, allowing visitors to assess an object without leaving the results page. The most consistent failure across all evaluated is the zero-results dead end wherein there is no fallback browsing, no suggested alternatives, and no recovery pathway. V\&A is unique in offering both guidance for improving searches and suggested alternatives. SFMOMA is the worst offender with a completely blank page: no message, no confirmation the search ran, and no path forward. MIA shows only a text count alongside a persistent "Download results as CSV" button which is confusing. 

#### **Interactive tools to deepen visitor engagement with museum collections.** 

The best implementations of AI and interactive tools are low-stakes, friendly to all audiences, and do not require login. Cleveland has made the most significant institutional investment, with three tools targeting different audience types. NGA's ArtVibes and Artle offer games and mood-based tools to lower the barrier for visitors who would not otherwise engage with traditional collection search. The Rijksmuseum offers "Search Visually" browsing on object detail pages. DIA's Mad Lib Search is well-integrated and immediately comprehensible, and V\&A's "Shuffle Objects" button within the "You May Also Like" module is a lighter but effective implementation. SFMOMA and MIA offer no interactive or AI-powered features beyond MIA's floor plan explorer. Google Arts & Culture, a non-industry website, offers and example of when interactive engagement is treated as a primary product feature rather than an add-on: camera-based tools with strong social sharing, AI remix and poetry tools surfaced directly on detail pages, a dedicated games section, and zero-effort discovery mechanics.

---

# **Cross-industry observations**

The following observations draw on evaluation of Unsplash, Google Arts & Culture, Nordstrom, Discogs, and Internet Archive. These sources were selected for image-first browsing, licensing communication, search and filter architecture, discovery design, and AI-powered features. They are referenced throughout the features sections where findings are most directly applicable to FAMSF's priorities.

## Search, filter, and navigation patterns

Nordstrom's search bar surfaces Popular Searches, Trending Near You, and Recently Viewed suggestions at the moment of engagement, lowering the blank-start problem for visitors who don't know where to begin. Nordstrom's structured category submenu largely takes the place of exposed filters by allowing visitors to narrow their intent before committing to a search at all, also functioning as an intent-based browse pathway. Google Arts & Culture takes the opposite stance, deliberately relegating search to a small icon in the top right corner. This really signals an experience designed around curated exploration rather than search-led navigation. Applied filter indication is a consistent gap across non-museum sources and museums alike. Unsplash (grayed dropdown with bolded text; orange dot on mobile) and Nordstrom (color-change on dropdown label) both use visual state changes on the filter control rather than persistent tag summaries. While this aids with “noise” on the page, it fails to communicate what is actually active without re-opening each dropdown. 

## Results and browsing design

Unsplash's handling of hover-reveal on mobile offers a direct solution to the gap that the Rijksmuseum creates: rather than hiding metadata behind a hover interaction that mobile visitors can't access, Unsplash surfaces the same metadata below the artwork on mobile. This ensures that image-first stance and information accessibility are not in conflict. Unsplash's masonry implementation constrains layout to two sizes only (one horizontal, one vertical) rather than fully freeform heights. This acts to maintain visual order even when artwork orientations are mixed. Nordstrom's hover behavior in the results grid surfaces an alternative product image, adding visual depth and providing a richer preview without cluttering the default grid. For museums with multi-view images, this could provide an exciting secondary view of the work directly in results without requiring navigation to the object page.

## Object detail pages

Nordstrom's reviews section could act as an analog for managing dense, multi-record content blocks on museum object pages such as provenance records, exhibition histories, and bibliographic references. Nordstrom carries its own dedicated filter set (search bar, sort, size and color dropdowns, quick filters for photos and verified purchasers) making it extremely easy to navigate specific sections of the page. Nordstrom's product detail layout also offers an alternative solution to collapsed or toggle-based sections with a two-column organization with labeled section headers. Unsplash's inclusion of engagement metrics (views and downloads for free works) on detail pages adds a layer of community context that mirrors social media experiences and signals the popularity and reuse of a given work. Within the museum space, this could tie back to open access artworks to reinforce the value of the open access program in a way that badges and labels alone cannot. 

## Discovery and recommendations

Unsplash's detail page offers two structurally distinct discovery sections for different purposes: a structured horizontal thumbnail grid for curated or series-based recommendations, and a broader masonry section for serendipitous related content. The explicit visual differentiation helps repeat visitors intuitively understand what each section offers. Nordstrom discovery modules are clearly differentiated by types that are intuitive to visitors: "Outfit Ideas for This Item" (editorial), "Recommended for You" (personalized), and "Sponsored" (commercial). This allows visitors to understand the logic behind each section. Nordstrom also positions a vertical recommendation module adjacent to the primary product content in addition to at the bottom of the page, surfacing discovery at the moment of highest engagement.

## AI and interactive features

Google Arts & Culture has invested more heavily in AI and interactive features than any other evaluated platform. Camera-based tools (Art Selfie, Pet Portraits, Art Projector, and Art Transfer) use the visitor's own image as input to generate art-inspired content. These tools lower engagement barriers for general audiences, though the requirement to download an app for some undermines their accessibility. Two AI features are surfaced directly on the artwork detail page are the Art Remix (using Google's Imagen model to allow visitors to remix a work from a descriptive prompt) and Poem Postcard (using PaLM 2 to generate an art-inspired poem). Both are positioned as primary features rather than optional extras, treating interactivity as the default experience rather than an add-on.  
Unsplash's Visual Search implementation is the strongest cross-industry model examined for image-based search: visitors can upload an image, drag and drop, paste a URL, or select from four provided seed images. Multiple input paths help to eliminate the blank-start problem for this type of tool. An inline "Need Help" tooltip provides additional guidance without requiring visitors to leave the search interface. 

---

# **Features**

**Standard**

* A navigation link to the collection from the global nav  
* An "Explore collections" CTA on the homepage

**Standout**

* Multiple calibrated entry points for different visitor types (researchers, art explorers, and general audiences) rather than a single path into the collection (AIC)  
* Low-barrier, non-search entry hooks such as games, mood tools, or AI-powered features that invite visitors in without requiring a query (NGA, Cleveland)  
* Framing the collection as broader than an object database by surfacing stories, publications, and community contributions alongside artworks (Rijksmuseum)  
* Randomized or surprise-based discovery as a zero-effort hook for visitors who arrive without intent (Google Arts & Culture)

## Collections landing page

**Standard**

* Introductory text communicating the scale and breadth of the collection  
* Browse by curatorial department or collection area  
* Link to advanced search

**Standout**

* Multiple structured browse pathways beyond departmental groupings (by period, medium, theme, or geography) serving general audiences (AIC, NGA)  
* An institutional voice or framing that communicates collection character/ethos rather than just scale (Mia with reference to mission on collections landing page)  
* Landing page as a research destination surfacing open access resources, research tools, and practical information for specialist audiences alongside browse pathways (The Met, AIC)  
* Community-generated content or visitor stories as a discovery pathway alongside institutional curation (Rijksmuseum)  
* Collection composition or data visualization giving researchers and art-curious visitors a high-level view of what the collection contains (Getty)  
* Intent-based browse pathways that allow visitors to narrow their interests before committing to a search (Nordstrom)

## Search \+ filter

**Standard**

* Keyword search with a clear path to advanced filtering  
* Core filters: artist, medium, date range, department  
* Quick access filters for on-view works and works with images  
* No full-page reload when filters are applied or removed  
* Mobile-optimized filter experience

**Standout**

* Suggested search prompts or exploration themes at the point of entry, lowering the blank-start problem for visitors who don't know where to begin (Getty, Nordstrom)  
* Attribution qualifier filters such as Signed by, Attributed to, Possibly Made by surfaced within the filter set rather than only on the object page (Rijksmuseum)  
* Provenance and collection history fields in advanced search, including credit line, exhibition history, and acquisition date (Cleveland)  
* Field-scoped search limiting searches to specific metadata fields such as artist name, accession number, or title (The Met, V\&A)  
* Visual or mood-based filtering as a non-keyword entry point for art explorers (AIC)  
* Open access and rights status as a first-class filter, surfacing public domain works as a browse dimension (AIC, Unsplash)

## Collection results

**Standard**

* Applied filters visible and individually removable from the results view  
* Sort options covering at minimum artist, title, and date  
* On-view and open access status that can be surfaced via indicators in the results grid or filter option

**Standout**

* A list view surfacing dense metadata such as dimensions, accession number, credit line, rights status in a single scannable row for researcher audiences (Cleveland, NGA)  
* A results preview panel allowing visitors to assess an object's key details without leaving the results page (MIA)  
* Grid and list view toggle serving both visual browsers and researchers (V\&A, Cleveland, NGA)  
* No-results states that offer alternative browse pathways, suggested searches, or fallback content rather than a dead end (V\&A)

## Object detail page: Image features

**Standard**

* A high-resolution zoomable image

**Standout**

* A multi-view image gallery showing alternate perspectives, details, verso, and installation shots (The Met, AIC, NGA)  
* Full-screen deep zoom with keyboard and mouse navigation shortcuts (The Met, AIC, NGA, Cleveland)  
* Download options with multiple file sizes or formats, with unavailable options clearly communicated rather than hidden (Getty, DIA)  
* A persistent image thumbnail that remains visible as visitors scroll through metadata (Cleveland, DIA)  
* A persistent scrolling image module keeping the primary artwork and gallery visible throughout the full page (V\&A)  
* Accessibility object descriptions as both a usability and searchability layer (NGA, Cleveland)  
* Augmented reality placement tools allowing visitors to view an artwork in their own physical space via mobile (The Met)

## Object detail page: Open access \+ image rights

**Standard**

* A rights or copyright indicator near the artwork image  
* A link to the institution's full rights and open access policy  
* A clear public domain or CC0 indicator for open access works

**Standout**

* Plain-language explanation of what visitors can and cannot do with an image, rather than relying on icons or legal terminology alone (Cleveland)  
* A clear action path for in-copyright works (a request link or licensing route) rather than a dead end when download isn't available (Getty, Cleveland)  
* Engagement metrics such as download counts on open access works, adding community context to the value of the open access program (Unsplash)

## Object detail page: Metadata

**Standard**

* Core tombstone fields: title, artist, date, medium, dimensions, credit line, accession number  
* Expandable provenance, exhibition history, and bibliography sections  
* Attribution qualifiers visible on the record

**Standout**

* Explicit separation of general-audience content from research-depth content via tabs, section splits, or collapsable section so both audiences find what they need without the page feeling overwhelming to either (Rijksmuseum, Getty)  
* Clickable metadata terms that route to filtered search results, turning each field into a discovery pathway (Rijksmuseum, V\&A, DIA)  
* Tooltips or plain-language explanations on specialist fields, making research-grade content accessible to general audiences (Getty, DIA)  
* A print or export function that expands all collapsed sections simultaneously (DIA)  
* Transparent data quality communication (empty section messaging, error-reporting contacts, and data disclaimers) (AIC, DIA)  
* In-section filtering or search within dense content blocks making extensive entries parsable without manual scrolling (Nordstrom)

## Object detail page: Other content

**Standard**

* Links to related editorial stories or articles from the object page

**Standout**

* Audio tour integration with transcript, as a meaningful accessibility and depth feature for institutions with audio programs (The Met, NGA, Cleveland, Rijksmuseum, Getty)  
* Editorial content surfaced alongside primary metadata (ex: a right-column module or filmstrip) rather than deferred below the fold (AIC, Rijksmuseum)  
* Bidirectional linking between object pages and editorial content so both surfaces reinforce each other  
* Educational resources surfaced directly on the object page, labeled by content type (AIC)  
* Multiple language audio options with transcripts available for all languages offered (SFMOMA offers multi-language audio but only provides a transcript for English)

## Object detail page: Discovery \+ recommendations

**Standard**

* A related works module on the object detail page  
* Recommendations based on at least one relationship type such as same artist or same medium

**Standout**

* Multi-category discovery such as by the same artist, in the same style, on view nearby  rather than a single opaque recommendation set (AIC, NGA, Cleveland)  
* Visually similar works surfaced through AI, clearly labeled as AI-generated (Cleveland)  
* Clickable metadata tags that initiate filtered searches directly from the object page (Rijksmuseum, V\&A, DIA)  
* Inline discovery that expands related works within the current page rather than routing visitors elsewhere (MIA)  
* Discovery surfaced adjacent to primary content at the point of highest engagement, not only deferred to the page bottom (Nordstrom)  
* Transparent recommendation logic so visitors understand why particular works appear together (Nordstrom)  
* Artist and maker hub pages as navigable entry points pulling together works, stories, and related content (Getty, Google Arts & Culture)

## AI \+ interactive elements

**Standout**

* Mood-based or descriptive word tools that generate curated artwork galleries for visitors who don't want to search (NGA)  
* Game-based discovery that to draw general audiences into the collection (NGA, Cleveland)  
* Visually similar works surfaced through AI on the object detail page, clearly labeled as AI-generated (Cleveland)  
* Image-based search allowing visitors to find works by uploading or providing an image (Rijksmuseum, Unsplash)  
* Camera-based tools that use a visitor's own image as input, generating art-inspired output (Google Arts & Culture)  
* Augmented reality tools that allow visitors to place artworks in their own physical environment, bridging the digital and physical collection experience (The Met)  
* AI-powered features surfaced directly on the object detail page as primary interactions, not buried in a separate section (Google Arts & Culture)  
* A consolidated interactive tools destination making all playful features discoverable in one place (Google Arts & Culture)