# Collection Project 2026 — Analytics Review

**Owner:** Stephanie Amaro, FAMSF
**Author:** Cogapp (data pulled by Luke Watson-Davies)
**Date pulled:** 2026-05-05
**Source:** Google Analytics 4, property `01. GA4 - FAMSF - Main View` (ID `252439170`)
**Tool:** `ga` CLI (`~/git/gtm-cli`)

## Goal

Understand how people currently use the collections website and how much traffic it sees on average. Output: data summary highlighting top user flows, search-term trends, device breakdown, and collection-page engagement.

## Scope

- Site-wide traffic baselines (5-day and 30-day)
- Device breakdown (mobile / desktop / tablet)
- Top user flows (landing pages, top pages, referrers, channels)
- On-site search term trends
- Funnel drop-off (view_item → add_to_cart → checkout → purchase)
- Deep-dive: art-finder + artwork detail pages

## Data windows

- **5-day sample:** 2026-04-06 to 2026-04-10 (week requested by Stephanie)
- **30-day window:** 2026-04-05 to 2026-05-04

---

## 1. Site-wide traffic baselines

### 5-day window (Apr 6–10)

| Metric | Total | Daily avg |
|--------|-------|-----------|
| Sessions | 80,942 | 16,188 |
| Active users | 63,206 | 12,641 |
| Pageviews | 250,655 | 50,131 |
| Avg session duration | — | ~178s (~3 min) |
| Engagement rate | — | 58.7% |

Peak: Fri Apr 10 (17,393 sessions). Low: Mon Apr 6 (14,280).

### 30-day window (Apr 5 – May 4)

| Metric | Total | Daily avg |
|--------|-------|-----------|
| Sessions | 452,381 | 15,079 |
| Active users | 321,960 | 10,732 |
| Pageviews | 1,421,094 | 47,370 |
| Avg session duration | — | ~195s (~3 min 15s) |
| Engagement rate | — | 56.5% |

Peak: Sat Apr 11 (19,212 sessions). Low: Mon May 4 (13,189 — 4% engagement, treat as data anomaly).

### 5d vs 30d delta

| Metric | 5d daily avg | 30d daily avg | Delta |
|--------|--------------|---------------|-------|
| Sessions | 16,188 | 15,079 | -7% |
| Users | 12,641 | 10,732 | -15% |
| Pageviews | 50,131 | 47,370 | -6% |
| Engagement rate | 58.7% | 56.5% | -2 pp |
| Mobile share | 55.8% | 57.3% | +1.5 pp |

Apr 6-10 was a slightly above-average week. Pattern stable across the month.

---

## 2. Device breakdown (30 days)

| Device | Sessions | % | Engagement |
|--------|----------|------|-----------|
| Mobile | 259,017 | 57.3% | 58.6% |
| Desktop | 182,072 | 40.2% | 53.7% |
| Tablet | 7,241 | 1.6% | 66.2% |
| Smart TV | 4,051 | 0.9% | 5.0% |

**Findings:**
- Mobile-first audience (57% of sessions)
- Mobile and desktop engagement near parity
- Tablet small but most engaged (66%)
- Smart TV traffic at 5% engagement is bot-likely; warrants Cloudflare audit

---

## 3. Top pages (30-day pageviews)

| Rank | Page | Pageviews | Users | Avg dwell (s) |
|------|------|-----------|-------|---------------|
| 1 | /events | 152,463 | 41,603 | 68 |
| 2 | /exhibitions/monet-venice | 146,719 | 85,632 | 101 |
| 3 | /events/{monet-venice-event} | 131,402 | 42,297 | 124 |
| 4 | /exhibitions | 87,951 | 30,765 | 105 |
| 5 | / (home) | 83,491 | 52,816 | 76 |
| 6 | /visit/de-young | 76,541 | 42,595 | 86 |
| 7 | /checkout/complete | 35,440 | 19,111 | 96 |
| 8 | /visit/legion-of-honor | 34,466 | 19,981 | 88 |
| 9 | /art-finder | 31,681 | 11,908 | 106 |
| 10 | /checkout | 26,418 | 20,819 | 93 |
| 11 | /exhibitions/etruscans-heart-ancient-italy | 21,328 | 11,168 | 119 |
| 12 | /membership | 19,882 | 8,554 | 93 |
| 13 | /calendar | 19,813 | 9,561 | 57 |
| 14 | /artworks/isabella-and-the-pot-of-basil | 11,587 | 2,376 | 2,542 (anomaly) |
| 15 | /exhibitions/past | 11,566 | 599 | 209 |
| 16 | /search | 10,723 | 2,906 | 148 |

