# HTML Prototype Viewer

Preview HTML files stored in your vault, rendered in a real browser context instead of
being injected into Obsidian's DOM.

Useful if you keep design mockups, exported artifacts, or standalone HTML prototypes
alongside your notes.

## Why an iframe

Plugins that render local HTML by inserting it into the Obsidian document leak the
prototype's global CSS (`body`, `:root`, `*`, `h1`…) into the app's own interface, and
have to block scripts to stay safe.

This plugin loads the file into an `<iframe>` instead. The prototype gets its own
document, its own stylesheet scope and its own script context — nothing bleeds into
Obsidian, and JavaScript simply works.

No local web server is involved: the file is resolved through Obsidian's own resource
URL (`app.vault.getResourcePath`), the same mechanism used to display images from your
vault. This works on desktop and mobile alike.

## Features

- **Opens `.html` and `.htm` files natively.** Click a file in the file explorer and it
  opens in a tab.
- **Device widths.** Switch the render width between full width, desktop (1280 px),
  tablet (834 px) and mobile (390 px) from the tab toolbar.
- **Live reload.** The preview refreshes whenever the file changes on disk — handy when
  iterating on a prototype you edit elsewhere.
- **Embed previews in notes** with an `html-preview` code block.
- **Open in the system browser** from the tab toolbar or the file context menu.
- English and French interface, following Obsidian's language setting.

## Embedding in a note

````markdown
```html-preview
[[My prototype.html]]
height: 700
```
````

The block accepts a wiki link, a vault-relative path, or explicit keys:

| Key | Meaning |
|---|---|
| `path:` (or `file:`) | The HTML file to render |
| `height:` | Preview height in pixels — defaults to the plugin setting |
| `width:` | Fixed render width in pixels — defaults to full width |

The command **Insert a prototype preview in the note** generates the skeleton.

## Settings

| Setting | Description |
|---|---|
| Default render width | Width applied when opening an HTML file |
| Reload automatically | Refresh the preview when the file changes on disk |
| Preview height in notes | Default height for `html-preview` blocks |
| Strict isolation | Drops `allow-same-origin` from the iframe sandbox |

### About strict isolation

By default the iframe keeps its origin, so prototypes can use `localStorage` and load
neighbouring files (images, fonts, sibling pages). This also means a prototype's scripts
run with the same origin as the app.

Enable **Strict isolation** for HTML you did not write yourself: the prototype then runs
in an opaque origin and cannot reach the Obsidian API — at the cost of `localStorage` and
relative file loading.

## Compatibility note

Only one view can own the `.html` extension. If another HTML-rendering plugin (such as
HTML Reader) is enabled at the same time, which one wins depends on plugin load order.
Disable the other one for predictable behaviour.

## Development

```bash
npm install
npm run dev     # watch build
npm run build   # type-check, then production bundle
```

To deploy the build into a vault for testing, point the repo at it — either with the
`OBSIDIAN_VAULT` environment variable, or by writing the vault's absolute path into a
git-ignored `.vault-path` file at the repo root — then:

```bash
npm run build && npm run install-local
```

This copies `main.js`, `manifest.json` and `styles.css` into
`<vault>/.obsidian/plugins/html-prototype-viewer/`. Reload Obsidian afterwards.

## License

MIT — see [LICENSE](LICENSE).
