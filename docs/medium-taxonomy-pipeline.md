# Medium taxonomy pipeline: from raw TMS to the 12-Tier-1 facet

**What this documents.** Every stage the FAMSF `Objects.Medium` data passes
through to become the **"12-Tier-1 full map"** tab in the Medium audit workbook
(`14h4f-ZGnjjbBS6svQjRbdVjBKe7DBv9MifPLWy79FkI`), which is the source of the
material-axis medium facet. For each stage: **what** it produces, **how** it
does it, and **why** the step exists.

The high-level shape: a raw TMS free-text field is noisy, so we (1) split it into
atomic tokens, (2) normalise and de-duplicate those tokens, (3) map every token
to a curator-approved material group, and (4) present the result for curator
triage. No token is ever dropped silently: everything lands somewhere, and every
mapping records how it was decided so a reviewer can trust or challenge it.

```
TMS Objects.Medium (free text)
  └─ 1. Split on hard delimiters ─────────────▶ raw_mediums_v2 / medium_tokens.tsv
       └─ 2. Canonicalise + dedupe ───────────▶ tokens_v2 / grouped_canonical_v2
            └─ 3. Facet-decide (rule/AAT/LLM) ─▶ master_v2
                 └─ 3b. Token cleanup ─────────▶ master_v2 (cleaned)
                      └─ 4. Tier-1 classify ───▶ 12-Tier-1 full map
```

---

## The source: `Objects.Medium` in TMS

**What.** A single free-text field per object. It is *not* a controlled
vocabulary. A value can be one clean term (`etching`), a compound recipe
(`gelatin silver print`, `oil on canvas`), a comma-list (`etching, drypoint`),
or a paragraph describing a whole garment or artist's book
(`coat: silk satin weave with … ; and fox fur cuffs dress: synthetic double
knit; …`, 300+ words).

**Why it matters.** The facet has to be *one clickable term per concept*.
Free text can't be faceted directly, so the whole pipeline is about turning this
messy field into a finite, controlled set of tags without losing signal.

Two scoping facts:
- We work over the **web-visible** object scope (~150K objects), not all 306K.
- The verbatim string is kept untouched for object-page **display**
  (`medium_strings.tsv`); the pipeline below only builds the **facet** side.

---

## Stage 1 — Split into tokens (hard delimiters only)

**What.** `probe_medium_full_list.py` (in `collection-flow-famsf-real`) reads
every distinct `Objects.Medium` value and emits `medium_tokens.tsv`: one row per
distinct **token** with a true per-object count. This is the token universe that
seeds `raw_mediums_v2`.

**How.** In SQL: normalise every hard delimiter (`,` `;` `/` `|` newline) to a
single `;`, then `STRING_SPLIT` on `;`. Counting is `COUNT(DISTINCT ObjectID)`
per token, so an object is counted once per distinct token it carries.

**Why hard delimiters only.** Connective words (`and` / `with` / `on`) are
**deliberately not** split points. `oil on canvas` is one medium concept and must
stay one token; `etching, drypoint` is genuinely two and splits. Splitting on
"and"/"on" would shatter real compound terms (`gelatin silver print`,
`black ink on paper`) into meaningless fragments.

> **Known limitation carried forward.** A separate upstream LLM noun-phrase
> extraction (visible as `raw_mediums_v2.suggested_split`) was used to break the
> *paragraph-length* garment/book descriptions into candidate phrases. That
> extractor grabbed each phrase together with its leading article/connective,
> which is where orphan tokens like `a drawing`, `the spine`, `in color`,
> `and crochet lace`, and structured `a) gold tray` residue came from. Stage 3b
> below cleans these up.

---

## Stage 2 — Canonicalise and de-duplicate

**What.** Two tabs:
- `tokens_v2` (`token, count, facet, canonical`) — each token tagged
  material vs technique and pointed at a canonical form.
- `grouped_canonical_v2` (`canonical, facet, total_count, source_token_n,
  source_tokens`) — the many-to-one rollup: every surface variant that means the
  same thing collapsed onto one canonical term, with the full variant list kept
  for audit.