**Findings:**
- Monet Venice exhibition is the dominant content engine (3 of top 4 pages)
- Art-finder is #9 by traffic but only 28.8% engagement — high bounce
- `/exhibitions/past` shows researcher / staff behaviour pattern (599 users, 209s dwell)
- `/artworks/isabella-and-the-pot-of-basil` 2,542s dwell is bot-likely on a single page

---

## 4. Top landing pages (30 days)

| Landing | Sessions | Engagement |
|---------|----------|------------|
| /exhibitions/monet-venice | 88,465 | 52% |
| / | 51,355 | 46% |
| /visit/de-young | 38,429 | 83% |
| (not set) | 23,135 | 5% (referrer leak) |
| /events/{monet-venice} | 16,453 | 92% |
| /visit/legion-of-honor | 15,541 | 84% |
| /exhibitions | 13,205 | 61% |
| /events | 11,341 | 84% |
| /events/late-night-2026 | 11,218 | 61% |
| /art-finder | 10,363 | **12%** |
| /exhibitions/etruscans-heart-ancient-italy | 9,611 | 60% |
| /index.php/art-finder | 3,812 | **5%** (legacy URL) |

**Findings:**
- Monet Venice landing dominates organic acquisition
- Art-finder lands ~10k SEO sessions/month but bounces 88%
- Legacy `/index.php/art-finder` URL still indexed, contributing 3,812 dead-traffic sessions — quick win to canonicalise / redirect

---

## 5. Channels (30 days)

| Channel | Sessions | Engagement |
|---------|----------|------------|
| Organic Search | 190,936 | 67.7% |
| Direct | 122,236 | 44.7% |
| Paid Search | 46,966 | 71.9% |
| Paid Social | 24,854 | 40.0% |
| Referral | 23,024 | 27.7% |
| Unassigned | 19,548 | 30.5% |
| Email | 17,003 | 71.4% |
| Cross-network | 10,174 | 47.3% |
| Display | 7,140 | 18.9% |
| Organic Social | 3,102 | 60.0% |

**Findings:**
- Organic search dominates (42% of all sessions, highest engagement after paid search)
- Paid Search highly engaged (72%) — efficient spend
- Referral / Display engagement low (28% / 19%) — quality concerns

---

## 6. Top referrers (sample)

| Referrer | Sessions |
|----------|----------|
| google.com | 192,692 |
| (direct/none) | 177,197 |
| ticketing.famsf.org/events | 41,418 |
| famsf.org/visit/de-young | 39,585 |
| famsf.org (home) | 27,120 |
| famsf.org/exhibitions/monet-venice | 23,536 |
| ticketing.famsf.org/checkout | 22,073 |
| na.network-auth.com | 14,888 (captive-portal/wifi auth — bot-like) |
| instagram.com | 8,710 |
| facebook.com | 5,675 |
| bing.com | 3,158 |
| duckduckgo.com | 2,571 |

Cross-property traffic with `ticketing.famsf.org` substantial — visitors flow between booking and main site.

---

## 7. On-site search

### Volumes (30 days)

| Event | Count |
|-------|-------|
| view_search_results | 21,781 |
| search_filter | 5,376 |
| search | 2,842 |
| search_audio_list | 61 |

### Top search terms (30 days)

**Artists:**
robert Arneson 413, Master of the Die 303, theodora varnay jones 299, rodin 288, William Seltzer Rice 226, thomas hart benton 211, percy gray 191, donald reitz 80, peter voulkos 54, Emily DuBois 51

**Exhibitions / themes:**
monet (variants combined ~500), textile 146, St. Cecilia 113, manga (variants ~250), bouquets to art 44, the etruscans 30+, monet and venice 26, the kiss 25

**Shop terms (asterisk = shop search):**
jojo* 260, mug* 140, poster* 137, magnet* 117, dress 112, jewelry* 96, postcards* 94, tote* 77

**Operational:**
login 54, parking 45, cafe 38, senior membership 31, member login 18

**Findings:**
- Artist names are the largest collection-search category — discovery is artist-led
- Shop terms are a major slice of on-site search — search functions partly as shop discovery
- Long tail is huge: 1,748 unique terms in 5 days, much larger over 30 days
- Accession-number queries (`2022.38.84a-b` etc) suggest power users, curators, or staff using public site as a research tool
- Operational queries (login, parking, cafe) suggest navigation gaps

---

## 8. Funnel (30 days)

