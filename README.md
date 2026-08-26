# Margin Dashboard

A local financial operations dashboard that turns three messy spreadsheets into an answer to one practical question:

> **Did we actually make money on that project?**

The application ingests timesheet, salary, and project-pricing workbooks, normalizes and persists the data locally, applies the provided cost-allocation model, and exposes project profitability, employee productivity, and category-level time reporting.

---

## Features

### Dashboard

The main dashboard provides:

- Revenue
- Cost
- Profit
- Margin
- Total logged hours
- Billable hours
- Year/month filtering
- Project-level profitability overview
- Explicit revenue-recognition assumption
- Data-quality warnings when calculations are incomplete

### Project drill-down

Each project has a detailed view containing:

- Project price
- Total hours
- Total cost
- Profit
- Margin
- Hours and cost by department
- Employee-level contribution
- Employee revenue share
- Employee profitability

### Productivity

Employee productivity is calculated as:

```text
billable hours / total logged hours
```

The view can be filtered by year and month.

### Categories

Shows how logged time is distributed across categories, including:

- Hours per category
- Share of total logged hours
- Billable / non-billable classification
- Year/month filtering

### Spreadsheet imports

The application accepts the three `.xlsx` source files through the UI:

- Timesheet
- Salary overview
- Project prices

Imports are persisted to SQLite.

Timesheet and salary re-imports are period-aware: only months contained in the uploaded workbook are replaced, so uploading a corrected month does not duplicate data or destroy the rest of the year.

Project prices are upserted by `Ref Code`.

Import history is retained separately from the business data.

---

# Quick start

## Requirements

- Node.js 20+
- pnpm

No cloud account, external API, API key, or paid service is required.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure the local database

```bash
cp .env.example .env
```

The default configuration uses a local SQLite database:

```env
DATABASE_URL="file:./dev.db"
```

## 3. Apply database migrations

```bash
pnpm exec prisma migrate deploy
```

## 4. Load the supplied sample data

```bash
pnpm data:load-sample
```

## 5. Start the application

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

The dashboard should already be populated with the supplied 2025 dataset.

---

# Sample dataset result

With the supplied 2025 data and monthly overhead set to zero, the full-year dashboard produces approximately:

| Metric         |        Result |
| -------------- | ------------: |
| Revenue        | AED 5,012,000 |
| Cost           | AED 2,400,000 |
| Profit         | AED 2,612,000 |
| Margin         |         52.1% |
| Total hours    |      19,815.2 |
| Billable hours |      15,265.6 |

The most important reconciliation check is:

```text
Total salaries:       AED 2,400,000
Total allocated cost: AED 2,400,000
Difference:           AED 0
```

This verifies that, with overhead set to zero, salary cost is allocated exactly once and is not double-counted.

You can verify this independently with:

```bash
pnpm finance:reconcile
```

---

# Financial model

The financial calculations are implemented as framework-independent domain functions.

## Direct hourly cost

For each employee and month:

```text
direct hourly rate
=
monthly salary / total logged hours
```

An employee with no logged hours does not receive a direct hourly rate. Their salary is treated as support cost and enters the monthly indirect cost pool.

---

## Indirect cost pool

For each month:

```text
indirect cost pool
=
salaries of employees with zero logged hours
+
non-billable hours × employee direct hourly rate
+
monthly overhead
```

The indirect hourly rate is then:

```text
indirect hourly rate
=
indirect cost pool / total billable hours
```

---

## Employee project cost

```text
employee project cost
=
project hours × (direct hourly rate + indirect hourly rate)
```

---

## Employee revenue share

```text
employee revenue share
=
project price ×
(employee project hours / total project hours)
```

---

## Employee profitability

```text
employee profitability
=
(revenue share - employee cost) / revenue share
```

---

## Project profitability

```text
project profitability
=
(project price - project cost) / project price
```

---

## Productivity

```text
productivity
=
billable hours / total logged hours
```

---

# Billable categories

The supplied dataset treats these categories as billable:

```text
Projects
Enhancements
Hosting
```

