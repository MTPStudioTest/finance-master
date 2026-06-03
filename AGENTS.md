# AGENTS.md — Finance Master Coding Agent Instructions

## Project Identity

Finance Master is a local-first finance and treasury dashboard for freelancers, creative entrepreneurs, and small studios.

It is not generic bookkeeping software, not tax filing software, and not a full accounting suite.

The core product promise is:

> Help the user understand what money is truly available, what is already spoken for, what is coming, what is risky, and what decision they can safely make next.

The product should feel like a calm, private financial operating system: clear, premium, minimal, trustworthy, and strategically useful.

Do not turn it into a generic corporate SaaS dashboard.

---

## Mandatory Working Method

Before implementing anything substantial:

1. Inspect the existing codebase.
2. Understand the current architecture, storage layer, state management, routing, and financial calculation logic.
3. Read the roadmap file if present in the repository, especially `finance-master-codex-roadmap.md`.
4. Break work into small implementation chunks.
5. Prefer safe, tested, incremental changes over large rewrites.

Never implement an entire roadmap phase in one giant change.

Every task should be small enough to be reviewed independently.

Use this structure when planning work:

```md
### Chunk name

- Goal:
- Files likely affected:
- Implementation steps:
- Tests:
- Acceptance criteria:
- Risks / notes:
```

Do not start later roadmap phases before the foundational data safety and calculation logic are stable.

---

## Immediate Priorities

The first priorities are always:

1. Data safety
2. Backup and restore reliability
3. Removal or protection of destructive reset / repair behavior
4. Schema versioning and migration safety
5. Central financial calculation engine
6. Correct recurring cost normalization
7. Correct debt payment plan handling
8. Correct distinction between actual cash, protected cash, available cash, and expected income

Advanced features such as AI, integrations, collaboration, bank sync, desktop app, or commercial productization must not be implemented before the core is safe and mathematically trustworthy.

---

## Data Safety Rules

Finance Master is local-first. User data may live in browser storage such as localStorage and/or IndexedDB.

Data loss prevention is critical.

Before changing storage or initialization logic, identify:

- Where localStorage is used
- Where IndexedDB is used
- Where demo data is initialized
- Where reset, repair, clear, wipe, or migration logic exists
- Whether URL parameters can delete or overwrite user data
- Whether backups include all necessary data
- Whether restore validates incoming data
- Whether schema versions exist

### Destructive Actions

No URL parameter, hidden route, debug flag, or demo repair behavior may wipe or overwrite user data in production.

Any destructive action must require explicit user confirmation.

For destructive actions, use a focused confirmation flow with:

- Clear explanation of what will happen
- Recommendation to create a backup first
- Explicit confirmation button
- Typed confirmation for irreversible deletion when appropriate
- No accidental confirm on Enter unless intentionally designed

### Backup and Restore

Backup export and restore must be treated as core product features.

Restore must validate data before replacing current data.

Malformed restore files must be rejected safely.

Before restore, show or prepare data summaries where possible:

- Backup creation date
- Schema version
- Number of transactions
- Number of income items
- Number of fixed costs
- Number of debts
- Number of reserve buckets
- Number of accounts

Never silently overwrite current local data.

### Schema Migration

Every schema change should have:

- Explicit schema version
- Migration function
- Validation before/after migration
- Safe fallback behavior
- Tests or fixtures for old data when possible

Do not silently mutate stored financial data without version-aware migration logic.

---

## Financial Domain Rules

Centralize financial calculations in a domain layer.

Avoid scattering financial math across UI components.

Prefer pure functions with tests.

Recommended domain areas:

- Cash position
- Burn rate
- Runway
- Reserves
- Debt schedules
- Cashflow forecast
- Forecast confidence
- Recurring cost normalization

### Actual Cash

Actual Cash is the sum of liquid account balances.

It must not include unpaid invoices, expected income, proposals, leads, or forecasted income.

```txt
Actual Cash = sum(liquid account balances)
```

### Protected Cash

Protected Cash is money that exists but is reserved for a specific purpose.

Examples:

- VAT reserve
- Income tax reserve
- Health insurance reserve
- Debt repayment reserve
- Emergency buffer
- Project-specific reserve

```txt
Protected Cash = sum(active reserve bucket balances)
```

