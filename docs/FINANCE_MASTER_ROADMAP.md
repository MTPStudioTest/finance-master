# Finance Master Product & Engineering Roadmap

_Last updated: 2026-06-04_  
_Target repository file: `docs/FINANCE_MASTER_ROADMAP.md` or `ROADMAP.md`_

## 0. Purpose of this roadmap

This roadmap is the canonical working document for the coding agent. It defines what Finance Master is supposed to become, how the product should be structured, what needs to be fixed first, and in which order implementation should happen.

The main goal is not to add more features randomly. The main goal is to consolidate the app into a clear, trustworthy, local-first finance operating system for a freelancer, creative entrepreneur, or small studio.

Testing rounds are expensive, so the agent should work in larger, well-reasoned implementation passes and minimize back-and-forth. Before changing code, the agent must inspect the current implementation deeply, map existing data models, and avoid duplicating features that already exist.

---

# 1. Product vision

Finance Master is a local-first treasury and money operating system.

It is not meant to feel like classic bookkeeping software. It should help the user understand:

- How much money is actually safe to use.
- Which money is protected for obligations, reserves, tax, or debt.
- Which incoming money is expected but not yet real.
- Which obligations create pressure soon.
- How long the current financial runway lasts.
- Which financial decision is safe, risky, or not yet possible.
- Which data needs review before the financial picture can be trusted.

The app should reduce anxiety and decision fatigue. It should not become a complicated accounting dashboard.

The product should answer five daily questions:

1. What is my current money condition?
2. What is safe to spend?
3. What must happen next?
4. What risk or opportunity is emerging?
5. Are the numbers still true?

---

# 2. Current board rename recommendation

The current board names are elegant, but several are too abstract for a practical finance tool. The user is reconsidering them and wants more descriptive names.

## Recommended final navigation

Use a more descriptive structure while keeping some character.

### 1. Money Status
Current name: `Pulse`

Purpose:
The daily starting point. Shows current condition, Safe-to-Spend, runway, next incoming money, next obligations, and the suggested next move.

Why rename:
“Pulse” is nice but slightly abstract. “Money Status” is immediately understandable.

Alternative names:
- Today
- Money Cockpit
- Current Picture
- Treasury Status

Recommended: `Money Status`

---

### 2. Decision Lab
Current name: `Decisions`

Purpose:
A practical decision simulator. Helps answer: “Can I do this?” or “What happens if I change this?”

Why rename:
“Decisions” is okay, but the current board should become more explicitly interactive and scenario-based.

Alternative names:
- Decision Lab
- Decision Simulator
- What-If Lab
- Safe Decision

Recommended: `Decision Lab`

---

### 3. Cash Timeline
Current name: `Flow`

Purpose:
Timeline and forecast view for upcoming income, obligations, payment plans, expected low points, and projected runway.

Why rename:
“Flow” is beautiful but abstract. “Cash Timeline” is clearer.

Alternative names:
- Cash Flow
- Cash Timeline
- Money Timeline
- Forecast Timeline

Recommended: `Cash Timeline`

---

### 4. Money Plan
Current name: `Plan`

Purpose:
The structural financial model: cash accounts, protected money, recurring costs, reserve buckets, debt plans, payment plan rules, baseline costs, and project cash.

Why rename:
“Plan” is acceptable but broad. “Money Plan” communicates the domain clearly.

Alternative names:
- Money Plan
- Financial Structure
- Treasury Plan
- Operating Plan

Recommended: `Money Plan`

---

### 5. Risk Radar
Current name: `Radar`

Purpose:
Early warning and opportunity system for reserve coverage, liquidity risk, debt pressure, income concentration, tax exposure, cashflow rhythm, and missing data.

Why rename:
“Radar” is strong but “Risk Radar” is more descriptive.

Alternative names:
- Risk Radar
- Money Radar
- Signals
- Early Warnings

Recommended: `Risk Radar`

---

### 6. Reality Check
Current name: `Review`

Purpose:
A lightweight maintenance loop to confirm whether the financial picture is still true. It should not feel like homework or accounting month close.

Why rename:
“Review” sounds procedural and generic. “Reality Check” is clearer and more human.

Alternative names:
- Reality Check
- Weekly Check
- Money Check
- Trust Check

Recommended: `Reality Check`

---

### 7. Records
Current name: `Logbook`

Purpose:
Raw transaction utility for imports, local records, matching, cleanup, evidence, and detailed inspection.

Why rename:
“Logbook” is poetic but can sound like a journal. “Records” is clear and still not as cold as “Transactions.”

Alternative names:
- Records
- Money Records
- Ledger
- Transaction Records

Recommended: `Records`

---

### 8. Settings
Current name: `Settings`

Purpose:
App-level preferences, backups, local data, imports, sample data, display, and privacy.

Recommendation:
Keep `Settings`.

---

## Final recommended nav order

1. Money Status
2. Decision Lab
3. Cash Timeline
4. Money Plan
5. Risk Radar
6. Reality Check
7. Records
8. Settings

Do not implement the rename blindly before checking route names, component names, local storage keys, tests, documentation, and navigation references. The visible labels can be renamed first while keeping internal route IDs stable if necessary.

---

# 3. Product architecture principles

## 3.1 Each board must have one job

No board should become a general dumping ground.

### Money Status
Job:
Show the current money condition and the one most useful next move.

