# PHASE 1 — Restore Original HOLO Product Body Layout

## Goal
Restore the original HOLO storefront product page body layout before dynamic matrix/configuration wiring.

## Required Layout Structure

- Product gallery left column
- Configurator right column
- Quantity matrix cards
- Delivery cards
- Sticky pricing card
- Description accordions
- Related products
- Original spacing and typography

## Important

This phase restores UI structure ONLY.

Do NOT:
- hardcode option groups
- hardcode pricing logic
- hardcode quantities
- hardcode conditional logic

The layout must become a reusable shell for:
- resolvedProductConfigEngine
- matrixPricingResolver
- live pricing hydration
- commerce state

## Future Wiring

Phase 2:
- backend optionGroups hydration

Phase 3:
- matrix pricing hydration

Phase 4:
- conditional rendering engine

Phase 5:
- live cart + checkout state
