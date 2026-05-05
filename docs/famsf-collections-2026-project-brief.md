# Collections 2026 Briefing Document

## Cogapp x FAMSF

We are excited to partner with Cogapp to redefine the FAMSF digital collections experience. Building on our existing relationship, this brief outlines the next steps for transforming our collections infrastructure into an industry-leading platform.

# **Project overview**

The 2026 Collections project is a strategic effort to modernize how FAMSF manages and displays its digital assets. Since the 2021 redesign, our integrated, monolithic collections model has introduced significant technical debt, operational risk, and performance bottlenecks.

The goal of this project is to re-evaluate the current structure, implement a robust and automated data pipeline, and deliver a high-performance, research-grade front-end experience. This project is a cornerstone of FAMSF’s FY26-FY28 Strategic plan to build a world-class art collection and enhance public access to it.

---

# **Project objectives \+ engagement**

We are looking for a proposal that clearly distinguishes between defining a long-term vision and executing a near-term feature set. The proposal should include:

* **Discovery phase activities:** Detailed methodology for both parts of discovery.  
  * Long-term product vision  
  * Short term prioritized feature list for implementation  
* **Implementation phase activities**  
* **Cost estimates:** Total project cost, broken down by phase (Discovery, Phase 1 Implementation, and Phase 2 Implementation).  
  * Discovery proposal should include activities, deliverables, and project plan  
  * Phase 1 Implementation should include likely scope (subject to change based on Discovery).  
  * Phase 2 Implementation should include possible scope (subject to change based on Discovery).  
  * Discovery and Phase 1 cumulatively should not exceed $350,000. Note that additional fundraising will likely be required in order to achieve Phase 2 Implementation.   
* **Team structure:** Resource types and dedicated hours/FTE.

## Discovery Phase: Two milestone deliverables

Within the proposal, we’d like to see a Discovery phase that produces two distinct milestone deliverables:

### **Part 1: Long-term product vision (Strategic deliverable)** 

Defines:

* **The "North Star" experience:** An ambitious vision for how FAMSF presents its collection.  
* **Architecture strategy:** A definitive recommendation on hosting (e.g., Headless API vs. dedicated Collections environment) to reduce main-site database strain and address technical debt associated with the current set up.  
* **Scalability:** A roadmap for future-proofing the collection for the next 5+ years.

### **Part 2: Implementation roadmap (Tactical deliverable)** 

Translates the long-term vision into actionable phases of work:

* **Feature prioritization:** Categorize "Must-Haves" for Phase 1 implementation vs. Phase 2 (should include priority rankings \- e.g., P0, P1, P2). Explicitly state what won't be included in Phase 1 and 2 Implementation phases.   
* **Cost estimation:** Provide materials describing features for Phase 2 implementation to assist with FAMSF fundraising efforts. This is a crucial requirement. 

## Implementation Phase 1: Near-term “Must haves”

Following Discovery, the 2026 Implementation Phase 1 will likely focus on:

* **Modernized pipeline:** Implementing the new architecture and automated delta import workflow.  
* **Core UI/UX enhancements:** Redesigning the artwork detail pages, main collections site landing page and search interface to reflect the new vision.  
* **Data integrity \+ performance:** Resolving legacy technical debt (HTML sanitization, import speed, and database decoupling).

---

# **Proposed milestones \+ target timelines**

*Note: We welcome Cogapp’s feedback on the feasibility of these windows.*

| Milestone | Date | Key outcome |
| :---- | :---- | :---- |
| **Project Kickoff** | Mid Feb ‘26 | SOW signed, key stakeholder buy-in, and  discovery scheduling. |
| **Discovery kickoff** | Late Feb / Early March ‘26 | Formal start to discovery activities (landscape research, stakeholder interviews, etc). |
| **Discovery complete** | Early June ‘26 | **Deliverables:** Architecture strategy, North Star vision, and costed roadmap. |
| **Implementation kick off** | Early July ‘26 | Development of Phase 1 / "Must-Haves" begins. |
| **UAT Testing** | tbd | Internal \+ stakeholder testing (Researchers). |
| **Public launch** | tbd | Deployment of the new Collections experience. |

---

# **Audience \+ business goals**

## Audience goals

The updated collections interface should support educators, researchers and general audiences while prioritizing access to high-fidelity data, advanced search tools, and intuitive navigation of complex object relationships for our researcher audiences.

* **General audiences**: Discover related artwork via intuitive recirculation modules and search terms; seamless mobile viewing experience.   
* **Researchers:** Access to high-resolution imagery and granular metadata; robust advanced search capabilities.  
* **Educators:** Easily link to collections objects from curriculum to facilitate curriculum and/or trip planning.