Should answer:
- Am I safe, tight, fragile, or stormy?
- How much is safe to spend?
- How much actual cash exists?
- What is the next incoming money?
- What obligations are coming soon?
- What should I do next?

Should not become:
- A full planning page.
- A logbook.
- A detailed forecast simulator.
- A month-end workflow.

---

### Decision Lab
Job:
Simulate and support specific financial decisions.

Should answer:
- Can I spend this amount?
- Can I pause this payment?
- Can I accept this project?
- What happens if income arrives late?
- What happens if I increase/decrease obligations?

Should not become:
- A passive dashboard.
- A duplicate of Risk Radar.
- A second Money Status page.

---

### Cash Timeline
Job:
Show how money changes over time.

Should answer:
- What comes in?
- What goes out?
- When does cash get low?
- Which time window is risky?
- How do confirmed vs expected events change the forecast?

Should not become:
- A data-entry-heavy accounting screen.
- A duplicate of Records.
- A structural configuration page.

---

### Money Plan
Job:
Maintain the financial structure behind all calculations.

Should answer:
- Which accounts exist?
- Which money is protected?
- Which costs are recurring?
- Which debt plans exist?
- Which payment plans affect monthly burn?
- Which reserves exist and how much is still needed?

Should not become:
- A daily status page.
- A decision simulator.
- A raw transaction log.

---

### Risk Radar
Job:
Detect risks, missing data, weak patterns, and opportunities.

Should answer:
- What deserves attention before it becomes a problem?
- Which assumptions are weak?
- Which patterns are locked because not enough data exists?
- Which risk is most important right now?
- Which opportunity could improve runway?

Should not become:
- A list of generic insights.
- A duplicate of Money Status.
- A static report.

---

### Reality Check
Job:
Confirm that the current picture still reflects reality.

Should answer:
- Are cash accounts current?
- Are obligations correct?
- Are expected incomes still reliable?
- Are there unmatched records?
- Is a checkpoint worth saving?

Should not become:
- Mandatory month close.
- A heavy accounting workflow.
- A second Records page.

---

### Records
Job:
Handle raw data, transactions, imports, matching, cleanup, and evidence.

Should answer:
- What records exist?
- Which records are matched?
- Which records need review?
- Which imports happened?
- Which payments link to obligations or expected income?

Should not become:
- The main user dashboard.
- A planning page.
- A decision page.

---

### Settings
Job:
Configure app-level behavior only.

Should answer:
- What is the base currency?
- What is the forecast horizon?
- How do backup/import/export work?
- What is the current local data health?
- Which visual mode is active?
- Is reduced motion enabled?

Should not include:
- Cash account editing.
- Debt details.
- Recurring cost editing.
- Reserve allocation.
- Scenario input.
- Financial data management that belongs in product boards.

---

# 4. Global UX and design rules

## 4.1 Information hierarchy

Every board must follow this hierarchy:

1. Board title and one-sentence purpose.
2. Primary status or main insight.
3. Most important next action.
4. Supporting metrics.
5. Detailed lists.
6. Secondary utilities.

Do not place educational/explanatory content above operational content unless the user is onboarding for the first time.

---

## 4.2 One primary action per section

Every major section may have only one primary action.

Examples:
- Money Status: `Update Money Picture` or `Open Reality Check`
- Decision Lab: `Create Decision`
- Cash Timeline: `Edit Forecast Inputs`
- Money Plan: `Add Financial Item`
- Risk Radar: `Review Main Risk`
- Reality Check: `Save Checkpoint`
- Records: `Add Record` or `Import CSV`
- Settings: no single dominant action unless backup is needed

Avoid multiple equal-looking buttons in the same card.

---

## 4.3 Global plus button

Current issue:
The large plus button appears on every board, but its meaning is unclear.

Decision:
The plus button must either become a global `Quick Add` menu or be replaced by board-specific labelled actions.

Recommended implementation:
Keep the plus button only if it opens a consistent Quick Add menu.

Quick Add menu options:
- Add cash account
- Add income
- Add obligation
- Add recurring cost
- Add debt/payment plan
- Add reserve bucket
- Add transaction/record
- Add decision scenario

The menu may preselect the most relevant item depending on the current board, but the behavior must remain predictable.

If this is too much for the current phase:
Remove or hide the global plus button and use explicit labelled buttons per board.

---

## 4.4 Info pattern

Use one global information pattern.

Every complex widget may have a small `?` icon in the top-right corner.

Clicking the icon opens a lightweight popover or info card with:

- What this metric means.
- Which data sources feed it.
- What does not count.
- What missing data could make it inaccurate.
- Where the user can edit the relevant data.

Avoid repeated “How calculated” dropdowns inside widgets.

Do not show long formulas by default. Keep formulas available in info popovers only.

---

## 4.5 Card types

Introduce clear visual and structural variants.

### Hero Card
Use for the primary status on a board.
Examples:
- Safe-to-Spend
- Decision status
- Flow forecast status
- Radar status
- Reality Check status

### Data Card
Use for metrics.
Examples:
- Current Cash
- Runway
- Monthly Burn
- Protected Cash

### Action Card
Use for recommended next move.
Examples:
- Suggested next move
- Save checkpoint
- Resolve overdue obligation

### List Card
Use for grouped events or records.
Examples:
- Next obligations
- Flow timeline
- Review queue
- Records list