**How.** Surface variants are folded onto a canonical head. For example
`etching` absorbs `etchings`, `color etching`, `hand-colored etching`,
`6 etchings`, `étching`, … (86 variants → one canonical `etching`,
23,108 objects). Done with normalisation rules plus fuzzy/embedding grouping.

**Why.** TMS spelling, pluralisation, quantity prefixes ("6 etchings"), and
accent noise mean the same concept appears under dozens of surface strings.
Faceting on raw tokens would scatter one concept across many low-count filter
options. Canonicalisation makes each concept a single, correctly-counted term.

---

## Stage 3 — Decide each token's facet (`master_v2`)

**What.** `master_v2` is the authoritative per-token table
(`token, count, facet_final, facet_source, canonical_final, aat_id,
embedding_suggestion, embedding_similarity, note`), ~17K rows — the full medium
vocabulary with a decided material/technique facet for each.

**How.** A layered decision, most-trusted first (`facet_source` records which
layer won):
1. **rule** — curated keyword rules.
2. **aat** — join to the Getty AAT authority (material vs technique read from the
   concept's facet anchor; supplies a clean label for the long tail).
3. **embedding / LLM** — for the residual tail, an embedding-similarity
   suggestion (`embedding_match`, `llm_shaky_band_v2`) proposes a facet; the
   `note` / similarity columns flag the shaky ones for review.

**Why.** No single method covers 17K tokens. Curated rules are precise but only
reach the head; AAT is authoritative but doesn't contain every FAMSF surface
term; embeddings/LLM reach the long tail but need human review. Layering gets
total coverage while keeping the confident and the uncertain distinguishable.

### Stage 3b — Token cleanup (`clean_master_v2_tokens.py`)

**What.** A normalisation pass over the `master_v2` **token** column that strips
the Stage-1 LLM-split artefacts and merges the counts back into the real token.

**How** (`scripts/clean_master_v2_tokens.py`):
- Strip a leading determiner/connective run (`a` / `an` / `the` / `and` / `or` /
  `with` / `on` / `in` / …): `a drawing` → `drawing`, `in color` → `color`,
  `and crochet lace` → `crochet lace`.
- Strip structured multipart-object enumerators (`a)` `b.` `a&b)` `a-c)`):
  `a) gold tray` → `gold tray`. The paren/period form only — a bare `c-` is left
  alone so **`c-print photograph`** (a real photographic term) survives.
- Strip a dangling trailing connective: `color woodcut triptych with` →
  `color woodcut triptych`.
- **Merge** rows that clean to the same token: sum the object counts, and keep
  the mapping columns from the highest-count contributor (a bare `drawing` row
  outweighs `a drawing`).

Idempotent (a second run is a no-op) and non-destructive to real terms.
Run: `uv run --with-editable ~/git/cogapp-sheets python
scripts/clean_master_v2_tokens.py --apply`.

**Why.** These orphan fragments weren't real mediums, but the Stage-4 keyword
classifier would match a substring inside them (`silver` inside `a) silver`,
`drawing` inside `a drawing`) and mis-file them as genuine tags. Because most
orphans, once the determiner is stripped, collapse onto a token that already
exists, merging folds their counts back into the correct term rather than losing
them. Result: 418 tokens rewritten, 156 merged away, **zero** orphan-prefixed
tokens left, and the client-reported cases (`and crochet lace`, `a drawing`)
are gone while composites are untouched.

---

## Stage 4 — Classify into the 12 Tier-1 material groups

**What.** `push_tier1_full_coverage_sheet.py` reads the cleaned `master_v2` and
writes the **"12-Tier-1 full map"** tab: one row per token, sorted by object
count, columns `TMS term · Objects · Tier 1 · Tier 2 · Tier 3 · Source ·
Review priority · Suppress? · Approve? · Cleanup note`. This is the deliverable
the curators triage.

**How** (`scripts/material_taxonomy/tier1_classifier.py`, `Tier1Classifier`).
Every token resolves to exactly **one** Tier-1/2/3 path, first rule wins. Each
row's **Source** records the rule that fired, and **Review priority** (a
plain-language triage cue derived from Source) tells curators where to spend
effort:

| Order | Source | Review priority | Rule |
|---|---|---|---|
| 1 | `curated` | Approved | Exact match on a curator-mapped term (the ~280-row head map). |
| 2 | `override` | Approved | High-priority composite rules that **must beat the greedy keyword pass**: photographic prints → Prints (not Metal via "silver"), metalpoint → Ink & drawing media, and a paper-stock guard → Paper (not Paint/Textiles via a colour/fibre word). |
| 3 | `not_medium` | Review | Own upstream flag says not-a-medium → parked in **Other**, Suppress? suggested. Runs **before** keyword so a descriptive non-medium isn't grabbed by an incidental material word. |
| 4 | `keyword` | Check | A word **derived from the curated leaves** matches inside the token (`etching` → Prints; `silk` → Textiles). |
| 5 | `supplementary` | Review | Matches a hand-picked root the curated leaves miss (`paper`, `canvas`, `photo`, `glass`, `hand coloring`) **or** a technique-gap keyword (`burin`, `gilding`, `hardground`, `weft patterning`, …). |
| — | `unresolved` | Review | No signal → **Other**, empty Tier-2/3. |

The `override` and `not_medium`-before-keyword steps were added 2026-07-07 to fix
the greedy-keyword misclassifications documented below.

The 12 Tier-1 groups are the curators' **material-axis** re-org (2026-07-03):
Prints · Ink & drawing media · Paint & pigment · Paper & parchment · Textiles &
fiber · Ceramic · Glass · Stone · Metal · Organic · Inorganic · Other. Only
"Prints" is a process bucket; the other 11 are substance buckets. Object-type
(Print / Drawing / Painting) keeps its own separate facet (`classification`).

Keyword tables are derived from the curated sheet at load time, so editing the
curated map re-derives them — one place to maintain the vocabulary.

**Why "Review priority", not a confidence score.** The earlier version of this
tab carried a numeric `Confidence` (0.0–1.0), which read as a computed
probability but was really just a relabelling of `Source`. It confused reviewers
(is 0.6 "60% sure"? is 0.5 worse?). It is now a plain-language **Review priority**
(`Approved` / `Check` / `Review`) derived from Source: it tells curators *where to
spend effort*, not a false-precision strength. `Approved` rows (curated +
override) are trusted; `Review` rows near the top (high object count) are where
the work goes. The classifier still tracks an internal `confidence` float for
its own logic; it is not surfaced on the sheet.

**Why one tag per token, in Other last.** Faceting needs a deterministic single
home per term, and total coverage — every token lands somewhere so no object
falls out of the facet. `not_medium` and `unresolved` tokens are **suggested**
for suppression, not auto-dropped: the curator decides per token (a real medium
mis-flagged upstream can be rescued).

**Current coverage** (post-cleanup + fixes): curated 65% + override 5% + keyword
13% + supplementary 6% ≈ **89% of object mentions by signal**; ~8% unresolved +
~3% not_medium land in Other for per-token curator review.

---

## Issues found and fixed (2026-07-07)

An analysis pass over the cleaned tab (16,996 tokens, 212,527 object-mentions)
surfaced six issue classes, all sharing ONE root cause: the greedy
derived-keyword pass ran before the more-specific composite rules, so an
*incidental* word inside a token (image-forming silver, a colour, a paper-finish
name) grabbed it before the token's *actual* substance was seen. All were
domain-expert verified and all are now **fixed** (the `override` step + the
`not_medium`-before-keyword reorder + technique-vocab additions in
`tier1_classifier.py`). Ranked by object impact; before → after object counts.

