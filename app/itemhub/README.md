# ItemHub prototype (`/itemhub`)

This route is a **separate prototype** from the main MAPtool flow. It implements the ItemHub MAP Guardrails vendor-facing experience (see `docs/Itemhub/`).

## Scope for development

- **Do not modify** files outside `app/itemhub/` or `lib/itemhub/` when building ItemHub features.
- **Do not change** `app/layout.tsx` or global styles for ItemHub; use `app/itemhub/layout.tsx` for ItemHub-specific shell/nav.
- Put ItemHub-only components in `app/itemhub/components/`, hooks in `app/itemhub/hooks/`, and shared ItemHub logic in `lib/itemhub/`.

## Structure

- `page.tsx` — route entry (served at `maptool.dev/itemhub`)
- `layout.tsx` — ItemHub metadata and optional wrapper
- `components/` — ItemHub UI components
- `hooks/` — ItemHub-only hooks