### Explanation Card
Use for rules and contextual explanations.
Examples:
- Payment plan rule
- Why this board exists
- Pattern memory locked

### System Card
Use in Settings only.
Examples:
- Local data health
- Backup/restore
- Sample data
- App preferences

Cards must not all look equally important.

---

## 4.6 Responsive layout rules

No card may become so narrow that text breaks into vertical word columns.

Critical current bug:
Decision Lab / Focus Queue cards are too narrow and unreadable.

Rules:
- Minimum readable card width: 320px.
- If a two-column layout would reduce a column below 320px, stack columns vertically.
- Text cards should use normal line wrapping and must not render as one-word-per-line columns.
- Avoid forcing content into grids if a vertical stack is more readable.
- Test at desktop, tablet, and narrow widths.

---

## 4.7 Typography and readability

Current style is strong but sometimes too small and compressed.

Rules:
- Main financial numbers must be immediately readable.
- Supporting text may be small but not cryptic.
- Uppercase labels should be used sparingly.
- Long explanatory paragraphs should not use tiny uppercase styling.
- Ensure sufficient contrast in all visual modes.

---

## 4.8 Icons and visual metaphors

Use icons where they reduce cognitive load.

Good use cases:
- Financial Weather
- Incoming money
- Outgoing obligation
- Recurring cost
- Debt/payment plan
- Protected reserve
- Risk status
- Review required
- Matched record
- Forecast low point

Avoid decorative icons that do not clarify meaning.

Financial Weather should feel more visual:
- Clear weather icon
- Status name
- Short reason
- Recommended move

---

# 5. Data and calculation rules

Before major UI changes, inspect and document the current data model.

Create or update a developer document:
`docs/DATA_MODEL.md`

It should describe:
- Cash account schema.
- Income schema.
- Obligation schema.
- Recurring cost schema.
- Debt schema.
- Payment plan schema.
- Reserve bucket schema.
- Transaction/record schema.
- Review/checkpoint schema.
- Settings schema.
- Local storage keys.
- Derived selectors/calculations.

---

## 5.1 Actual cash vs expected income

Actual cash:
Money currently available in cash accounts.

Expected income:
Confirmed or likely income that has not arrived yet.

Rule:
Expected income must not count as actual cash until settled/received.

It may be included in forecast scenarios, but it must remain visually distinct from actual cash.

---

## 5.2 Safe-to-Spend

Safe-to-Spend should represent money available for the next 30 days after protection and near-term pressure.

Potential formula:
Actual cash
minus protected cash
minus confirmed obligations due within horizon
minus active payment plan pressure
minus buffer

Clarify exact formula in code comments and info popover.

Rules:
- Use actual cash only.
- Do not count expected income as actual cash.
- Obligations due within the configured horizon should reduce safe-to-spend.
- Active recurring debt/payment plans should reduce safe-to-spend.
- Paused payment plans should not reduce safe-to-spend.
- Future-start payment plans should only count from their start date.
- No-deadline debts should remain liabilities but not automatically create monthly pressure unless an active payment plan exists.

---

## 5.3 Runway

Runway:
How many months actual available cash can cover monthly burn.

Rules:
- Monthly burn must include active recurring costs.
- Monthly burn must include active recurring debt/payment plan installments.
- Paused debt/payment plans do not count.
- Future-start plans count only after their start date.
- One-time obligations should affect short-term pressure but not necessarily recurring monthly burn unless explicitly recurring.

---

## 5.4 Payment plan normalization

Payment plans can have different frequencies:
- weekly
- biweekly
- monthly
- quarterly
- yearly
- custom

They must normalize into monthly burn for planning.

Suggested normalization:
- weekly: amount × 52 / 12
- biweekly: amount × 26 / 12
- monthly: amount
- quarterly: amount / 3
- yearly: amount / 12

Rules:
- Only active plans affect burn.
- Paused plans remain visible but excluded.
- Future plans show upcoming start.
- Plans without deadline are valid.
- Plans with full balance and installment should show both liability and monthly pressure.
- Full debt balance should remain visible as liability.
- Installment affects monthly burn.

---

## 5.5 Protected cash and reserve buckets

Current issue:
Money Plan shows `Reserve Buckets: 0` but `Protected: €13,800`.

This relationship is unclear and must be fixed or explained.

Possible model distinction:
- Protected cash can come from protected accounts or system-level protected categories.
- Reserve buckets are explicit named targets.
- Protected amount may exist without reserve buckets if accounts are manually marked as protected.

Implementation requirement:
The UI must explain where protected cash comes from.

Examples:
- Tax reserve account
- VAT reserve account
- Health insurance reserve
- Studio buffer
- Explicit reserve buckets
- Manual protected allocation

If there are 0 reserve buckets but protected cash exists, show:
“Protected cash comes from protected accounts, not reserve buckets.”

---

## 5.6 Debt plans count display

Current issue:
Money Plan shows `Debt Plans 0/1`, which is ambiguous.

Replace with explicit labels:
- `0 active / 1 total`
or
- `0 payment plans active`
or
- `1 liability, 0 active payment plans`

Do not use cryptic ratio labels without explanation.

---

## 5.7 Review/checkpoint logic

A checkpoint is a snapshot that confirms the current financial picture.

It should capture:
- Cash account balances.
- Current obligations.
- Expected income confidence.
- Payment plan status.
- Safe-to-Spend value.
- Runway value.
- Any unresolved review items.
- Timestamp.

