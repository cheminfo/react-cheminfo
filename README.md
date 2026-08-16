# react-cheminfo

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Assembled React components shared by the `*.cheminfo.org` sites.

## What it is

[`react-science`](https://www.npmjs.com/package/react-science) gives us
**primitives** — `Toolbar`, `Accordion`, `SplitPane`, `Button`. This package is
the layer above: **assemblies**, a component you hand data to and it delivers a
whole feature, its copy, its interactions and its logic included. A site
normally depends on both.

## Installation

```console
npm i react-cheminfo
```

`react`, `react-dom`, `@blueprintjs/core` and `react-science` are peer
dependencies: a site already has them, and a second copy of `react-science`
would mean two Blueprint style trees in one page.

## Two entry points

| Import                | Holds                                                                         |
| --------------------- | ----------------------------------------------------------------------------- |
| `react-cheminfo/ui`   | the React components                                                          |
| `react-cheminfo/core` | the framework-free logic — citation formats, the site list — with no React in |

A backend serving an RIS endpoint, and every unit test of that logic, therefore
load no React at all.

The sources are organised the other way round — one folder per component
(`src/citation`, `src/ecosystem`), each holding a `core/` and a `ui/` half — and
`src/core.ts` and `src/ui.ts` are the barrels the two entry points point at.
`src/shared` holds what more than one of them is built on: `MenuButton`, the
shape every button of a site header takes, which is why `CiteButton` and
`EcosystemButton` differ only in their glyph and their menu, and why both accept
the `compact` and `placement` props of the exported `HeaderButtonProps`.

## Components

### `CiteButton`

The Cite entry of a site header: one button opening the work at its DOI, copying
its reference in the style a journal asks for, and saving the files a reference
manager imports.

```tsx
import { CiteButton } from 'react-cheminfo/ui';

<CiteButton reference={PAPER} />;
```

- **HTML** and **Markdown**, each in the four styles chemists are asked for —
  ACS, Nature, RSC and Wiley. An HTML copy is written to the clipboard in both
  flavours, so Word and Google Docs keep the emphasis while a plain editor
  receives a clean line; that is why plain text is not a separate entry.
- **BibTeX**, **RIS** and the **DOI link**, which carry no style.
- **RIS and BibTeX files**, served with the MIME types Zotero, Mendeley and
  EndNote recognise, so opening the saved file imports it.
- A hover **preview** of exactly what each entry copies or saves.
- `compact` drops the text and the caret, leaving the icon alone to open the
  menu, for a header that has run out of room. The label stays what the pointer
  and a screen reader are told.

Adding a style means one function in `citation/core/segments.ts` and one entry
in `CITATION_STYLES` — the three output formats and the preview follow.

### `EcosystemButton`

The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo and the two colours it owns.

```tsx
import { EcosystemButton } from 'react-cheminfo/ui';

<EcosystemButton currentSiteId="vcl" />;
```

- `currentSiteId` is the one thing that differs per site: that tile is shown
  with a _you are here_ label and is not a link. Passing nothing links all ten.
- `compact` drops the text and the caret, leaving the icon alone to open the
  menu, for a header that has run out of room. The label stays what the pointer
  and a screen reader are told.
- A tile **lights up in the colour of the site it opens**, so running the
  pointer down the grid is what makes the ten pairs of colours read.

Each mark keeps the geometry of that site's own logo where it has one, redrawn
on a plate of the site's own colour so ten marks from ten sites still read as
one row, and carrying the site's answering colour on exactly one element —
which is what stops it collapsing into a flat shape at 16 px.

**NMRium** keeps its artwork whole: the symbol is the one from `Logo.tsx` of the
NMRium sources, in its orange, on the plum its logo sets the rest of the
wordmark in. **ChemCalc** is the one mark that is ours — its logo is an atom
that is unreadable small, so the tile draws what the tool returns, an isotopic
pattern, in ChemCalc's own indigo and teal.

The colours a name is set in are the site's own and are not retuned to reach the
4.5:1 of body text: ChemCalc's teal and NMRium's orange both land just under it,
which is why a name is set bold, where 3:1 is the threshold.

## Styling

**No stylesheet, nothing for a consumer to import.** Every rule is a
module-level `CSSProperties` constant applied with `style`, the way `react-mf`
does it — so there is no import step, no load-order surprise, and no specificity
fight with Blueprint, since an inline rule outranks every selector.

A component never hard-codes a site's identity: what differs per site is passed
in as props, or read from a CSS variable (`--brand`, `--brand-alt`, `--accent`)
so each site keeps the two colours it owns.

## Development

```console
npm run dev
```

opens Storybook on <http://localhost:10815> — every component of the package,
under every prop it takes, with the controls to set them and the snippet that
reproduces what is on show. The **Brand** toolbar retunes `--brand` /
`--brand-alt` / `--accent` on the canvas, so you can watch a component carry a
site's two colours. Components land there as they move into the package.

A story is a `*.stories.tsx` file in `stories/`, written in CSF: a default
export naming the component, and one export per state the sites use it in. The
prose and the types of the controls come from the props' own JSDoc, read off the
source by `@storybook/addon-docs`, so a component is documented by documenting
its props — never by writing a page for it. `stories/headerButton.ts` already
describes the controls every header button shares.

```console
npm run build-storybook   # storybook-static/
```

is what GitHub Pages serves at <https://cheminfo.github.io/react-cheminfo/>,
built and deployed by `.github/workflows/pages.yml` on every push to `main`.

## Testing

Unit tests cover the framework-free half, which is where the citation formats
and the site list live:

```console
npm run test         # vitest + type-check + eslint + prettier
```

The components themselves are almost entirely interaction — Blueprint popovers
with hover delays, submenus, clipboard writes in two flavours, file downloads —
so they are tested in a real browser rather than a simulated DOM:

```console
npx playwright install --with-deps chromium   # once
npm run test-e2e                              # or test-e2e-ui to watch
```

`npm run test-e2e` starts Storybook itself and drives each story on its own
address (`/iframe.html?id=…`), so there is nothing to launch first. It is a
separate command from `npm run test`, because it needs a browser that a plain CI
job does not have; its own workflow installs one.

## Testing a local build

Before publishing, test the **packed artifact** rather than the sources: it is
what a site will actually install, and it is where a missing file or a wrong
`exports` entry shows up.

```console
npm run tsc                # build lib/
npm pack                   # react-cheminfo-0.0.0.tgz
```

Then, from a throwaway app — or from the site you are about to adopt it in:

```console
npm i ../react-cheminfo/react-cheminfo-0.0.0.tgz
```

Import from both entry points, so the check covers the framework-free half too:

```tsx
import { CITATION_STYLES, formatCitation } from 'react-cheminfo/core';
import { CiteButton, EcosystemButton } from 'react-cheminfo/ui';
```

Reinstall the tarball after every `npm pack` — npm caches it by name and
version, and this package stays at `0.0.0` until release-please cuts the first
one.

## [API Documentation](https://cheminfo.github.io/react-cheminfo/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/react-cheminfo.svg
[npm-url]: https://www.npmjs.com/package/react-cheminfo
[ci-image]: https://github.com/cheminfo/react-cheminfo/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/react-cheminfo/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/react-cheminfo.svg
[codecov-url]: https://codecov.io/gh/cheminfo/react-cheminfo
[download-image]: https://img.shields.io/npm/dm/react-cheminfo.svg
[download-url]: https://www.npmjs.com/package/react-cheminfo
