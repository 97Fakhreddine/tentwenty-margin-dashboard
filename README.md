# Tentwenty Margin Dashboard

A local financial operations dashboard that turns timesheets, salary data,
and project pricing into project profitability insights.

## Architecture

The application separates four concerns:

- Presentation — Next.js routes and UI components
- Application — use-case orchestration
- Domain — financial calculations and business rules
- Infrastructure — spreadsheet parsing, persistence, and repositories

The domain layer is framework-independent and contains no React, Next.js,
spreadsheet, or database dependencies.

## Development

```bash
pnpm install
pnpm dev
```