Checkpoints should unlock pattern memory over time.

Do not make checkpoint saving feel mandatory.

---

# 6. Implementation phases

The agent should follow these phases in order.

Do not skip early consolidation phases to add new features.

---

## Phase 1 — Repository and product audit

Goal:
Understand the current app deeply before changing it.

Tasks:
1. Inspect the repo structure.
2. Identify framework, build system, state management, routing, storage, and styling approach.
3. Map all boards and their component trees.
4. Map all existing data models.
5. Map all derived calculations/selectors.
6. Identify unused, duplicate, or obsolete components.
7. Identify local storage keys and migration logic.
8. Identify existing tests, lint commands, build commands, and type-check commands.
9. Inspect sample data and current seeded state.
10. Document findings in `docs/CODEBASE_AUDIT.md`.

Acceptance criteria:
- `docs/CODEBASE_AUDIT.md` exists.
- It lists all boards, major components, data models, and calculation paths.
- It identifies known broken or suspicious areas.
- It includes exact commands for build/test/lint/typecheck.

Do not make large functional changes in this phase except tiny safe fixes discovered during setup.

---

## Phase 2 — Navigation rename and board responsibility cleanup

Goal:
Rename boards visibly and clarify their responsibilities without breaking internal routing.

Recommended visible labels:
- Pulse → Money Status
- Decisions → Decision Lab
- Flow → Cash Timeline
- Plan → Money Plan
- Radar → Risk Radar
- Review → Reality Check
- Logbook → Records
- Settings → Settings

Tasks:
1. Locate navigation configuration.
2. Rename visible labels.
3. Keep route IDs stable unless a safe migration is easy.
4. Update page titles and subtitles.
5. Update empty states and button labels referencing old names.
6. Update documentation comments.
7. Ensure links between boards use the new labels.
8. Avoid changing local storage keys unless necessary.
9. If internal route names are changed, add compatibility redirects.

Suggested subtitles:
- Money Status: “Your current financial condition, safe-to-spend, runway, and next move.”
- Decision Lab: “Test spending, payment, income, and project decisions before acting.”
- Cash Timeline: “Upcoming income, obligations, payment plans, low points, and runway over time.”
- Money Plan: “Accounts, reserves, recurring costs, debts, payment plans, and project cash.”
- Risk Radar: “Early warnings, weak assumptions, concentration risks, and opportunities.”
- Reality Check: “A lightweight loop to confirm the numbers still reflect reality.”
- Records: “Imports, transactions, matching evidence, cleanup, and detailed records.”
- Settings: “Local data, backups, defaults, display preferences, and privacy.”

Acceptance criteria:
- Navigation shows the new names.
- All board headers use the new names.
- No visible references to old names remain except maybe in code comments or migration notes.
- All existing routes still work.

---

## Phase 3 — Fix critical layout and responsiveness bugs

Goal:
Fix immediately visible layout issues before feature work.

Priority bugs:
1. Decision Lab focus queue cards are too narrow and unreadable.
2. Cards must stack when columns become too narrow.
3. Text must never render as vertical word columns.
4. Record Detail Drawer on Records must not appear broken or half-rendered.
5. Ensure all boards are readable at common desktop and tablet widths.

Tasks:
1. Audit CSS grid/flex rules for all board layouts.
2. Add minimum width rules for cards.
3. Use responsive breakpoints for two-column/three-column layouts.
4. Stack Decision Lab sections vertically if needed.
5. Ensure the “Why this board exists” content does not consume major layout space.
6. Check drawers/modals/panels render as intended.
7. Add CSS utility classes or component props for consistent responsive behavior.

Acceptance criteria:
- Decision Lab is readable.
- No card text collapses into word columns.
- All boards remain usable at 1440px, 1024px, and 768px widths.
- Records detail drawer behaves intentionally.

---

## Phase 4 — Global design system consolidation

Goal:
Make the UI feel intentionally designed rather than assembled from similar cards.

Tasks:
1. Define shared card variants:
   - HeroCard
   - DataCard
   - ActionCard
   - ListCard
   - ExplanationCard
   - SystemCard
2. Define shared button variants:
   - primary
   - secondary
   - ghost
   - icon
   - destructive
3. Define shared status badge variants:
   - safe
   - watch
   - risky
   - fragile
   - stormy
   - overdue
   - needs review
   - matched
   - forecast
4. Define common spacing tokens.
5. Define typography tokens for:
   - board title
   - section title
   - metric label
   - main number
   - body text
   - helper text
   - uppercase micro label
6. Update existing boards gradually to use shared components.
7. Preserve the dark editorial style, but improve hierarchy and readability.
8. Ensure all visual modes still work.

Acceptance criteria:
- Cards have visible hierarchy.
- Buttons have clear action priority.
- Repeated visual patterns are centralized.
- No board-specific one-off button/card styling unless justified.

---

## Phase 5 — Global info popover system

Goal:
Replace scattered explanations and repeated calculation dropdowns with one consistent help pattern.

Tasks:
1. Create reusable `InfoPopover` or `MetricInfo` component.
2. Place `?` icon in consistent top-right position of complex widgets.
3. Use short, structured help content:
   - Meaning
   - Includes
   - Excludes
   - Edit source
   - Calculation note