| Step | Events | % from previous |
|------|--------|----------------|
| view_item | 172,854 | — |
| add_to_cart | 35,962 | 20.8% |
| begin_checkout | 10,962 | 30.5% |
| add_payment_info | 236 | 2.2% (broken tag) |
| purchase | 21,415 | — |

**Findings:**
- view_item → add_to_cart drops 79% (largest leak)
- add_to_cart → begin_checkout drops 70%
- `add_payment_info` event clearly mistagged (236 vs 21,415 purchases) — fix before quoting funnel externally
- Real cart abandonment moderate; biggest discovery-to-intent drop happens before cart

---

## 9. Art-finder + artwork pages (deep-dive)

### Pages

| Page | Pageviews (30d) | Users | Avg dwell |
|------|-----------------|-------|-----------|
| /art-finder | 31,681 | 11,908 | 106s |
| /artworks/isabella-and-the-pot-of-basil | 11,587 | 2,376 | 2,542s (anomaly) |
| /art/collections | 6,313 | 3,711 | 92s |

### Landing engagement

| Landing | Sessions | Engagement |
|---------|----------|------------|
| /art-finder | 10,363 | 12.0% |
| /index.php/art-finder | 3,812 | 5.0% |
| /artworks/isabella-and-the-pot-of-basil | 3,036 | 55.8% |

Combined ~14,175 sessions land on art-finder URL. 88-95% bounce.

### Filter usage (`art_finder_filter` event = 25,399 fires)

**"What" classification:** top values 65 (1,139), 3 (311), 66 (148), 73 (57), 69 (48). 61 distinct values incl. multi-select combos.

**"Who" (artist):** 1,252 distinct artist IDs queried. Top: 167 (49), 87 (38), 1033 (37), 38 (30), 599 (30).

**"When" (era):**
| Era | Count |
|-----|-------|
| 1800-1900 | 858 |
| 1900 | 692 |
| 1600-1800 | 529 |
| 1400-1600 | 242 |
| 500-1000 | 231 |
| 1000-1400 | 210 |
| -1000_1 | 206 |
| -8000_-2000 | 198 |
| 1_500 | 195 |
| -2000_-1000 | 193 |

**"Collection":**
| Collection | Standalone count |
|------------|-----------------|
| European Paintings | 557 |
| Ancient Art | 433 |
| Arts of Africa, Oceania, Americas | 179 |
| American + European Paintings (combo) | 171 |
| American Paintings | 155 |
| Achenbach (Graphic Arts) | 123 |
| European Decorative Arts | 81 |
| Costume & Textile Arts | 59 |
| Contemporary Art | 35 |

### Top artworks viewed (30 days, `view_item` custom dim)

| Rank | Artwork | Artist | Views |
|------|---------|--------|-------|
| 1 | Water Lilies | Monet | 930 |
| 2 | Woman Bathing (La Toilette) | Cassatt | 453 |
| 3 | Eiffel Tower | Seurat | 397 |
| 4 | Portrait of Bianca degli Utili Maselli | Fontana | 380 |
| 5 | The Bath | Gérôme | 377 |
| 6 | The Russian Bride's Attire | Makovsky | 330 |
| 7 | Saint Francis Venerating the Crucifix | El Greco | 288 |
| 8 | Portrait of Anne, Viscountess Townsend | Reynolds | 172 |
| 9 | The Tribute Money | Rubens | 171 |
| 10 | Venice, Grand Canal looking East | Canaletto | 166 |

**Top artists (30 days):** Monet 930, Cassatt 453, Seurat 397, Fontana 380, Gérôme 377, Makovsky 330, El Greco 288, Egyptian (anon) 216, Pierre Gole 208, Reynolds 172, Rubens 171.

### Findings

1. Art-finder is a high-traffic, high-bounce SEO landing zone. ~10k sessions/month, 88% bounce.
2. Filter UI is rarely engaged on entry — most landings don't filter. But engaged users filter deeply (1,252 distinct artist IDs queried).
3. Artwork pages are an SEO long tail. 172k view_item events, top 10 artworks = ~2% of total volume.
4. Most artwork views arrive directly from organic search rather than via the art-finder browsing interface.
5. Top-viewed artworks track current exhibitions: Monet exhibition pulls Water Lilies to #1, Etruscans exhibition pulls aquamanile and ancient pieces up.
6. Period preference: 19th century, 1900-onwards lead. Pre-history (BCE eras) consistently engaged.
7. Collection preference: European Paintings 1.3× Ancient Art; Africa/Oceania/Americas distant third.
8. Legacy `/index.php/art-finder` URL leaks 3,812 sessions/month at 5% engagement.

