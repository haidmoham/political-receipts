# Receipts website

The public website belongs at https://receipts.shin86.dev/.
Its deep blue background, cream text, coral accents, and serif headings follow shin86.dev.
Member lookup is the entry point. Cards and candidate comparisons use the same public snapshot as the extension.

Run `npm run build:site` to build the extension and the separate static website output.
Sites uses `.openai/hosting.json`. Package only `out` for the website.
The website does not include the extension manifest, background worker, popup, or raw evidence files.

Website publication does not publish the Chrome extension or RuneLite plugin.
The remaining Chrome release requirements stay in issue #1 and `docs/launch-later.md`.