4. Remove or reduce repeated “How calculated” dropdowns.
5. Keep formula details hidden by default.
6. Add info content for key metrics:
   - Safe-to-Spend
   - Current Cash
   - Runway
   - Financial Weather / Money Weather
   - Next Money In
   - Next Obligations
   - Expected Landing
   - Forecast Low
   - Protected Cash
   - Monthly Burn
   - Debt Plans
   - Reserve Coverage
   - Pattern Memory
   - Checkpoint

Acceptance criteria:
- Every complex metric has consistent help access.
- No page is overloaded with explanation text by default.
- Help content points users to where they can edit relevant data.

---

## Phase 6 — Money Status refinement

Goal:
Turn Money Status into a fast daily cockpit.

Current issue:
The page is strong but too long and too list-heavy.

Target structure:
1. Money Weather / condition hero
2. Safe-to-Spend hero
3. Current Cash + Runway summary
4. Suggested next move
5. Next Money In
6. Next Obligations
7. Optional detailed status cards

Tasks:
1. Move Financial Weather higher.
2. Make the top area emotionally clear and visually strong.
3. Rename “Today’s Finance Focus” to something more direct, such as:
   - Suggested Next Move
   - One Useful Update
   - Next Money Move
4. Reduce pressure around checkpoints.
5. Make “Save Checkpoint” conditional and gentle.
6. Improve Next Obligations visual hierarchy:
   - due date
   - amount
   - type
   - recurring/debt/protected/flexible
7. Consider compact timeline or icons for obligations.
8. Ensure expected income is visually distinct from actual cash.

Acceptance criteria:
- Within the first screen, user can see condition, safe-to-spend, runway, and next move.
- Checkpoint does not feel mandatory.
- Financial Weather feels like a signature feature.
- Obligations are clear but not visually overwhelming.

---

## Phase 7 — Decision Lab rebuild

Goal:
Turn Decision Lab from a passive focus board into an actual decision tool.

Current issues:
- Layout bug.
- Focus queue too narrow.
- Page does not yet let the user simulate decisions.
- “Why this board exists” is too prominent.

Target structure:
1. Decision status hero
2. Create Decision / What-if input
3. Focus queue
4. Decision scenarios
5. Saved decisions / recent decisions
6. Explanation/help collapsed behind info

Decision types:
- Spend money
- Pause payment plan
- Add new obligation
- Accept project/income
- Delay expected income
- Increase/decrease buffer
- Allocate reserve
- Custom scenario

Each decision should show impact on:
- Safe-to-Spend
- Runway
- Monthly Burn
- Forecast Low
- Risk status
- Next 30/60/90 days

Tasks:
1. Fix layout first.
2. Reduce “Why this board exists” to an info card/popover.
3. Add or improve decision input model.
4. Create scenario preview component.
5. Allow saving a decision scenario.
6. Link from Decision Lab to relevant Money Plan or Cash Timeline inputs.
7. Ensure decisions do not mutate real financial data until confirmed.
8. Add clear states:
   - Safe
   - Watch
   - Risky
   - Not recommended
   - Not enough data

Acceptance criteria:
- User can create at least one simple decision scenario.
- Scenario impact is visible before committing.
- Existing focus queue remains useful but no longer dominates.
- Layout remains readable.

---

## Phase 8 — Cash Timeline refinement

Goal:
Make the forecast easier to understand visually.

Current issue:
The page is useful but dense and number-heavy.

Target structure:
1. Forecast status hero
2. Actual cash vs expected landing
3. Timeline of upcoming events
4. Forecast low points
5. Scenario pressure
6. Runway projection chart

Tasks:
1. Create clearer distinction between actual cash and forecast including expected income.
2. Add event type icons:
   - income
   - obligation
   - recurring cost
   - debt/payment plan
   - forecast low
3. Improve low-point visualization.
4. Simplify Scenario Pressure cards.
5. Move calculation details into info popovers.
6. Ensure expected income remains forecasted until settled.
7. Highlight risky time windows.
8. Make Runway Projection easier to understand.

Acceptance criteria:
- User can understand the next 30/60/90 days without reading formulas.
- Expected vs actual money is visually distinct.
- Scenario Pressure is readable.
- Low points are easy to identify.

---

## Phase 9 — Money Plan structural cleanup

Goal:
Make Money Plan the clear place for financial structure and editable inputs.

Current issues:
- Overview and data maintenance are mixed.
- Reserve Buckets 0 vs Protected €13,800 is unclear.
- Debt Plans 0/1 is ambiguous.
- Some financial data may not be editable in the right place.

Target structure:
1. Plan profiles / scope selector
2. Money structure overview
3. Cash accounts
4. Protected money and reserve buckets
5. Recurring burn
6. Debt and payment plans
7. Project/income structure
8. Rules and assumptions

Tasks:
1. Clarify source of protected cash.
2. Fix reserve bucket/protected cash relationship display.
3. Replace cryptic debt ratios with explicit text.
4. Ensure cash accounts are editable.
5. Ensure cash accounts can be added, edited, archived/deleted.
6. Ensure recurring costs are editable.
7. Ensure debt/payment plans are editable.
8. Add ability to pause/resume payment plans.
9. Add payment plan start dates.
10. Support no-deadline debt plans.
11. Normalize payment frequency to monthly burn.
12. Ensure only active payment plans affect burn.
13. Keep full debt balance visible as liability.
14. Avoid showing debt details redundantly if already shown clearly elsewhere.
15. Add validation for missing amount, frequency, date, account, or category.

