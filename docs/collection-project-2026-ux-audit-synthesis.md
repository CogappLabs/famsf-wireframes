# Collection Project 2026

## UX Audit Synthesis Report

# **Project context**

This report synthesizes findings from the ux audit of the current FAMSF collection experience conducted as part of the Collections 2026 Discovery phase.

---

# **Methodology**

## Evaluation

For each museum evaluated, focus was given to the following areas (these map to the swimlanes found in the Figma):

* **Entry points:** Range of on-ramps each institution offers.  
* **Collections landing page:** How institutions organize and present their full holdings and how the landing page serves both art explorers and researchers.  
* **Search filters \- Basic and advanced:** Filter placement and persistence, mobile behavior, and how sites handle edge cases like zero results.  
* **Collections results:** Layout, sort and filter controls, and whether the results experience supports serendipitous discovery.  
* **Object detail page**  
  * **Image features:** Image features (deep zoom, multi-view, IIIF compliance).  
  * **Open Access \+ image rights:** How clearly each site communicates rights, download options, and open access status to visitors.  
  * **Metadata**: Presence and hierarchy of core fields and enhanced context.  
  * **Other content**: How institutions cross-link collection objects to related editorial, education resources, publications, and programming.  
  * **Discovery:** Quality and logic of related works recommendations and whether there are clear CTAs to visit and explore further.  
* **AI \+ Interactive elements:** AI tools, games, quizzes, and personalized features.  
* **Design observations:** Strengths, friction points, and specific moments where design either elevates the collection experience or works against it.

---

# **Overview**

## Emerging themes

* **The collection is buried.** Generally, the collection is treated as an area that needs to be sought out \- it sits below the fold, lacks any editorial/interactive hooks and fails to provide entry points for a variety of visitor types.  
* **Friction heavy experience.** Full-page reloads on filter changes, dead-end zero-results pages, no sort controls, and lack of expected advanced filter options can compound to create a frustrating experience for researchers interested in complex inquiries.  
* **The object detail page is not treated as a potential starting point.** With no clickable tags, no linked editorial content, and only static (non-contextual) recommendations, the page doesn’t offer any meaningful or relevant paths forward.   
* **Content exists but isn't connected.** Editorial content, audio, video, educational resources, and publications exist institutionally but aren't surfaced on collection pages or linked bidirectionally to objects.   
* **Interfaces not geared towards any single audience.** Throughout the experience, interfaces aim to accommodate all audiences (researchers and general audiences) which creates experiences where the collections site (i.e. advanced search) fails to serve any of its visitor types in a meaningful way.

## Strategic opportunities

| Area | Opportunity |
| :---- | :---- |
| Entry points | Elevate collection above the fold \+ diversify on-ramps beyond departmental browse |
| Collections landing page | Improved search-first experience with exposed quick filters, curated browse pathways by period, medium, and topic (or other) |
| Search \+ filter | Dynamic filtering, advanced filters \+ sorting |
| Collection results | List/grid toggle, open access icons, no full-page reloads, meaningful no-results page |
| Image features | Deep zoom, multi-view gallery, and download capability |
| Open Access \+ rights | Surface CC0 status, image permissions, and a "Request this image" path |
| Metadata | Clickable tags linked to filtered search results, fix formatting issues, improve long expandable section UX, incorporate more robust metadata fields |
| Editorial content | Bidirectional links to editorial/education content, standardize audio integration |
| Discovery \+ recommendations | Contextual recommendation module with multiple paths forward |
| AI \+ interactive | AI features grounded in verified content to deepen exploration, more interactive hooks to deepen general audience engagement |

---

# **Evaluation by area**

Across all eight evaluated areas, the FAMSF collection experience reflects a focus on visit planning over deep collection engagement. Critical capabilities common across peer institutions (deep zoom, linked metadata tags, dynamic filtering, contextual recommendations) are largely absent. The object detail page, which is frequently visitors' first point of contact via direct search engine links, currently acts as a dead end instead of a node.

## Entry points

* **Current state:** FAMSF's collection is currently a secondary destination with the primary purpose of the website being for planning. The first mention of the collection on the main homepage appears well below the fold and is first introduced to visitors via curatorial departments. There are no  interactive on-ramps, no unique entry points for primary visitor types, and no unique character framing of the collection offerings.  
* **Opportunity**: Improve prominence of collection entry points on the homepage and diversify the on-ramps beyond departmental browse.

## Collections landing page

