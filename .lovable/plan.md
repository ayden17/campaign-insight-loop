

## Refactor CoreSignal Integration: Dynamic Variables + Hydration Cards

### Problem
- Search payload has hardcoded job posting titles ("marketing", "advertising")
- POST returns only IDs but the table shows empty columns (no hydration)
- All results rendered in a flat table instead of rich cards
- No batched hydration to conserve API credits

### Plan

#### 1. Update Edge Function (`supabase/functions/coresignal-search/index.ts`)
- Accept new optional params: `jobTitles` (string array, default `["marketing","advertising"]`) and make the nested job_postings clause dynamic from those
- Ensure `targetRevenue` and `growthThreshold` are cast to `Number()` server-side to prevent string-based 500s
- Add a new action `"collect_batch"` that accepts `companyIds: number[]` (max 10), loops through them sequentially calling the collect endpoint, and returns an array of enriched results -- this avoids multiple round-trips from the frontend

#### 2. Update `handleSearch` in `LeadSearch.tsx`
- Extract revenue from `financialFilters` -- look for "Income Range" or "Net Worth" custom filters, parse numeric value, pass as `targetRevenue`; fallback to 1000000
- Pass `intentFilters.keywords` as the industry/userIntent (already done, just confirm no hardcoded strings)
- After receiving IDs from POST, immediately call the new `collect_batch` action with the first 10 IDs
- Store hydrated results separately (e.g. `hydratedCompanies: CompanyResult[]`) and raw IDs for the rest

#### 3. Replace table with card-based results UI
- **Hydrated cards (first 10)**: Display as rich cards in a responsive grid showing:
  - `company_logo_url` (fallback to Building2 icon)
  - `company_name`
  - `description_enriched` (truncated to 2 lines)
  - `industry` badge
  - `website` and `linkedin_url` links
  - `employees_count` and `size_range`
- **Locked cards (remaining)**: Show company ID with a lock icon and "Generate to unlock" message; after clicking "Generate Audience", these stay locked but the audience is saved
- Keep the "Top Match" preview card at the top using the first hydrated result (remove the separate `enrichCompany` call)

#### 4. Update CSV export
- Include hydrated fields (`company_name`, `website`, `industry`, `description_enriched`) for the first 10; ID-only rows for the rest

### Technical Details

**Edge function changes** -- new `collect_batch` action:
```text
action: "collect_batch"
companyIds: [1846581, 1934591, ...]  // max 10
-> Sequential fetch loop, returns array of full company objects
```

**Revenue extraction logic**: Parse `financialFilters.customFilters` for fields like "Income Range" or "Net Worth", extract numeric portion, pass as `targetRevenue`. If none set, default to 1000000.

**Card grid layout**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` for hydrated results, simpler locked-state cards below.

**Files to modify**:
- `supabase/functions/coresignal-search/index.ts` -- add `collect_batch`, make job titles dynamic, cast numerics
- `src/pages/LeadSearch.tsx` -- new hydration flow, card UI, revenue extraction
- Redeploy edge function