Acceptance criteria:
- User can maintain all core structural inputs from Money Plan.
- Protected cash origin is understandable.
- Debt/payment plan logic is explicit.
- Paused/future/no-deadline plans behave correctly.
- Monthly burn and runway update accordingly.

---

## Phase 10 — Risk Radar cleanup

Goal:
Make Risk Radar feel like a useful early warning system, not a generic status report.

Current issues:
- Main status starts with “Reserve coverage,” which is correct but not very action-oriented.
- “Keep the review loop current” appears repeatedly.
- Risk rails feel like labels instead of insights.
- Pattern Memory takes too much space while locked.

Target structure:
1. Main risk hero
2. Why this risk matters
3. Recommended action
4. Risk rails
5. Pattern memory
6. Income concentration / opportunity signals

Tasks:
1. Rename status copy to be more actionable.
2. Deduplicate repeated reasons.
3. For every risk rail, show:
   - status
   - reason
   - impact
   - recommended action
4. Collapse Pattern Memory when insufficient history exists.
5. Show clear unlock condition:
   - “Save 3 checkpoints to unlock trend memory.”
6. Improve Income Detach / income concentration language.
7. Distinguish risks from opportunities.
8. Avoid duplicating Money Status.

Acceptance criteria:
- Main risk is immediately understandable.
- No repeated reason text.
- Every risk has an action or explanation.
- Locked pattern memory is compact.

---

## Phase 11 — Reality Check simplification

Goal:
Make Reality Check lightweight and useful, not bureaucratic.

Current issue:
Review is conceptually right but still feels heavy.

Target structure:
1. Reality Check status
2. Review queue
3. Quick cash confirmation
4. Income confidence check
5. Obligation check
6. Record matching check
7. Save checkpoint

Tasks:
1. Keep the lightweight subtitle.
2. Reduce duplicate appearance of items between Review Queue and Obligation Review.
3. Make Review Queue the main source of truth.
4. Detail sections should be filtered by queue item, not duplicate unrelated lists.
5. Make cash account confirmation quick and clear.
6. Make Save Checkpoint the final action, not a forced requirement.
7. Add “skip for now” or “mark as okay” where useful.
8. Avoid month-close language unless optional.
9. Ensure saved checkpoint appears in Records or checkpoint history.

Acceptance criteria:
- User can complete a reality check in under 2 minutes.
- Duplicate items are reduced or clearly connected.
- Checkpoint saving feels optional but useful.
- The board does not feel like accounting homework.

---

## Phase 12 — Records refinement

Goal:
Keep Records powerful but prevent it from dominating the product.

Current issues:
- It feels like a separate transaction-management product.
- Filter area is heavy.
- Detail drawer may be visually broken.

Target structure:
1. Records utility status
2. Import/Add actions
3. Cleanup summary
4. Search and compact filters
5. Record tabs
6. Record list
7. Detail drawer

Tasks:
1. Keep Records clearly positioned as raw utility.
2. Simplify filters:
   - Search always visible.
   - Common filters as chips.
   - Advanced filters collapsed.
3. Ensure Record Detail Drawer opens as proper drawer/panel.
4. Ensure imports and manual records create consistent schema entries.
5. Ensure matched payments link correctly to obligations or expected income.
6. Ensure reviewed/matched states are visible.
7. Ensure records do not duplicate obligations unless linked intentionally.
8. Add empty states for no records, no matches, no review needed.

Acceptance criteria:
- Records supports import, add, search, filter, match, review.
- Detail drawer is visually correct.
- The board feels like a utility, not the main dashboard.

---

## Phase 13 — Settings cleanup

Goal:
Keep Settings limited to app-level configuration.

Current issues:
- Restore Backup appears in more than one place.
- Destructive actions need clearer treatment.

Tasks:
1. Remove duplicate Restore Backup button or clarify why both exist.
2. Keep only one primary backup/restore flow.
3. Make destructive actions visually distinct:
   - Reset Local Data
   - Delete Sample Data
4. Add confirmation for destructive actions.
5. Ensure import/export works.
6. Ensure base currency updates display consistently.
7. Ensure forecast horizon affects relevant calculations.
8. Ensure default scope filter works globally.
9. Ensure visual mode affects all boards safely.
10. Ensure reduced motion is respected.

Acceptance criteria:
- Settings contains only system-level controls.
- No duplicate backup actions.
- Destructive actions require confirmation.
- Preferences affect the app consistently.

---

## Phase 14 — Data integrity and local-first reliability

Goal:
Make local storage trustworthy.

Tasks:
1. Document all local storage keys.
2. Add schema versioning if not present.
3. Add migration handling for existing user data.
4. Add safe parsing and fallback for corrupted local data.
5. Add backup export including all relevant data.
6. Add restore validation.
7. Add sample data restore/delete separation.
8. Ensure sample data cannot accidentally overwrite real user data without confirmation.
9. Add data health check:
   - schema version
   - invalid records
   - orphaned links
   - missing required fields
   - duplicate IDs
10. Add a developer-only debug summary if helpful.

Acceptance criteria:
- App survives reload.
- App survives corrupted/partial local data gracefully.
- Backup and restore work.
- Data health accurately reports issues.

---

## Phase 15 — Calculation test coverage

Goal:
Reduce future testing cost by covering core calculations.