* **Current state:** The landing page does a reasonable job of orienting visitors to the scale and range of the collection holding through introductory text. The word 'collection' is used to refer to both the full institutional holdings and individual curatorial departments which could potentially cause confusion. The 'Explore by Topic' editorial groupings cannot be used to filter artworks in the current state which can create some dissonance.  
* **Opportunity**: Implement a search-first model with exposed filters and a dynamic artwork gallery immediately visible. Supplement with curated browse pathways by period, medium, and topic (or other). Better align content topic tags with ways to filter collection artwork directly for a more cohesive experience. Resolve the language ambiguity around the word 'collection.'

## Search+ filter

* **Current state:** FAMSF's current filter set (What, Who, When, Collection) is too limited to support complex search and falls significantly short of peer institutions. Only the 'Who' filter dropdown is searchable. Applying or removing any single filter requires a full page reload. There is no geography filter, no attribution qualifier filtering, and no sort controls. Current zero-results experience functions as a dead-end with no guidance for moving forward.  
* **Opportunity**: Implement dynamic filtering with no full-page reload, expand filter fields to include geography, culture, donor, material/technique, and attribution qualifiers, add auto-suggest and exploration prompts, and design a useful zero-results experience.

## Collection results

* **Current state:** The results grid surfaces a good amount of information (title, date, artist, museum location) without being overwhelming. Applied filters are easy to see and remove. However, filter application requires a full page reload, there are no sort controls, no list view, and no-results pages are a dead end with no fallback or suggestions. Significant white space and visual misalignment when image dimensions vary gives an unpolished feel.  
* **Opportunity**: Implement a list/grid toggle, add open access indicator icons, eliminate full-page reloads on filter changes, and design a meaningful no-results page with fallback suggestions.

## Object detail page

### Overview

* **Current state:** The current object detail page lacks image zoom, image gallery, download capability, and rights communication for public domain works. The metadata architecture has a good foundation with expandable provenance, exhibition history, and bibliography sections, but known text formatting issues undermine readability. There are no clickable tags, no linked editorial content, no contextual recommendations that respond to what the visitor is actually looking at, and no path forward into the broader collection or institutional content ecosystem.  
* **Opportunity**: Implement key baseline functionality such as deep zoom, multi-view image gallery, and a download experience. Incorporate more robust \+ expandable metadata fields, link editorial content, and introduce a meaningful recommendation module. Design the object page as a discovery hub.

### Image features

* **Current state:** There is no image zoom, image gallery, or download capability.   
* **Opportunity**: Implement deep zoom, multi-view image gallery, and download experience  to achieve industry standard capabilities.

### Open access and image rights

* **Current state:** There is no rights communication on public domain object pages. Across all pages, visitors have no context for what they can do with images. There are no download options, no CC0 indicators, and no open access labeling of any kind.  
* **Opportunity**: Surface rights status, CC0 indicators, and accessible explanations of image permissions. Implement download options for open access works. For works under copyright, provide a clear 'Request this image' path.

### Metadata

* **Current state:** The metadata architecture has a good foundation with expandable provenance, exhibition history, and bibliography sections. However, known text formatting issues undermine readability. There are no clickable tags, no linked metadata fields, and expandable sections that fully expand even for very long content with no way to jump to the collapse control which negatively impacts scroll experience.  
* **Opportunity**: Incorporate clickable metadata tags, resolve text formatting issues, and improve the expandable section UX so very long content is manageable.

### Editorial content on the object page

* **Current state:** There is no linked editorial, educational, or publications content and no path forward into the broader institutional content ecosystem. Inconsistent audio integration (stemming from switch from in-house to BloombergConnects) creates an uneven experience where some artwork has audio integrated and others are missing it despite content being available.  
* **Opportunity**: Establish direct bidirectional links between object pages and related editorial content. Surface educational resources on the object page. Standardize audio integration so the experience is consistent regardless of content source.

### Discovery and recommendations

* **Current state:** There are no clickable tags in metadata, no contextual recommendations, and no path forward into the broader collection. 'Currently on View' and 'New Acquisitions' modules surface static institutional content rather than responding to the specific object a visitor is viewing.  
* **Opportunity**: Design the object page as a discovery hub. Implement a meaningful recommendation module with multiple relationship types (same artist, same medium, same gallery, thematically related). Add clickable metadata tags that link to filtered search results. 

### AI and interactive elements

* **Current state:** No interactive or AI-powered elements are currently available to support exploration of the digital collection.  
* **Opportunity**: Introduce interactive features that are accessible without logins, leverage AI to improve search relevance and recommendations. Ensure that any use of AI is clearly labeled, opt-in/out for educator contexts, and grounded in verified content.