### Available Cash

Available Cash is the most important product metric.

```txt
Available Cash = Actual Cash - Protected Cash - committed short-term obligations
```

The short-term obligation window must be explicit and testable.

Never present total account balance as freely available money if reserves or near-term obligations exist.

### Monthly Burn Rate

Monthly Burn Rate must include:

- Fixed monthly costs
- Normalized recurring costs
- Active debt payment plans
- Minimum required obligations

Debt payment plans are not optional notes. They directly affect recurring costs, burn rate, and runway.

Examples:

```txt
€250/month      => €250 monthly burn
€600/quarter    => €200 monthly burn
€1,200/year     => €100 monthly burn
```

Support recurrence normalization for at least:

- Monthly
- Quarterly
- Yearly
- Weekly or biweekly if present in the app
- Custom schedules only if explicitly implemented and tested

### Runway

Primary runway should use available cash:

```txt
Runway = Available Cash / Monthly Burn Rate
```

The app may additionally show actual-cash runway, but protected-cash-adjusted runway is more important.

If monthly burn rate is zero or missing, handle the result explicitly and safely.

### Expected Income

Expected income must not be counted as actual cash.

Forecasts should distinguish:

- Paid / actual income
- Confirmed income
- Open invoices
- Expected income
- Optimistic income
- Proposals and leads

Do not mix these categories silently.

### Double-Counting Prevention

Avoid double-counting in all financial calculations.

Examples:

- A debt payment plan should count in burn rate, but not twice if also linked as a fixed cost.
- A transaction linked to an invoice should not cause income to be counted twice.
- Transfers between own accounts should not count as income or expense.
- VAT reserve should not reduce revenue twice.

When in doubt, make relationships explicit with IDs and write tests.

---

## UX and Information Architecture Rules

The product should be calm, clear, and operational.

Primary navigation should eventually follow this mental model:

- Overview
- Cashflow
- Transactions
- Income
- Obligations
- Reserves
- Monthly Review
- Reports
- Import & Backup
- Settings

Do not force this navigation structure immediately if the codebase is not ready, but all new UX decisions should move toward it.

### Settings Rules

Settings must not become a junk drawer.

Settings should contain true app-level preferences only, such as:

- Currency
- Appearance
- Reduced motion
- Forecast horizon default
- Scope filter default
- Demo data toggle
- Display preferences

Settings should not contain management of:

- Fixed costs
- Debt plans
- Reserve buckets
- Income pipeline
- Transactions
- Import mappings
- Monthly review tasks

Those belong in proper product sections.

### Modal Rules

Modals must stay focused.

A modal should do one thing.

Good modal examples:

- Add transaction
- Add expected income
- Add fixed cost
- Add debt payment plan
- Add reserve bucket
- Confirm restore
- Confirm reset

Avoid:

- Giant settings modals
- Multi-section finance setup modals
- Duplicated controls already available elsewhere
- Long explanations hidden in modals
- Large unrelated forms in one popup

Prefer side panels, dedicated sections, or inline expandable explanations for complex workflows.

### Metric Explanation

Every major financial metric should be explainable.

For important values, provide or enable a “how this is calculated” explanation.

Key metrics requiring explanation:

- Actual cash
- Protected cash
- Available cash
- Monthly burn rate
- Runway
- Forecast confidence
- Tax/VAT reserve
- Debt burden

---

## Design Direction

The product should feel:

- Calm
- Premium
- Minimal
- Editorial
- Trustworthy
- Private
- Clear
- Serious but not corporate

Avoid:

- Generic SaaS dashboard look
- Overloaded office-style UI
- Too many bright colors
- Spreadsheet-like density
- Alarmist financial warning language
- Decorative UI that reduces clarity

Use strong hierarchy, clean spacing, careful typography, and focused screens.

---

## Testing Expectations

Add or maintain tests for foundational logic.

Prioritize tests for:

- Backup export
- Backup restore
- Malformed restore rejection
- Destructive reset protection
- Schema migration
- Actual cash calculation
- Protected cash calculation
- Available cash calculation
- Monthly burn calculation
- Recurring cost normalization
- Debt payment plan normalization
- Runway calculation
- Invoice / transaction matching if implemented
- Prevention of double-counting