Add unit tests for:
1. Safe-to-Spend.
2. Current Cash.
3. Protected Cash.
4. Monthly Burn.
5. Runway.
6. Expected Landing.
7. Forecast Low.
8. Payment plan normalization.
9. Paused payment plans.
10. Future-start payment plans.
11. No-deadline debts.
12. Reserve coverage.
13. Risk status.
14. Checkpoint creation.
15. Expected income settlement.

Acceptance criteria:
- Core financial calculations have deterministic tests.
- Tests include edge cases.
- Test names explain expected product behavior.
- Build/test commands are documented.

---

## Phase 16 — Interaction QA pass

Goal:
Verify all major user actions work.

Manual QA checklist:
- Add cash account.
- Edit cash account.
- Archive/delete cash account.
- Add recurring cost.
- Edit recurring cost.
- Add obligation.
- Mark obligation as paid or reviewed.
- Add expected income.
- Mark expected income as received.
- Add debt.
- Add payment plan.
- Pause payment plan.
- Resume payment plan.
- Add future start date.
- Add no-deadline debt.
- Add reserve bucket.
- Allocate cash.
- Import CSV.
- Add manual record.
- Match record to obligation.
- Match record to expected income.
- Save checkpoint.
- Export backup.
- Restore backup.
- Reset sample data.
- Change currency.
- Change forecast horizon.
- Change visual mode.

Acceptance criteria:
- Every primary action works or is intentionally disabled with explanation.
- No silent failures.
- No actions create inconsistent data.
- UI updates derived metrics after changes.

---

## Phase 17 — Copywriting and terminology pass

Goal:
Make the app feel clear, human, and low-anxiety.

Rules:
- Use descriptive labels over clever labels where clarity matters.
- Avoid accounting-heavy language unless necessary.
- Avoid guilt or homework language.
- Avoid overexplaining on the main UI.
- Use calm, direct microcopy.

Replace:
- “Review due today” with “Reality check suggested”
- “Save the operating loop” with “Save a checkpoint if this picture feels accurate”
- “How calculated” with `?` info popover
- “Debt Plans 0/1” with “0 active / 1 total”
- “Keep the review loop current” repeated lines with specific reasons
- “Unreviewed” with “Needs confirmation” if more human

Acceptance criteria:
- Page copy is understandable without product context.
- No repeated generic reasons.
- No board feels like homework.
- Technical terms are explained only when needed.

---

## Phase 18 — Visual polish and icon system

Goal:
Make the product more intuitive and visually memorable.

Tasks:
1. Add or consolidate icon system.
2. Use weather icons for Money Weather.
3. Use event icons in Cash Timeline.
4. Use risk icons in Risk Radar.
5. Use review/check icons in Reality Check.
6. Use record/match icons in Records.
7. Ensure icons are accessible and not color-only.
8. Improve spacing in list cards.
9. Improve amount alignment.
10. Improve status badge consistency.
11. Make major numbers feel intentional and readable.

Acceptance criteria:
- Icons reduce text load.
- Lists are easier to scan.
- Money Status feels more like a cockpit.
- Cash Timeline feels more like a timeline than a stack of cards.

---

## Phase 19 — Empty states and onboarding

Goal:
Make the app useful without sample data and understandable for new users.

Tasks:
1. Add empty states for every major board.
2. Add first-run guidance:
   - Add cash account
   - Add recurring costs
   - Add upcoming obligations
   - Add expected income
   - Add reserve/tax protection
3. Add “minimum useful setup” checklist.
4. Keep onboarding lightweight.
5. Do not force a long wizard unless explicitly chosen.
6. Allow user to start with sample data or empty setup.

Acceptance criteria:
- Empty app does not feel broken.
- User knows what to add first.
- Sample data is clearly marked.
- Onboarding does not block advanced users.

Implementation note:
- Seeded fictional sample data is labeled in Money Status. The Start Empty path uses the existing typed confirmation flow, and the `deleted` / backup-restored seed states are not silently reseeded on reload.

---

## Phase 20 — Final consolidation and documentation

Goal:
Leave the repo in a state that future agents can understand quickly.

Tasks:
1. Update `README.md`.
2. Add or update `docs/PRODUCT_SPEC.md`.
3. Add or update `docs/DATA_MODEL.md`.
4. Add or update `docs/CODEBASE_AUDIT.md`.
5. Add or update `docs/QA_CHECKLIST.md`.
6. Add or update this roadmap if implementation decisions changed.
7. Remove unused components.
8. Remove obsolete feature flags.
9. Remove dead code.
10. Ensure build passes.
11. Ensure tests pass.
12. Ensure lint/typecheck pass if configured.

Acceptance criteria:
- Future coding agents can understand the product from docs.
- No obvious duplicate old components remain.
- Repo has clear instructions for development and QA.

---

# 7. Minimal testing strategy

Because testing rounds are expensive, use a strict but efficient testing approach.

## Before implementation
Run:
- install command if needed
- typecheck if available
- lint if available
- test if available
- build

Document exact commands in `docs/CODEBASE_AUDIT.md`.

## During implementation
After each phase:
- Run typecheck.
- Run build.
- Run relevant unit tests.
- Only run full test suite when touching shared logic.

## Before final handoff
Run:
- full build
- full tests
- lint/typecheck
- manual smoke test of all boards

If a command fails because the repo has no such script, document that instead of pretending it passed.

---

