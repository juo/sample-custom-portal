# Juo Sample Custom Portal (Custom Theme)

Sample reference repository showing how to build a custom portal with custom Juo blocks.

This project is designed for early adopters as a **template**:

- mock-first local setup,
- extensible custom blocks,
- editor mode compatibility,
- clear path to real API mode.

## Requirements

- Node.js 20+
- A JavaScript package manager (`npm`, `pnpm`, `yarn`, or `bun`)
- A Juo account with access to `https://admin.juo.io` (required for Editor Mode)

## Quickstart

```bash
<package-manager> install
cp .env.example .env
<package-manager> run dev
```

Open [http://localhost:5180](http://localhost:5180).

Examples:

```bash
# npm
npm install && cp .env.example .env && npm run dev

# pnpm
pnpm install && cp .env.example .env && pnpm dev

# yarn
yarn install && cp .env.example .env && yarn dev

# bun
bun install && cp .env.example .env && bun run dev
```

## Available Scripts

```bash
<package-manager> run dev          # start local dev server
<package-manager> run typecheck    # type-check app + plugin config
<package-manager> run lint         # quality gate (typecheck + formatting check)
<package-manager> run format       # run Prettier and write formatted files
<package-manager> run format:check # verify formatting without writing changes
<package-manager> run test         # baseline test gate
<package-manager> run build        # typecheck + production build
<package-manager> run preview      # preview built app
<package-manager> run ci           # lint + test + build
```

Notes:

- With `pnpm`/`yarn`, you can use `<package-manager> <script>` for most scripts (for example `pnpm dev`, `yarn dev`).
- With `npm`, use `npm run <script>`.

## Environment Variables

| Variable                         | Required      | Default                                       | Description                                                                           |
| -------------------------------- | ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `VITE_MOCK_MODE`                 | No            | `true`                                        | Use mock adapters (`true`) or real API adapters (`false`).                            |
| `VITE_API_URL`                   | Real API mode | `https://api.juo.io`                          | Backend root URL used by login + API integrations.                                    |
| `VITE_SHOP_DOMAIN`               | Real API mode | `custom-box.myshopify.com`                    | Shopify domain used for auth + request headers. Also used to derive editor store URL. |
| `VITE_BLOCKS_EXTENSIONS_VERSION` | No            | `1.12.0-alpha.3`                              | Extension package version used in default CDN URL.                                    |
| `VITE_BLOCKS_EXTENSIONS_URL`     | No            | Derived from `VITE_BLOCKS_EXTENSIONS_VERSION` | Optional full override for remote extension blocks URL.                               |

## Mock Mode vs Real API Mode

### Mock Mode (default)

- Keep `VITE_MOCK_MODE=true`.
- No backend required.
- Great for UI iteration and block development.

### Real API Mode

Set:

```env
VITE_MOCK_MODE=false
VITE_API_URL=http://localhost:3000
VITE_SHOP_DOMAIN=your-shop.myshopify.com
```

The frontend sends API requests to `/api/*` (proxied to backend in Vite dev server).

## Editor Mode

There are two ways to open the editor against your local portal:

**Embedded local editor (aligned with `juo create` scaffolding).** The dev server
serves an embedded editor at `/editor` (loaded from the Juo CDN) that points at
your running portal:

- `http://localhost:5180/editor`

The devtools overlay is injected into the local preview automatically. Both are
dev-only — `apply: "serve"` keeps the editor and devtools embeds out of the
production `vite build`.

**External editor.** The editor is also hosted as an external service at:

- `https://admin.juo.io/store/${store}/editor`

Run your local dev server (`<package-manager> run dev`), then open your local portal URL with `?editor=true`.

You must be signed into a Juo account that has access to the target store editor.

Example:

- `http://localhost:5180?editor=true`

The plugin logs the external editor URL with your local portal attached via
`portal-url`, deriving the store slug from `VITE_SHOP_DOMAIN`
(for example, `custom-box.myshopify.com` -> `custom-box`).

## Route Contract

The sample uses three routes:

- `/login`
- `/`
- `/orders`