---

## 10. Audio tour engagement (collection-relevant)

| Event | 30d count | Per-user |
|-------|-----------|---------|
| audio_progress | 2,417 | 11.1 |
| impression_audio_start | 2,577 | 1.8 |
| impression_transcript | 2,412 | 1.8 |
| audio_start | 456 | 2.0 |
| click_transcript | 201 | 2.3 |
| audio_finish | 165 | 1.5 |

Engaged users go deep (11 progress events per listener) but funnel narrow — small audience, high engagement.

---

## 11. Data quality flags

- May 4: 4% engagement — collection anomaly that day
- Apr 22-24: 230-427s session durations — bot-run candidate
- `/artworks/isabella-and-the-pot-of-basil` 2,542s dwell on small user base — single-page bot/scraper
- Smart TV: 4,051 sessions, 5% engagement — bot
- `(not set)` landing: 23,135 sessions, 5% engagement — referrer/redirect leak
- `/index.php/art-finder`: 3,812 sessions — legacy URL still indexed
- `add_payment_info`: consistently undertagged (236 vs 21,415 purchases)
- `na.network-auth.com` referrer: 14,888 captive-portal/wifi auth bot hits

---

## 12. Recommendations

1. **Stable baseline:** ~15k sessions/day, mobile-led (57%). Monet exhibition is current content engine.
2. **Art-finder UX:** 88% bounce on landing. Investigate filter discoverability, intro state, and SEO landing intent. Most arrivals are looking for a specific artwork found via search, not browsing.
3. **On-site search split:** Track shop vs collection separately. Current search analytics conflate retail discovery with collection research.
4. **Long-tail artwork SEO is the pattern.** 172k view_item, top 10 = 2%. Architecture should privilege deep-link entry over carousel browsing.
5. **Artist-led discovery:** 1,252 distinct artist IDs queried via filters; artist names dominate search-term list. Strong artist-page surface needed.
6. **Quick wins:**
   - Fix `add_payment_info` GTM tag
   - Redirect / canonicalise `/index.php/art-finder`
   - Audit Cloudflare for Smart TV / Apr 22-24 bot pattern before requoting numbers
   - Resolve `(not set)` landing referrer leak
7. **Power-user signal:** Accession-number searches indicate curatorial / research use. Worth interviewing this segment.
8. **Cross-property flow:** Heavy cross-traffic with `ticketing.famsf.org` — site is part of a multi-domain journey. Funnel and attribution should account for both domains.

---

## Appendix: queries used

```sh
# Property
ga ga4 properties

# Traffic + engagement
ga ga4 report -p 252439170 -d date -m sessions,activeUsers,screenPageViews,averageSessionDuration,engagementRate --start 30daysAgo --end yesterday

# Device
ga ga4 report -p 252439170 -d deviceCategory -m sessions,activeUsers,screenPageViews,engagementRate --start 30daysAgo --end yesterday

# Top pages
ga ga4 report -p 252439170 -d pagePath -m screenPageViews,activeUsers,averageSessionDuration --start 30daysAgo --end yesterday --limit 30

# Landing pages
ga ga4 report -p 252439170 -d landingPage -m sessions,engagementRate --start 30daysAgo --end yesterday --limit 20

# Channels
ga ga4 report -p 252439170 -d sessionDefaultChannelGroup -m sessions,engagementRate --start 30daysAgo --end yesterday

# Search terms
ga ga4 report -p 252439170 -d searchTerm -m eventCount --start 30daysAgo --end yesterday --limit 60

# Events / funnel
ga ga4 report -p 252439170 -d eventName -m eventCount,eventCountPerUser --start 30daysAgo --end yesterday --limit 40

# Art-finder filter custom dimensions
ga ga4 report -p 252439170 -d customEvent:artfinder_filter_what -m eventCount --start 30daysAgo --end yesterday
ga ga4 report -p 252439170 -d customEvent:artfinder_filter_who -m eventCount --start 30daysAgo --end yesterday
ga ga4 report -p 252439170 -d customEvent:artfinder_filter_collection,customEvent:artfinder_filter_when -m eventCount --start 30daysAgo --end yesterday

# Artwork detail custom dimensions
ga ga4 report -p 252439170 -d customEvent:artwork_artist -m eventCount --start 30daysAgo --end yesterday --limit 40
ga ga4 report -p 252439170 -d customEvent:artwork_title -m eventCount --start 30daysAgo --end yesterday --limit 40
```
