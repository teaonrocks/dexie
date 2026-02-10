# Dexie

Dexie is a slides app that doesn't suck. It focuses on speed, great defaults, and a clean editing experience for building beautiful decks quickly.

Future direction: add AI features that can agentically draft and refine slide decks, while keeping humans in control of the final result.

## Local development

Install dependencies with `pnpm install` (or `npm install`).

Run the development server with `pnpm dev` (or `npm run dev`).

Open `http://localhost:5173/` in your browser to see the app.

## Canvas UI migration notes

The right properties panel now uses a custom shadcn sidebar instead of tldraw's default style panel.

- The custom panel can be toggled with `VITE_CUSTOM_PROPERTIES_SIDEBAR`.
- Default behavior enables the custom sidebar.
- Set `VITE_CUSTOM_PROPERTIES_SIDEBAR=false` to fall back to tldraw's built-in style panel.

### Manual validation checklist

- Verify no selection shows defaults for the next shape.
- Verify single shape selection updates color, fill, dash, size, font, and opacity.
- Verify mixed multi-selection shows "Mixed values" and updates all selected shapes.
- Verify switching slides preserves expected selection/style behavior.
- Verify fallback mode (`VITE_CUSTOM_PROPERTIES_SIDEBAR=false`) restores the default tldraw panel.

### Next migration steps

- Move top toolbar controls into app-owned components and disable tldraw toolbar.
- Replace context and quick actions menus with app-owned actions.
- Migrate helper/zoom controls after toolbar parity is complete.
- Remove `tldraw/tldraw.css` only after all remaining tldraw UI chrome is replaced.