1. **Photographic prints → Metal / Glass (biggest).** `gelatin silver print`,
   `albumen silver print`, `silver gelatin print` were landing in **Metal/Silver**
   (keyword `silver` fired first); `albumen silver print from
   wet-collodion-on-glass negative` in **Glass** (the *negative's* glass). These
   are photographic prints **on paper** → **Prints**.
   **Fixed:** `PHOTO_PRINT_KEYWORDS` override runs before keyword.
   Metal/Glass photo-prints **128 tokens / ~3,640 objs → 1 / 5**; Prints gained
   ~3,685 objs. `daguerreotype` → **Metal** deliberately kept (it genuinely is a
   silver-on-copper plate, not a paper print).

2. **Named paper stocks pulled out of Paper.** Colour-in-name → **Paint** (`green
   paper`, `hand-made paper by barcham green` — Barcham Green is a papermaking
   firm, not a pigment); fibre-in-name → **Textiles** (`somerset satin paper`,
   `montgolfier linen paper`, `rayon paper` — satin/chiffon/linen here are paper
   finishes).
   **Fixed:** paper-stock guard (`_is_paper_stock`) resolves any token naming a
   paper stock to **Paper & parchment**, *unless* a support preposition is present
   (`graphite on paper` stays the medium — the paper is the substrate). Wrongly-
   filed paper tokens **~140 → 0**.

3. **Silverpoint / metalpoint → Metal or Other.** A **drawing** technique (metal
   stylus on prepared ground) → **Ink & drawing media**.
   **Fixed:** `METALPOINT_KEYWORDS` override. `silverpoint`, `goldpoint`,
   `metalpoint`, `aluminum metalpoint` now Ink & drawing media/Metalpoint. (`silver
   gros point`, a lace stitch, correctly stays Metal — not a false catch.)

4. **Real techniques stuck in Other / unresolved (~8,100 objs, vocab gap).**
   Genuine techniques the keyword vocab didn't cover.
   **Fixed:** `TECHNIQUE_KEYWORDS` added to the supplementary pass — `burin`,
   `burnishing`, `scraping` → Prints/Mezzotint-Engraving; `hardground`/`softground`
   → Prints/Etching; `gilding`/`gilt`/`gold leaf` → Metal; `polychrome` → Paint;
   `supplementary weft patterning` → Textiles/Weaving; `offset print`, `oban
   print` → Prints; `incised` → Ink & drawing media. (Colours — `black`, `red`,
   `white`, `blue` — correctly still unresolved.) Some may ultimately belong to a
   separate Technique facet.

5. **not_medium bypassed by keyword.** A token whose own upstream `facet_final`
   was `not_medium` could still be grabbed by the keyword pass (e.g. `hand painted
   border in a portfolio…` → Paint via "painted").
   **Fixed:** the own-token `not_medium` check now runs *before* the keyword pass.

6. **Multi-material tokens (~240 objs) — not fixable, note only.** A token naming
   two+ substances (`gold silk`, `iron wood`, `ivory silk satin`) can only carry
   one Tier-1 tag. Head-noun selection (silk → Textiles) is the defensible choice.
   `iron wood` is a wood species (Organic), not iron + wood — lands correctly by
   luck. Left as-is; a single-value facet can't represent it.

**Confirmed non-issues** (detector flagged, verified correct, left unchanged):
substance-with-a-process-verb (`carved wood` → Organic, `cast bronze` → Metal,
`glazed earthenware` → Ceramic) correctly keeps the substance and drops the verb
— right, because Tier-1 is a **material** axis. Object-type / process lives in the
separate `classification` facet.

**Coverage after the fixes:** curated 65% + override 5% + keyword 13% +
supplementary 6% ≈ **89% of object mentions by signal**; ~8% unresolved + ~3%
not_medium in Other for per-token curator review. Distribution shift: Prints
+~4,650 objs, Metal −~3,476, Paper +~800, Other −~1,800.

---

## Scripts + tabs reference

| Stage | Script | Output tab / file |
|---|---|---|
| 1 | `collection-flow-famsf-real/scripts/probe_medium_full_list.py` | `medium_tokens.tsv`, `raw_mediums_v2` |
| 2 | (upstream canonicalisation) | `tokens_v2`, `grouped_canonical_v2` |
| 3 | (upstream rule/AAT/embedding decide) | `master_v2`, `aat_match`, `embedding_match`, `llm_shaky_band_v2` |
| 3b | `scripts/clean_master_v2_tokens.py` | `master_v2` (cleaned in place) |
| 4 | `scripts/push_tier1_full_coverage_sheet.py` + `scripts/material_taxonomy/tier1_classifier.py` | **`12-Tier-1 full map`** |

The curated head map (Stage 4's authoritative overrides) is pushed by
`scripts/push_tier1_medium_map_sheet.py` → the **`12-Tier-1 medium map`** tab,
sourced from the curators' `.xlsx`. See the object-type companion in
`docs/material-medium-taxonomy.md`.