All other categories are treated as non-billable by default.

The configuration is centralized in:

```text
src/application/configuration/default-billing-configuration.ts
```

The current default monthly overhead is:

```text
AED 0
```

A UI for editing billable categories and overhead was intentionally left out of the current scope. The calculation engine already receives these values through configuration, so exposing them in a settings page would not require changing the financial formulas.

---

# Revenue recognition assumption

The brief defines project price and profitability but does not specify how project revenue should be recognized when viewing a single month while delivery can span multiple months.

For the period dashboard I made the following explicit assumption:

> **The full project price is recognized in the project's Sales Month.**

Example:

If a project has a price of AED 560,000 and its Sales Month is January:

```text
January recognized revenue = AED 560,000
February recognized revenue = AED 0
```

Delivery costs are calculated from the hours actually logged during the selected month.

This means a month can legitimately contain delivery cost but no recognized revenue.

The policy is intentionally isolated in:

```text
src/application/dashboard/revenue-recognition-policy.ts
```

so an alternative policy can be implemented without modifying the costing engine or UI components.

The project detail page is different: it represents the economics of the full project and therefore uses the complete project price and all project delivery hours.

---

# Spreadsheet handling

The source workbooks contain real-world inconsistencies such as:

- Headers not necessarily starting on row 1
- Empty values represented as `-`
- Currency-formatted numbers
- Dates such as:

```text
May '25
January 2025
January
```

The ingestion layer separates spreadsheet-specific concerns from the financial domain.

```text
src/infrastructure/spreadsheets/
```

contains:

- Header detection
- Text normalization
- Number normalization
- Period normalization
- Timesheet parser
- Salary parser
- Project-price parser

The parsers convert spreadsheet rows into canonical domain objects before anything is persisted or calculated.

---

# Safe re-import behaviour

Corrected timesheet and salary imports use period replacement rather than append-only inserts.

For example, importing a workbook containing only:

```text
March 2025
```

performs conceptually:

```text
BEGIN TRANSACTION

delete existing March 2025 rows
insert corrected March 2025 rows
record import batch

COMMIT
```

January, February, and April–December remain untouched.

The replacement occurs inside a database transaction so a failed import cannot leave a month partially replaced.

Project prices use an upsert keyed by:

```text
Ref Code
```

Import history is stored separately using `ImportBatch`.

---

# Data-quality decisions

External spreadsheet data is not assumed to be perfect.

## Missing salary

If an employee has logged hours but no salary for the relevant month, the application does not silently assume a zero salary.

The affected cost calculation is marked incomplete.

## Missing project price

Timesheet rows are allowed to contain a project reference that is not present in the project-price workbook.

Those rows are persisted so the data problem remains visible rather than disappearing during ingestion.

The dashboard surfaces the affected calculation as incomplete.

For this reason, the timesheet `Ref Code` is deliberately not enforced as a foreign key to the project table.

## Employee identifiers

Employee numbers are stored as strings rather than numbers.

For example:

```text
00101
```

must remain `00101`, not become `101`.

## Zero denominators

Values such as profitability or productivity are not calculated when their denominator is zero.

The UI displays an unavailable value rather than `Infinity`, `NaN`, or a misleading zero.

---

# Architecture

The application uses a small layered architecture:

```text
┌─────────────────────────────────────┐
│ Presentation                        │
│ Next.js App Router + React          │
├─────────────────────────────────────┤
│ Application                         │
│ Query services / use cases          │
├─────────────────────────────────────┤
│ Domain                              │
│ Costing / profitability / rules     │
├─────────────────────────────────────┤
│ Infrastructure                      │
│ Prisma / SQLite / ExcelJS           │
└─────────────────────────────────────┘
```

Main source structure:

```text
src/
├── app/
├── application/
├── components/
├── domain/
│   ├── configuration/
│   ├── costing/
│   ├── employees/
│   ├── productivity/
│   ├── profitability/
│   ├── projects/
│   ├── salaries/
│   ├── shared/
│   └── timesheets/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   └── spreadsheets/
└── validation/
```

