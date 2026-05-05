# Full report

# FAMSF Digital Collections \- Technical overview and context document 

[**Executive summary	2**](#executive-summary)

[**2021 Website redesign	3**](#2021-website-redesign)

[What happened	3](#what-happened)

[Why integration was chosen	3](#why-integration-was-chosen)

[What was proposed but not implemented	4](#what-was-proposed-but-not-implemented)

[Impact of merging collections into the main website	4](#impact-of-merging-collections-into-the-main-website)

[**Current system overview	4**](#current-system-overview)

[Website infrastructure \+ architecture	4](#website-infrastructure-+-architecture)

[Collections ecosystem	5](#collections-ecosystem)

[Visual diagram: Data \+ system flow	7](#visual-diagram:-data-+-system-flow)

[Art finder search infrastructure	7](#art-finder-search-infrastructure)

[**Current processes	7**](#current-processes)

[Collections import workflow	7](#collections-import-workflow)

[Complete import	7](#complete-import)

[Translation import workaround for complete imports	9](#workaround-for-localization-effect-on-complete-imports)

[Delta import	9](#delta-import)

[Collections front-end fields	10](#collections-front-end-fields)

[Audio tour module	10](#audio-tour-module)

[**Pain points \+ technical risks	10**](#pain-points-+-technical-risks)

[Complete import	10](#complete-import-1)

[Translations	11](#translations)

[Delta import	11](#delta-import-1)

[Front-end formatting \+ data integrity issues	11](#front-end-formatting-+-data-integrity-issues)

[Other technical debt	12](#other-technical-debt)

[Staff workflow challenges	12](#staff-workflow-challenges)

[Gallery Systems technical support	13](#gallery-systems-technical-support)

[**Architecture options for future exploration	13**](#architecture-options-for-future-exploration)

[**Collections-related work	14**](#collections-related-work)

[Overview	14](#overview)

[Ongoing work \+ related projects	14](#ongoing-work-+-related-projects)

[Web 2.0	14](#web-2.0)

[Universal Collections	15](#universal-collections)

[CIDA	15](#heading=h.l43w49bhf62l)

[**Initial Collections-related requirements	16**](#initial-collections-related-requirements)

[Overview	16](#overview-1)

[Integration requirements	16](#integration-requirements)

[Technical \+ infrastructure requirements	16](#technical-+-infrastructure-requirements)

[Artwork detail page \+ front-end feature requirements	16](#artwork-detail-page-+-front-end-feature-requirements)

[Artwork detail page enhancements	16](#artwork-detail-page-enhancements)

[UI modules	16](#ui-modules)

[Visual indicators \+ icons	17](#visual-indicators-+-icons)

[Collections data \+ metadata requirements	17](#collections-data-+-metadata-requirements)

[Core fields	17](#core-fields)

[Geographic data and attributes	17](#geographic-data-and-attributes)

[Artist / Maker data	17](#artist-/-maker-data)

[Object relationships \+ hierarchies	17](#object-relationships-+-hierarchies)

[Department \+ terminology	18](#department-+-terminology)

[Search \+ filtering improvements	18](#search-+-filtering-improvements)

[Navigation / information architecture needs	18](#navigation-/-information-architecture-needs)

[**Risks \+ dependencies	19**](#risks-+-dependencies)

[Dependencies	19](#dependencies)

[Risks \+ considerations	19](#risks-+-considerations)

[**Additional considerations	19**](#additional-considerations)

[Image recognition	19](#image-recognition)

---

# Executive summary {#executive-summary}


Today, several factors indicate that the collections portion of the website requires a major update:

* The current collections import process is fragile, extremely slow, and requires both CMS and full website downtime.  
* Formatting inconsistencies and data transformation issues degrade the quality and accessibility of object pages.  
* Limitations in the current website feature set force us to re-import the complete set of \~150,000 collections object records each time we update the collections on the site. These constraints also necessitate replacing the entire production website database as part of the process, which introduces  operational risk.  
* The large amount of artwork and artist records included and the schema required to store the associated data make the website database much larger in both size and complexity than it needs to be. This also introduces performance and resource issues and associated costs.   
* The museum’s collections ecosystem (TMS → Prism → eMuseum → Website) has grown in scope and complexity since 2021\.  
* There are viable alternate hosting models that separate collections from the primary website and reduce risk and cost.

The 2026 project presents an opportunity to:

* Modernize the collections pipeline  
* Introduce incremental updates instead of full imports  
* Improve performance, scalability, and editorial workflow  
* Revisit whether collections should remain on the main website or move to a dedicated environment  
* Improve Collections UI for content discoverability and easy navigation  
* Support more robust capabilities for both general and research audiences(such as search and browseability improvements)

The following document provides the background, systems overview, current pain points, and architecture options necessary to inform scoping and upcoming strategic decisions.

---

# 2021 Website redesign {#2021-website-redesign}

## **What happened** {#what-happened}

* Area 17 and internal teams redesigned [famsf.org](http://famsf.org) to consolidate the separate online presences of the de Young, Legion of Honor, and FAMSF.   
* Collections were merged into the main website rather than hosted separately, as was always the case previously.

## **Why integration was chosen** {#why-integration-was-chosen}

* Create a unified visitor experience.  
* Allow collections, stories, and exhibitions to interlink more naturally on the website.  
* Give CMS users a way to easily embed collections object data in other website content.

## **What was proposed but not implemented** {#what-was-proposed-but-not-implemented}

Senior Web \+ Interactive Developer Andrew Fox’s original strategy (2021) recommended:

* Keeping collections on a separate web property and building a dedicated custom collections site.  
* Using customized eMuseum as an interim public collections site during work on new platform.   
* Deprecating eMuseum to internal and middleware use, using its API to integrate collection data into the main site.  
* The long-term plan included creating a public API.

## **Impact of merging collections into the main website** {#impact-of-merging-collections-into-the-main-website}

**Benefits**

* Unified UX  
* Centralized access to content  
* Simplified navigation and branding  
* No need to host or maintain separate collections website

**Drawbacks**

* Collections data ballooned the main database in size and complexity  
* Full imports became disruptive and risky  
* Architecture became tightly coupled and less flexible  
* Incremental update work never undertaken  
* Heavy traffic (bot, AI scraper, and otherwise) on collections content negatively affects overall site performance.  
* Public API work was deprioritized

---

# Current system overview {#current-system-overview}

## **Website infrastructure \+ architecture** {#website-infrastructure-+-architecture}

The following tech stack was implemented as part of the 2021 website redesign with A17. 

| Component | Purpose |
| :---- | :---- |
| Upsun (formerly Platform.sh) | The infrastructure that hosts the Laravel website application |
| eMuseum (Gallery Systems hosted web platform) | Provides collections data via API and images through its IIIF server functionality. |
| Laravel (PHP framework) | The PHP framework that powers the website |
| Twill CMS (by A17) | An open-source CMS built on Laravel by A17 to manage / edit content via a non-technical UI |
| Fastly CDN | The CDN and firewall that also provides optimized web images through Fastly Image Optimizer |

## **Collections ecosystem**  {#collections-ecosystem}

Gallery Systems and associated products are utilized by our CIDA team to manage FAMSF collections information. Said information is then pushed to the website to populate collections-related fields. 

![][image1]

| Component | Purpose |
| :---- | :---- |
| TMS Ecosystem | This ecosystem comprises TMS Collections and Media Studio. |
| TMS Collections | A Collection Management System (cms) developed by Gallery Systems to store detailed canonical records of objects in a museum’s collections. |
| Media Studio | Digital Asset Management software (DAM) Gallery Systems product that’s on the same database as TMS |
| Prism | The middleware between TMS and eMuseum (SQL query). Prism syncs eMuseum with TMS Collections nightly. |
| eMuseum | Collections website that’s bundled with TMS and provides an API that provides collections data and images to the website (multi-view API endpoint for objects as part of the collections import. Separate detail API endpoint for individual object records). Website currently restricted to FAMSF staff and other authorized users but could be public-facing if permissions are configured to allow. |

## **Visual diagram: Data \+ system flow** {#visual-diagram:-data-+-system-flow}

The following visual provides a high-level understanding of how information currently flows from the Collections ecosystem to the FAMSF website. Information is input into the Collections ecosystem by internal FAMSF teams (Curatorial, Registration, DAM) which is then imported into the FAMSF website via an import process that involves the eMuseum API, a local development environment, and the main production database.   
![][image2]

## **Art finder search infrastructure** {#art-finder-search-infrastructure}


[https://www.famsf.org/art-finder](https://www.famsf.org/art-finder) 

---

# Current processes {#current-processes}

## **Collections import workflow** {#collections-import-workflow}

### Complete import {#complete-import}


**Process summary**

1. Content freeze starts  
2. Production website database dumped and imported to local development site.  
3. Collections data downloaded from eMuseum via its multi-view API endpoint.  
4. Downloaded collections data imported into the local website database.  
5. Local database with new collections data backed up/exported.  
6. **Updated  local database overwrites the production database.**  
7. Updates are reflected on the production website.  
8. Content freeze ends.

**Technical details**

* No process for incremental updates is available as the delta import work was never undertaken by A17.  
* Import triggers jobs in Laravel worker queues which are run offline.  
* Laravel’s localization features mean that for a full import, a job must run for each artwork and artist translation, even though there is currently no multilingual content in either of these record types. Currently there are 5 languages (including US English default).  
  * 4 additional translation locales \= 4× job volume  
  * Import without translations: \~12–18 hours  
  * Import time with translations: \~48 hours

![][image3]

For more detailed information, refer to [Twill/Laravel Collections Update](https://docs.google.com/document/d/1RbkZUQMsYaAe9tv_J7Jxirr8UWKuQS8RVadgjIOu4aY/edit?tab=t.0). 

### Workaround for localization effect on complete imports {#workaround-for-localization-effect-on-complete-imports}

December 2025, Andrew investigated ways to get around having to create all translations when running a complete import ([Jira ticket](https://famsfweb.atlassian.net/browse/WP-242?atlOrigin=eyJpIjoiYjIxM2VjZDlhNjc2NDE1ODkwYzg4YmVmNWQ1ODllMmYiLCJwIjoiaiJ9)).

* **Hypothetical:** Have artwork job only happen for English, not for all translations.  
* **Limitations of Laravel:** Multi-language capabilities are added to all content on the site; limiting this to only certain content models is not possible under normal circumstances.  
* **Workaround:** Limit translations by turning off in config files in a new feature branch that only runs locally during the import; this speeds things up during the import to reduce the overall import time.\*


\**This is not an actual solution to the current import problems per se, just a temporary workaround to allow for imports to be successfully completed until we have the time and resources to implement a proper solution.*

### Delta import {#delta-import}


## **Collections front-end fields** {#collections-front-end-fields}

Information imported from TMS to the website populates object information on artwork detail pages. The full list of current fields that map to the website can be found here in the “For the Web” tab: [Public Access Information by Field\_updated 23 Apr 2025](https://docs.google.com/spreadsheets/d/1H-Z-aUW3smdd_WQY7xnmLWDkTvYxteCcWhPgWYaW0Yc/edit?gid=1404486793#gid=1404486793)  
![][image4]

### Audio tour module {#audio-tour-module}

Audio tour modules were launched with the Legion of Honor 100 celebration. These can reference the related object record and will contextually display on that object’s page if selected within the CMS. With the transition to Bloomberg Connects for audio tour context, we will likely not utilize these modules moving forward. 

---

# Pain points \+ technical risks {#pain-points-+-technical-risks}

## **Complete import** {#complete-import-1}

[Complete import details](#complete-import) 

* Full imports require complete production database replacement  
* Risk of downtime  
* Risk of the website database and TMS/eMuseum becoming out of sync  
* Website content cannot be updated during associated content freeze  
* Extremely time consuming due to the number of records and rows that must be processed for translatable content (artist\_translations and artwork\_translations)  
* Are only run every \~2 weeks after hours 

## **Translations** {#translations}

Translations increase the number of jobs that have to be run during an import, significantly increasing the completion time. 

## **Delta import** {#delta-import-1}

Currently there is no incremental delta import of records to the website.

## **Front-end formatting \+ data integrity issues** {#front-end-formatting-+-data-integrity-issues}

Currently, there are several formatting discrepancies that exist between what’s in the rich text fields in TMS and how it appears on the website.

**Problems**

* \<div\> tags inserted by TMS’s rich text editor or by TMS users interfere with “read more” javascript in the artwork description, resulting in truncated content on the front end.  
* Paragraph tags (\<p\>\</p\>) were disallowed in Twill’s WYSIYWG fields to avoid inadvertently breaking the site layout.  
* Single break tags (\<br\>) were being styled with CSS to give them a top margin value in order to mimic the appearance of paragraph breaks (as an alternative to \<p\> tags).  
  * Single break tags no longer appear as paragraph breaks in Chrome and Safari due to a recent change in how those browsers render CSS when applied to non-structure elements.  
  * While still supported in some browsers (notably Firefox), this CSS workaround is no longer effective for the majority of our desktop and mobile visitors.  
* Users are forced to use non-standard markup, e.g. \<br\>\<br\> as a substitute for a paragraph break, which is considered bad for accessibility, screen readers, and search engine optimization (SEO). This approach seems to have limited support on the website, however.  
* Some tags seem to be getting stripped when importing data from the eMuseum API and it is currently unclear how; it may be something in the core Twill functionality.

**Source of issues**

* TMS rich text editor adds \<div\> tags automatically under certain circumstances.  
* TMS users paste \<div\> tags and other markup from source applications (Word, Google Docs, HTML pages, PDFs, etc.)  
* TMS’s rich text editor does not sanitize HTML to exclude potentially disruptive markup.  
* Twill CMS does not allow using paragraph tags (\<p\>\</p\>) to create section breaks, forcing users to utilize single break tags, causing mismatches between systems’ expectations  
* Website CSS code responsible for \<br/\> tag formatting or lack thereof  
* Website CMS potentially responsible for stripping out tags

**Result**

* Inconsistent or incorrect display of artwork descriptions and missing text  
* Artwork Bibliographies, Exhibition Histories, and Provenance become difficult to read  
* Editorial frustration  
* Investigation and troubleshooting time to try to identify the cause of the issue

**Current workarounds**  
Currently pending outcome of diagnostic troubleshooting. We will continue to investigate with Cogapp in January 2026\.

## **Other technical debt** {#other-technical-debt}

* Collections share the same environment as core website, which increases:  
  * Deployment risk  
  * Database size  
  * Use of database resources (memory and CPU), especially when being crawled by bots  
  * Operational complexity

## **Staff workflow challenges** {#staff-workflow-challenges}

* Editors must avoid using CMS during imports.  
* The site content cannot be updated via CMS during imports.  
* Imports require engineering staff involvement.  
* Engineer must undertake the import in off-hours to avoid interfering with editors’ work.

## **Gallery Systems technical support** {#gallery-systems-technical-support}

Gallery Systems provides support services for their suite of products (TMS Collections, eMuseum, etc.). While responsiveness is generally good, their backlog of work for their client base often means that seemingly simple changes or fixes can sometimes take a long time to complete. That said, they have been extremely proactive on some occasions.

Unlike a dedicated web hosting vendor (e.g., Upsun), Gallery Systems does not have an SLA or on-call support staff to deal with eMuseum issues that arise after hours. There have been cases where eMuseum has gone offline after 5 pm EST, and we’ve had to wait until the following Monday for one of their engineers to address the issue, leaving the website with no collections images at all for the whole weekend.

Additionally, Gallery Systems has deployed new features, such as CAPTCHA protection for eMuseum without providing advance notice, which has led to API and IIIF request failures. These were quickly resolved by their hosting team, but shouldn’t have happened in the first place.

---

# Architecture options for future exploration {#architecture-options-for-future-exploration}

There are several architecture options we can explore for the updated collections content noted below. Additional conversations will need to be had in collaboration with Cogapp to verify the validity of the options, identify any alternatives, and determine which is worth pursuing within the current budgetary constraints. 

* **Two completely separate websites** \- FAMSF main site and a dedicated custom collections website.  
  * Databases,codebases, and hosting environments separated  
  * Not necessary to use the Laravel/Twill/php stack for both projects  
  * Reduces resource load on primary public website during times of heavy visitation.  
  * Can provide collections data to the main website via API.  
* **Headless API-driven** \- variation on first option, but collections platform lives behind the firewall and exposes data to the main website via REST API or the like.  
  * Databases and codebases separated as above.  
  * Does increase complexity due to the need to integrate both systems.  
* **Combined website** \- This is the current structure of the website and not a viable option to maintain moving forward. That being said, there is work that can be completed in order to get the current structure to function as originally intended (delta import, etc.)  
  * Single database  
  * Single codebase

---

# Collections-related work {#collections-related-work}

## **Overview** {#overview}

This section outlines collections related work or projects that may inform the final direction and scope of the upcoming Collections 2026 project. 

## **Ongoing work \+ related projects** {#ongoing-work-+-related-projects}

### Web 2.0 {#web-2.0}

During discovery for the Web 2.0 project, collections-related requests were captured. The list can be found in the sheet below. The sheet doesn’t capture formal requirements, just requests that should be reviewed and weighed against Collections project specific findings / requirements. 

* [Collections 2026 Feature List](https://docs.google.com/spreadsheets/d/1pkpJDW4FKswy-rWjjwIG3OKMRYiK60feZEZ5_WEvAtc/edit?gid=0#gid=0) \- User stories captured during discovery included needs related to:  
  * Search fields \+ filter UI  
  * Image viewing and downloading options  
  * Artwork gallery  
  * Copyright related information \+ icons  
  * Content linking on artwork detail pages (publications, articles, past exhibitions, etc.)  
  * General landing page layout / content hierarchy  
* [Web2.0 Stakeholder Survey Findings Reports](https://docs.google.com/document/d/1c-8XAVyIHKCUkEsAzeNBsOZfoX-mTcGTLd1lXyVO0Ow/edit?tab=t.a5qq1n9kmx9x#bookmark=id.85bv8lvq48r) \- As part of discovery, a web survey went out to several members of the Curatorial team. This document captures larger sentiments of the Curatorial team’s perception of the website (prior to Web 2.0), specifically the collections area of the website. Key takeaways:  
  * Key areas for improvements  
    * **Integration for richer content:** The ability to easily integrate diverse media (zoomable images, videos, audio, related stories, scholarly essays) directly onto artwork and exhibition pages to provide a more immersive and comprehensive online experience. This extends to better integration with internal systems like TMS for seamless content updates.

### Universal Collections {#universal-collections}

[Universal Collection Executive Briefing Document](https://docs.google.com/document/d/1WzE0NUHgt33f0wBEYxL0eJEZ02NNF-_7ZH91-e11YQA/edit?tab=t.0#heading=h.7phgd02j0h70)  
[Universal Collection Prototype & Vision Project Briefing Doc](https://docs.google.com/document/d/1vihn1km4Ih5Y_rr6XvL4K9bxWUU3efDQhpd4HbG3xQM/edit?tab=t.0#heading=h.7phgd02j0h70) 

The goal of the original Universal Collections project was to create a functional prototype that proved the technical feasibility of a combined universal museum collections web platform and to create visualizations that captured the product potential for participating museums and technical partners. In the long-term, this platform would be globally accessible, AI-powered, and do the following:

* Aggregate object records from museums, libraries, archives, and other cultural repositories.  
* Use generative AI and LLMs to normalize metadata, integrate object records, and aggregate descriptive and didactic content.  
* Support cross-collection search and discovery.  
* Offer tiered access to data and imagery through a “freemium” model, with potential revenue-sharing back to participating institutions.

As part of the Universal Collections project, an audit of the current collections experience and landscape research was conducted. Some key audit findings are noted below:

* “Currently on view” or similar page recirc modules should highlight relevant information / artwork (i.e., contextually display additional works by artist or from that curatorial collection instead of showing seemingly random artworks)  
* Re-evaluate general landing page layout to help with discoverability or ‘quick filtering’ by allowing people to more quickly click into specific collections  
* Illustrating relationships between individual artwork (parent \<\> child relationship for things such as pages within a larger book)  
* “Advanced search” filters are hidden from main search \+ missing more advanced search filters. Can we uplevel common collections-specific search fields? What additional fields can be incorporated?

Research can be reviewed in the following Figma: [Collections Landscape Analysis](https://www.figma.com/design/Mt3C3QN6qSiwtNF88UmYqT/Collections-Landscape-Analysis?node-id=1-2&p=f&t=0MZyg6F7BXme9VWb-0). 

---

# Initial Collections-related requirements {#initial-collections-related-requirements}

## **Overview** {#overview-1}

This section captures initial requirements that have arisen across related projects. This is not an exhaustive list nor has it been scoped for the upcoming Collections 2026 project. 

## **Integration requirements** {#integration-requirements}

* Collections data must be API-driven and dynamically integrated into the main website regardless of hosting location  
* Collections integrations / cross-linking with exhibitions, stories, and learning content  
* Additional searchable fields pushed to the website


## **Technical \+ infrastructure requirements** {#technical-+-infrastructure-requirements}

* Support incremental (delta) updates without website downtime  
* Define image hosting strategy (eMuseum media dispatcher API vs. dedicated IIIF server (Canteloupe, Serverless IIIF, etc.) vs. S3, etc.)  
* Create scalable database architecture for collections  
* Address translation and localization requirements

## **Artwork detail page \+ front-end feature requirements** {#artwork-detail-page-+-front-end-feature-requirements}

These requirements focus on enhancements to the object detail page and associated UI modules.

### Artwork detail page enhancements {#artwork-detail-page-enhancements}

* Support for richer media presentation:  
  * More zoomable images  
  * Image galleries  
  * Multiple media types (audio, video)

### UI modules {#ui-modules}

* Related objects module ([Object relationships \+ hierarchy](#bookmark=kix.4ulp5xixthdz) ):  
  * Parent \<\> child relationships  
  * Ensembles, portfolios, and series  
* Contextual recirculation modules:  
  * Additional artworks by the same artist  
  * Related works from the same collection  
  * Related works by same time period or geographic location

### Visual indicators \+ icons {#visual-indicators-+-icons}

* Copyright status indicators  
  * Public domain  
  * In copyright  
  * Copyright unknown

## **Collections data \+ metadata requirements** {#collections-data-+-metadata-requirements}

[New eMuseum API fields for website](https://docs.google.com/document/d/1bn3THsw0Lgdrc7npb3sgNxh50bcma1SkzgRB81I0naQ/edit?tab=t.0)

### Core fields {#core-fields}

* Alternate Titles, Object names  
* Mark(s), Inscription(s), Signed, Label(s) on Object  
* Identifying Description  
* Alt Text for all images

### Geographic data and attributes {#geographic-data-and-attributes}

* Additional GeoXrefs (and certainty)  
  * “Paths” a priority  
* Additional Attributes  
  * Keywords  
  * Period  
  * School  
  * Style  
  * Movement, etc.

### Artist / Maker data {#artist-/-maker-data}

* Constituent Records grouped by Constituent ID  
* Nuanced attributions:  
  * “Invisible Role”  
  * “Possibly”  
* Artist Geographic Data should also be searchable

## **Object relationships \+ hierarchies** {#object-relationships-+-hierarchies}

Support complex relationships between objects including:

* Parent / child record  
  * Ensemble Parent / Ensemble Child  
  * Portfolio Parent / Portfolio Child  
  * Series Parent / Series Child


Additional details: [Parent/Child Records](https://docs.google.com/presentation/d/1PHjT-Fg7BCfrC-Ay57Vycun-zaetHzpbIxmdYnptiLg/edit?slide=id.p#slide=id.p)

## **Department \+ terminology** {#department-+-terminology}

* Clarification re: terminology: “Collections” vs. “Department”  
* Support objects belonging to multiple departments  
* Break out Arts of Africa, Oceania, and Americas into multiple departments where appropriate

## **Search \+ filtering improvements** {#search-+-filtering-improvements}

Search must better support general audiences as well as advanced researchers.

* Expand searchable fields across object records  
* Improve filter / facet visibility \+ usability  
* Incorporate additional advanced filters such as:  
  * Geography Xrefs  
  * Donor  
  * Keyword  
  * Department / collection  
* Introduce AI/semantic search to improve findability.  
* Computer vision to enable subject-matter searches.

## **Navigation / information architecture needs** {#navigation-/-information-architecture-needs}

* Re-evaluate collection landing pages to improve:  
  * Discoverability  
  * Quickie entry into collections  
* Improve cross-linking between exhibitions, stories, and collections

---

# Risks \+ dependencies {#risks-+-dependencies}

## **Dependencies** {#dependencies}

* TMS ecosystem  
  * Data will continue to be provided by either the eMuseum API or will be exported directly from TMS Collections in a manner TBD.  
* Laravel/Twill  
  * There must be some basic compatibility with the existing website platform and CMS, even if it’s just via an API.

## **Risks \+ considerations** {#risks-+-considerations}

* Separate codebase and database for a collections site means increased hosting expense and maintenance costs (updates, etc.).  
  * This is mitigated by the fact that the collections website has historically had substantially lower traffic than the main website and thus won’t require as robust a hosting solution.  
  * Additionally, this would lead to reduced traffic and resource usage by the main [famsf.org](http://FAMSF.org) website.  
* Separating the websites would not only allow for easier and more consistent updating of collections data, but also mitigate bot-related downtime and performance degradation on the [famsf.org](http://FAMSF.org) website.

---

# Additional considerations {#additional-considerations}

### Image recognition {#image-recognition}


Additional details can be found here: [(Draft) FAMSF image recognition discovery](https://docs.google.com/presentation/d/1jAYoTv4iosD1Lhfw4KZastqxKMdoEXv8HbpatZ0V2L0/edit?slide=id.g2da90411e50_0_289#slide=id.g2da90411e50_0_289)

# TL;DR

This sheet offers a concise overview of the current state of FAMSF’s digital collections, the risks of maintaining the status quo, and the opportunity presented by the Collections 2026 initiative.

# Background \+ context

In 2021, FAMSF undertook a redesign project to unify the website separate Legion of Honor and de Young websites. As part of this effort, the museum’s online collections, historically hosted on a separate platform, were fully integrated into the main [famsf.org](https://www.famsf.org/) website.

This decision improved cohesion between exhibitions, stories, and collection objects, and enabled a more unified visitor experience. However, it also introduced significant technical complexity and long-term operational risk, which has become more apparent as the collections ecosystem and digital ambitions have evolved.

---

# Current state

Today, the collections portion of the website is constrained by architectural and budgetary decisions made in 2021 that have prevented it from scaling effectively and meeting the needs of an expanded collections dataset and more complex data relationships.

## **Key challenges**

* High operational risk  
  * Each collections update requires replacing the entire production website database.  
  * Updates require planned CMS downtime and off-hours engineering work.  
* Inefficient update process  
  * There is no incremental (“delta”) update capability.  
  * Even small changes require large, disruptive imports, since a complete import of all records must be done every time.  
* Performance and scalability concerns  
  * Collections data dramatically increases database size and complexity.  
  * The main website bears unnecessary load from bots, crawlers, and search indexing.  
* Staff workflow constraints  
  * Editors cannot use the CMS during imports.  
  * Imports take \~24 hours to run.  
  * Engineering involvement is required for routine updates.

These issues actively limit how often collections data can be updated and how effectively the museum can present its collections online.

---

# Why it matters now

Why the upcoming Collections 2026 project should address underlying architecture:

* The collections ecosystem (TMS → Prism → eMuseum → Website) has grown more complex since 2021\.  
* Digital expectations for collections (search, media richness, interlinking, discoverability) have increased.  
* Related initiatives (Web 2.0, Image Recognition, Universal Collections) depend on a more flexible, reliable collections infrastructure.  
* Continuing with the current model increases risk and cost over time.

---

# Opportunity: Collections 2026

Strategic opportunities include:

* Modernizing the collections data pipeline  
* Enabling automated incremental updates with no website downtime  
* Improving performance, reliability, and editorial workflows  
* Supporting richer object pages (media, relationships, context)  
* Improving search and discovery for both general audiences and researchers  
* Re-evaluating whether collections should:  
  * Remain embedded in the main website, or  
  * Live in a dedicated, decoupled environment integrated via APIs  
* Improve Collections UI for content discoverability and easy navigation  
* Support more robust research audience needs (such as search improvements)

---

# Architecture paths to consider

* **Two completely separate websites** \- FAMSF main site and a dedicated custom Collections website.  
  * Databases and codebases separated  
  * Not necessary to use the Laravel/Twill/php stack for both projects  
  * Reduces resource load on primary public website  
* **Headless API-driven** \- Variation on first option, but Collections platform lives behind the firewall and exposes data to the main website via RESTful API or the like.  
  * Databases and codebases separated as above  
  * Increases complexity due to need to integrate both systems  
* **Combined website** \- This is the current structure of the website and not a viable option to maintain moving forward. That being said, there is work that can be completed in order to get the current structure to function as originally intended (delta import, etc.)  
  * Shared database  
  * Single codebase

---

# Initial requirements (high level)

The Collections 2026 project should create a durable, scalable foundation that supports near-term improvements and long-term digital strategy. The project should address the following:

**Data \+ integration**

* Collection data must be API-driven and dynamically integrated into [famsf.org](http://famsf.org)  
* Expand the number of searchable and filterable fields available to include, such as geography, keywords, donor, department, and artist metadata  
* Support complex objection relationships (parent / child, ensembles, portfolios, series)

**Architecture \+ infrastructure**

* Enable incremental updates  
* Eliminate website downtime for collections updates  
* Define image hosting strategy

**Editorial \+ operational**

* Allow CMS users to continue working during collections updates  
* Support more frequent, automated updates

**User experience \+ discovery**

* Improve collections search, filtering, and discoverability for general audiences and researchers  
* Support more content-rich object pages  
  * Zoomable images  
  * Image galleries  
  * Audio, video, and other media content  
  * Contextual recirculation modules (related work, works by the same artist or within the same collection)  
* Improve collections landing pages and navigation to enable faster entry points in to the collection

---

# Risks \+ dependencies

**Dependencies**

* Collection data will continue to originate from Gallery Systems Ecosystem.  
* There must be baseline compatibility with the existing FAMSF website and CMS.  
* Changes to eMuseum APIs and data exports may be dependent on Gallery Systems’ development backlog and support availability.

**Risks \+ considerations**

* Increased hosting and maintenance costs if we move to a separate collections platform  
* Integration complexity to avoid a fragmented user experience.  
* New workflows, tooling, and data models will require coordination across multiple internal FAMSF teams.  
* Maintaining the current approach continues to increase operational risk, technical debt, and long-term cost, while limiting the museum’s ability to expand its digital collections experience.




