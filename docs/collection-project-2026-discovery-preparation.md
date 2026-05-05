Collection Project 2026

FAMSF Discovery Preparation Doc

March - May 2026

# Context

Since the 2021 redesign, FAMSF's collections infrastructure has operated on an integrated monolithic architecture. While functional at launch, this model has introduced significant technical debt and operational risk.

The 2026 Collections Project represents a strategic opportunity to:

* **Modernize**: Transition to an automated, incremental data pipeline.
* **Decouple**: Separate the collections database from the main website for improved agility, performance, and scalability.
* **Optimize:** Eliminate dependency on eMuseum API, seeing $8,000 in annual savings.
* **Innovate**: Deliver a research-grade, audience-first experience compliant with WCAG 2.2 A/AA standards.

# **Discovery** Activities

## User + Audience Discovery

**Goal:** Identify friction points and qualifications of success for internal and external user segments: Curatorial, Education, CMS users, Art Explorers, and Researchers.

### Stakeholder Interviews – Completed

* + **Owner:** Stephanie Amaro, FAMSF
  + **Output:** Findings report, aspirational institution examples, initial feature wishlist
  + **Format:** Small group sessions, 45-60mins
  + **Dates:** March 23 - April 8 2026
  + **Resources**
    - [Collection Project 2026 - Stakeholder Interview Script](https://docs.google.com/document/d/197JjlhTgv2J43EF1MY7PTG9YrAAtzcX6rdqKTYnnrZw/edit?tab=t.0)
    - [Collection Project 2026 - Stakeholder Interview Synthesis](https://docs.google.com/document/d/1CMqbrfr_PwXncWCrROG_wknqKtHT44y3qcBiaxMvd5c/edit?tab=t.3spb4s290bz3)

### Analytics Review – In Progress

* + **Owner:** Stephanie Amaro, FAMSF
  + **Goal:** Understand how people are currently using the collections website and how much traffic on average we’re seeing.
  + **Output:** Data summary report highlighting top user flows, search term trends, and device breakdown (Mobile vs. Desktop)...
  + **Scope:** Search usage, collection page engagement, funnel drop-off, device breakdown
  + **Tools:** Google Analytics / Looker Dashboard
  + **Date:** April 6 - 10, 2026
  + **Resources**
    - [Collection Project 2026: Analytics Review](https://docs.google.com/document/d/1IlvlGILSrW1n6s-x3t62tZwyj5I0rPGY7Pddz7avxjM/edit?tab=t.0)

### Gap Analysis – Completed

* + **Owner:** Stephanie Amaro, FAMSF
  + **Goal:** Review what was asked for in 2021–2022 vs what was built, here's what was never addressed. Synthesize historical feedback from the Web 2.0 stakeholder survey and FGW findings to ensure continuity with previously identified needs.
  + **Output:** Summary of recurring curatorial and departmental requests.
  + **Date:** March 30 - April 10, 2026
  + **Resources**
    - [Collection Project 2026: Gap Analysis](https://docs.google.com/document/d/1_ITffF28YjE7AAwvl6GHAAyDQul1IcY7i4pucYn01Lc/edit?tab=t.tb3ae1cbj1gc) (FG+W)
    - [Collection Project 2026: Gap Analysis](https://docs.google.com/document/d/1_ITffF28YjE7AAwvl6GHAAyDQul1IcY7i4pucYn01Lc/edit?tab=t.e94mq7toy5bz) (Web2.)
    - *A17 old documentation - leaving out for now*

### UX Audit – In Progress

* + **Owner:** Stephanie Amaro, FAMSF + Cogapp
  + **Goal:** Evaluate the current FAMSF Collections interface against modern usability standards and peer institutions.
  + **Output:** Audit report with a prioritized list of UI/UX issues and immediate opportunity areas.
  + **Scope:** FAMSF collection search, object detail pages, landing pages, navigation, mobile experience.
  + **Date:** April 13 - May 1, 2026 (~3wks)
  + **Resources**
    - **[Links]**

### Web survey – In Progress (Launched April 14)

* + **Goal:** Gain insight into external user behaviors on the website.
  + **Questions**
    - What brought you to the collections today? (multiple choice with an "other" field — researcher, personal interest, educator/student, professional reference, just browsing)
    - Were you able to find what you were looking for? (Yes / Partially / No)
    - If not, what got in the way? (open text)
  + **Date:** April 14 - May
  + **Resources**
    - [Collection Project 2026 - Collections Hotjar Survey](https://docs.google.com/document/d/16MJ8zQm91DQWgL6yitaeBxcjo0QuRt7J6N7gyDthfJ4/edit?tab=t.yrvod0aep7sf)
    - [4/27 Hotjar AI summary](https://hotjar.com/l/gGRdLe)

## Technical Discovery

**Goal:** Define a scalable, decoupled architecture that supports high-resolution media and automated data sync.

### Infrastructure + Systems Audit – Completed

* + **Owner:** Andrew Fox, FAMSF + Cogapp
  + **Goal:** Map the current website infrastructure and TMS/eMuseum integration; identify pain points, failure modes, and scalability limits.
  + **Outputs:** Current-state system architecture diagram with documented pain points and scalability limits
  + **Date:** March - May 2026
  + **Resources**
    - [Executive Doc: Collection Project 2026 - Technical overview and context document](https://docs.google.com/document/d/1Sfad0Z_mKL3lT6L7YIJGYK9CxkqT0Og5xXwEOTtLcoI/edit?tab=t.0)

### Image Audit + Strategy – In Progress

* + **Goal:** Audit of current image hosting and assess IIIF feasibility and CDN requirements for high-resolution assets.
  + **Output:** Image hosting strategy document evaluating options — eMuseum media dispatcher API, dedicated IIIF server (Cantaloupe, Serverless IIIF, etc.), S3, or hybrid approaches
  + **Date:**
  + **Resources**
    - **[Links]**

### New collection website build recommendation – In Progress

* + **Outputs:** Recommended hosting strategy (Headless API vs. dedicated Collections environment).

## Business + Strategy Discovery

**Goal:** Align project outcomes with institutional KPIs and secure Phase 2 funding.

### Define Key Business Goals – Not Started

* + **Owner:** Stephanie Amaro + Madeleine DiBiasi, FAMSF
  + **Goal:** Define key business metrics and KPIs to be impacted by this project.
  + **Output:** KPIs + benchmarks.
  + **Date:** April - May, 2026
  + **Resources**
    - **[Links]**

### Landscape Analysis – In Progress

* + **Owner:** Stephanie Amaro, FAMSF
* **Goal:** Benchmark ~8 peer institutions for search, features, object detail pages, and AI integration. Leverage stakeholder interviews for peer institutions.
* **Output:** Annotated presentation / FIgma with comparative analysis and identified opportunities including a summary of features and functionality.
* **Date:** April 13 - May 1, 2026 (~3wks)
* **Resources**
  + [Collection Project 2026: Landscape Research](https://docs.google.com/document/d/1r2mVbBRB3kv5Ib562gICfsLsRoI8VvxwAU-ymX_CMrk/edit?tab=t.0#heading=h.bribn1zay0jr)
  + [2026 Collections Landscape Analysis](https://www.figma.com/design/2rq13EmNEdVDWx13Lwf7Dc/2026-Collections-Landscape-Analysis?node-id=2041-789&p=f&t=EQu5g6urJ3d0QJC1-0)

### High-Level Content Strategy Review – In Progress

* + **Owner:** Magnolia Molcan, FAMSF (Stephanie supporting)
  + **Goal:** Audit how collection content is currently structured and presented, define content requirements for Phase 1, and establish a content framework that can scale into the Phase 2 vision.
  + **Scope**: Collection landing page and department/sub-pages, object detail pages, Artfinder search and filters
  + **Output**:
    - Phase 1 Content Requirements
    - Phase 2 Content Vision Framework
  + **Date**: Mid April - May 2026 (tentative)
  + **Resources**
    - [Collection Project 2026: Content Audit + Strategy](https://docs.google.com/document/d/1gr3ys7k8rAQgw4fH_rPqDD2Hh7qpBEffKmicFV1F_S0/edit?tab=t.0#heading=h.6t145pd4kvov)