---

# Architecture decisions

## Keep financial logic outside Next.js

The domain layer has no dependency on:

- React
- Next.js
- Prisma
- SQLite
- ExcelJS

A financial rule can therefore be tested directly with plain TypeScript data.

For example, changing the indirect-cost calculation should not require modifying a React component or database query.

---

## Application services orchestrate, domain functions calculate

Application services such as:

```text
DashboardService
ProjectDetailService
ProductivityService
CategoryReportService
FinancialImportService
```

coordinate repositories and domain functions.

They do not contain spreadsheet parsing logic or UI rendering.

React pages receive presentation-oriented view models rather than raw Prisma records.

---

## Keep infrastructure replaceable

Prisma and ExcelJS are infrastructure details.

Changing SQLite to another database, or replacing Excel ingestion with CSV ingestion, should not require rewriting the financial formulas.

---

## Pure functions for financial calculations

Financial calculations are implemented primarily as pure functions because they:

- Have deterministic inputs and outputs
- Are straightforward to unit test
- Do not need lifecycle or mutable state
- Make the formulas easy to inspect during review

Classes are mainly used where dependency orchestration is useful.

---

# Technology

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- ExcelJS
- Zod
- Vitest
- pnpm

---

# Useful commands

Start development:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Type-check:

```bash
pnpm exec tsc --noEmit
```

Lint:

```bash
pnpm lint
```

Check formatting:

```bash
pnpm format:check
```

Inspect parsed source data:

```bash
pnpm data:inspect
```

Load sample data:

```bash
pnpm data:load-sample
```

Inspect persisted data:

```bash
pnpm db:inspect
```

Verify company-wide cost reconciliation:

```bash
pnpm finance:reconcile
```

Inspect project profitability:

```bash
pnpm finance:projects
```

Production build:

```bash
pnpm build
```

---

# Testing strategy

Tests focus on behaviour where mistakes would materially affect financial results.

Examples include:

- Date normalization
- Direct hourly rate calculation
- Monthly indirect-cost allocation
- Project profitability
- Employee revenue sharing
- Productivity
- Revenue-recognition policy

There are also executable reconciliation scripts that exercise the complete supplied dataset.

The most important invariant is:

```text
overhead = 0

total allocated company cost
=
total salaries
```

For the supplied 2025 data the difference is:

```text
AED 0
```

---

# Import workflow

The application can be initialized from the command line using the supplied data:

```bash
pnpm data:load-sample
```

or the files can be uploaded through:

```text
/imports
```

The dashboard and reporting pages read only persisted data; they do not read directly from the sample Excel files.

---

# Pages

```text
/                       Financial dashboard
/projects/:reference    Project profitability detail
/productivity           Employee productivity
/categories             Category time allocation
/imports                 Spreadsheet uploads and history
```

---

# Trade-offs and intentionally deferred work

I prioritised correctness of the financial model, safe ingestion, and useful project drill-downs over implementing every optional feature.

Given more time, I would add:

### 1. Configurable assumptions UI

Expose:

- Billable categories
- Monthly overhead

The domain already receives these as configuration, so this would primarily be an application/UI change.

### 2. Department drill-down

Allow navigation from a department to individual employees, hours, and cost.

### 3. Monthly cost audit view

Expose how each monthly direct and indirect rate was derived, making reconciliation easier for finance users.

### 4. Import preview

Validate a workbook and show:

- detected periods
- row counts
- warnings
- rows about to be replaced

before committing the import.

### 5. Additional exports

CSV exports and an employee × category matrix.

### 6. Broader multi-year comparison

The persistence model already carries year/month dimensions, but the current interface is primarily designed around the supplied dataset rather than side-by-side multi-year comparison.

---

# Notes on scope

The implementation deliberately favours:

```text
correctness
> recoverable data handling
> explainable calculations
> useful reporting
> feature count
```

The financial calculation layer was kept separate from the UI so that the core business rules remain easy to verify, explain, test, and change during future product discussions.