If the current project does not have a useful testing setup, propose and add the smallest practical testing foundation before major refactors.

Prefer testing pure financial functions directly.

---

## Code Quality Expectations

Prefer:

- Centralized domain logic
- Pure calculation functions
- Strong TypeScript types if TypeScript is used
- Explicit schema versions
- Defensive validation
- Small reusable UI components
- Clear separation between UI, storage, and calculation logic
- Incremental refactors
- Clear naming
- Tests for financial math

Avoid:

- Scattered financial math inside React components
- Silent data mutation
- Hidden destructive flows
- Overloaded modals
- Duplicated financial logic
- Adding advanced features before foundations are stable
- Large unreviewable rewrites
- Converting the app into generic accounting software

---

## Roadmap Discipline

The repository may include a detailed 30-phase roadmap.

Treat it as strategic direction, not permission to implement everything at once.

### Phase Discipline

Do not implement later phases until earlier foundations are stable.

The intended maturity path is:

1. Data safety and storage integrity
2. Financial logic and domain model
3. Information architecture and UX simplification
4. Onboarding
5. Import and transaction workflow
6. Income pipeline
7. Forecasting and scenarios
8. Monthly review ritual
9. Reports and insights
10. Polish, accessibility, performance, docs
11. Rules and automation
12. Advanced reserves
13. Tax/VAT/health planning
14. Integrations
15. AI assistant grounded in calculations
16. Goals and capital decisions
17. Multi-scope finance
18. Collaboration and advisor mode
19. Desktop/local privacy architecture
20. Commercial productization
21. Historical intelligence
22. Annual planning
23. Project-based finance
24. Retainer management
25. Pricing and profitability advisor
26. Contract/payment risk
27. Scenario library and decision archive
28. Stress-aware financial workflows
29. Ecosystem maps
30. Modular Finance OS

For current implementation, prioritize Phases 1 and 2 unless instructed otherwise.

---

## Non-Goals for Early Development

Do not implement these early unless explicitly requested:

- Full double-entry accounting
- Tax filing
- DATEV export
- Full invoice generation
- Bank sync
- AI assistant
- Multi-user collaboration
- Desktop app
- Cloud sync
- Commercial billing
- Complex project management
- Legal or tax advice engine

The product may later support some of these, but only after the local-first treasury core is stable.

---

## Language and Product Tone

Use calm, clear, non-shaming language.

Prefer:

- “Needs review”
- “Below target”
- “Forecast confidence is low”
- “This money is protected”
- “This payment plan adds €X/month to burn rate”

Avoid:

- “You failed”
- “Danger!”
- “You are broke”
- “Guaranteed”
- “You owe exactly” for tax estimates
- Overconfident financial advice

For tax, VAT, health insurance, and legal-adjacent areas, frame outputs as planning estimates, not official advice.

---

## Required Agent Behavior

When asked to implement:

1. Briefly restate the goal.
2. Inspect relevant files first.
3. Identify affected modules.
4. Make a small plan.
5. Implement in focused chunks.
6. Add or update tests.
7. Run available checks.
8. Summarize what changed and what remains.

When blocked:

- State the blocker clearly.
- Do not guess silently.
- Make the smallest safe assumption only when necessary.
- Prefer partial safe progress over broad risky changes.

When finding dangerous behavior:

- Prioritize fixing or gating it.
- Mention it clearly in the summary.

---

## Repository Files to Prefer

If present, study these first:

- `finance-master-codex-roadmap.md`
- `README.md`
- `package.json`
- App entry files
- Routing files
- Storage/localStorage/IndexedDB utilities
- Demo data initialization
- Import/export utilities
- Financial calculation utilities
- Settings components
- Dashboard/Overview components
- Transaction components
- Fixed cost / debt / reserve components
- Test configuration

If these files do not exist, infer the closest equivalents from the project structure.

---

## Definition of Done for Foundational Work

A foundational change is done only when:

- The app still builds.
- Existing functionality still works.
- Data safety is not weakened.
- Financial calculations are not duplicated in new places.
- Relevant tests exist or a clear reason is given why not.
- The UI remains understandable.
- Destructive actions are explicit and protected.
- New financial terms are named consistently.
- The change moves the product toward the roadmap instead of adding isolated complexity.