## Business goals

* **Industry leadership:** Build a best-in-class museum collections experience.  
* **Public API development:** Build a public-facing API to enable broader access to collection data for researchers, and unlock opportunities for additional grant funding.  
* **Risk mitigation:** Eliminate the current "full database replacement" update model.  
* **Operational efficiency:** Implement an automated, incremental data pipeline that removes the manual engineering burden and allows for frequent, non-disruptive updates.  
* **Architecture \+ scalability:** Reduce resource strain on the primary FAMSF website, mitigate both-related performance degradation, and allow for independent scaling by decoupling architecture that separates collections from the monolithic website environment.   
* Remove our reliance on the eMuseum platform and reduce our annual spending with Gallery Systems by $8,000.

---

# **Website \+ Collection infrastructure and architecture**

## Current state

Please refer to the following document for a more detailed overview of the current FAMSF and FAMSF Collections infrastructure and architecture: [FAMSF Digital Collections: Technical overview and context document](https://docs.google.com/document/d/1Sfad0Z_mKL3lT6L7YIJGYK9CxkqT0Og5xXwEOTtLcoI/edit?tab=t.0) .

### **Website**

* **Platform.sh** \- infrastructure that hosts Laravel/Twill app  
* **Laravel** \- PHP framework that powers the website  
* **Twill** \- CMS built on Laravel by A17 to manage/edit content via a non-technical UI  
* **Fastly** \- CDN and firewall, also provides optimized images through Fastly Image Optimizer 

### **Website Collections**

* **TMS** \- A Collections Management System developed by Gallery Systems to store detailed records of objects in a museum’s collection  
* **Media Studio** \- Gallery system product that’s on the same database as TMS.   
* **Prism** \- Middleware between TMS and eMuseum (SQL Query)  
* **eMuseum** \- Collections website that’s bundled with TMS. Provides API.

## Internal challenges:

* **Collections data import:** Dependent on Gallery Systems’ eMuseum multi-view API and Collection Information (CI) department roadmap  
* **Collections images:** Availability of high-quality assets is inconsistent and may require coordination

---

# **Requirements**

Please refer to the following document for a more detailed list of initial requirements: [FAMSF Digital Collections: Technical overview and context document](https://docs.google.com/document/d/1Sfad0Z_mKL3lT6L7YIJGYK9CxkqT0Og5xXwEOTtLcoI/edit?tab=t.0) .

## Data \+ integration

* Collection data must be API-driven and dynamically integrated into [famsf.org](http://famsf.org)  
* Expand the number of searchable and filterable fields available to include things such as geography, keywords, donor, department, and artist metadata  
* Support complex objection relationships (parent/child, ensembles, portfolios, series)

## Architecture \+ infrastructure

* Enable incremental updates  
* Eliminate website downtime for collections updates  
* Define image hosting strategy  
* Implement IIIF-compliant image serving to support interoperability and advanced viewing capabilities

## Editorial \+ operational

* Allow CMS users to continue working during collections updates  
* Support more frequent, automated updates

## User experience \+ discovery

* Improve collection search, filtering, and discoverability for general audiences and researchers  
* Support more content-rich object pages  
  * Zoomable images   
  * Image galleries  
  * Audio, video, and other media content  
  * Contextual recirculation modules (related work, works by the same artist or within the same collection)  
* Improve collections landing pages and navigation to enable faster entry points in to the collection

---

# **FAMSF project team \+ key stakeholders**

**Primary project team**

* Digital Strategy Director: Madeleine DiBiasi  
* Web Product: Stephanie Amaro   
* Senior Web & Interactive Developer: Andrew Fox

**Key Stakeholders**

* Executive Leadership: Brooke Golden, Lisa Grove  
* Collections Information: Kathleen Forrest, Britta Traub  
* Curatorial Liaison: Isabella Holland   
* Web Content: Magnolia Molcan, Antonia Smith

---

# **Supplemental Materials**

The following documentation has been compiled to provide a comprehensive view of the current technical landscape, historical research, and initial feature requirements. Please reach out if you have any questions or trouble accessing any linked materials.

* [FAMSF Digital Collections: Technical overview and context document](https://docs.google.com/document/d/1Sfad0Z_mKL3lT6L7YIJGYK9CxkqT0Og5xXwEOTtLcoI/edit?tab=t.0) \- This document provides the background, systems overview, current pain points, and architecture options necessary to inform scoping and upcoming strategic decisions.