# 8. Historical screenshot findings and current status

This section started as a screenshot-review issue list. It now tracks which findings are resolved, which remain open, and which need a fresh manual QA pass before more UI work is scheduled.

## Resolved or covered by implementation
1. Decision Lab layout/readability is covered by viewport E2E checks, and the board no longer uses the unreadable vertical focus-card layout.
2. Board action hierarchy has been tightened across the main boards. Shared board actions use `renderFinanceButton`, and legacy `.fin-action-btn` runtime markup is guarded against by E2E.
3. The global plus button now opens a creation-focused Quick Add menu instead of board-navigation or restore actions.
4. Financial Weather is raised directly below the Money Status safe-to-spend cockpit.
5. Money Plan labels protected account allocations and reserve bucket balances separately.
6. Debt plan count display now uses clearer confirmed-plan language.
7. Core financial inputs moved to their responsible boards; Settings is limited to app-level preferences, backup/restore, data health, sample data, and reset.
8. Payment plan pause/start/no-deadline behavior is implemented and covered by E2E.
9. Risk Radar rows now include status, reason, impact, and source-board routes.
10. Pattern Memory stays compact until enough checkpoints exist.
11. Reality Check keeps Review Queue as the primary actionable source and reduces duplicate item lists.
12. Records search stays visible while advanced filters are collapsed, with common filter chips exposed.
13. Settings has one backup/restore flow and a distinct typed-confirmation safety zone.
14. Destructive reset and sample-data actions use explicit confirmation flows.

## Still open or intentionally deferred
1. `src/dashboard/financial-mode.js` remains very large and mixes rendering, UI state, action handling, and persistence-facing orchestration.
2. A fuller first-run chooser remains deferred; the current state supports labeled sample data plus a confirmation-gated empty setup path.
3. Standalone upcoming-obligation creation from Quick Add remains deferred until the product has a dedicated workflow distinct from recurring costs and debt plans.
4. Standalone decision-scenario creation remains deferred; current decision drafts reuse Scenario Lab 2.0 for non-mutating previews.
5. Future schema changes still need explicit version-aware migrations and fixtures beyond the historical v0 repository migration.
6. Reserve bucket balances and protected account allocations are documented separately; future calculation work should decide whether reserve buckets become canonical protected cash inputs or remain planning containers.

## Needs fresh QA before more redesign
1. Money Status may still need a daily-use compression pass after a fresh desktop/mobile review.
2. Risk Rails actionability should be reassessed against current Risk Radar rows.
3. Records detail drawer should be manually checked on desktop and mobile.
4. Some microcopy, uppercase labels, and icon/text balance may still benefit from a focused polish pass.

---

# 9. Implementation priority summary

Do not start with new feature expansion.

Correct order:

1. Audit repo and data model.
2. Rename boards visibly.
3. Fix critical layout bugs.
4. Consolidate design system.
5. Standardize info popovers.
6. Refine Money Status.
7. Rebuild Decision Lab.
8. Refine Cash Timeline.
9. Clean up Money Plan and financial inputs.
10. Clean up Risk Radar.
11. Simplify Reality Check.
12. Refine Records.
13. Clean up Settings.
14. Strengthen local-first data integrity.
15. Add calculation tests.
16. Run interaction QA.
17. Copywriting pass.
18. Visual/icon polish.
19. Empty states/onboarding.
20. Final docs and cleanup.

---

# 10. Agent operating instructions

When working on this repo:

1. Do not add features before understanding existing code.
2. Do not duplicate existing functionality.
3. Prefer improving existing components over creating parallel systems.
4. Keep internal route IDs stable unless migration is handled.
5. Keep all money calculations deterministic and documented.
6. Keep expected income distinct from actual cash.
7. Keep Settings limited to app-level preferences.
8. Keep Records as raw utility, not the main product.
9. Keep Reality Check lightweight.
10. Keep Money Status fast and emotionally clear.
11. Make Decision Lab interactive, not just informational.
12. Always check if a UI issue is caused by data, layout, or calculation before fixing only the visual layer.
13. Whenever changing calculation logic, add or update tests.
14. Whenever changing local storage schema, add migration logic.
15. Whenever adding a new UI pattern, consider whether it should be shared globally.
16. Do not rely only on screenshots; inspect actual components and state.
17. If something is intentionally deferred, document it in this roadmap or a follow-up TODO file.
18. If a command cannot be run, state why.
19. If a decision is ambiguous, choose the simpler product path that reduces cognitive load.
20. The product should become clearer before it becomes bigger.

---

# 11. Definition of done for the next major version

The next major version is done when:

- Navigation uses clear descriptive board names.
- Decision Lab no longer has layout bugs.
- Money Status communicates status, safe-to-spend, runway, and next move above the fold.
- Cash Timeline clearly separates actual cash and expected forecast.
- Money Plan allows editing of core structural financial inputs.
- Debt/payment plan logic supports active, paused, future-start, and no-deadline states.
- Protected cash sources are understandable.
- Risk Radar gives actionable risks without repeated generic copy.
- Reality Check can be completed quickly without feeling like homework.
- Records works as a raw utility with proper filters and detail drawer.
- Settings contains only app-level controls.
- Info popovers are consistent.
- Buttons and cards have clear hierarchy.
- Core calculations are tested.
- Local-first data is backed up, restorable, and migration-safe.
- Documentation explains the product and codebase for future agents.
