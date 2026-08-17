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

## Entry points

Subpaths are **bundle boundaries, not taxonomy**: a feature gets its own door
only when it drags a heavy dependency behind it.

| Import                      | Holds                                        | Costs                 |
| --------------------------- | -------------------------------------------- | --------------------- |
| `react-cheminfo/core`       | every framework-free helper — 151 exports    | nothing               |
| `react-cheminfo/ui`         | every React component and hook — 71 exports  | React                 |
| `react-cheminfo/orbital`    | the 3D atomic-orbital viewer                 | React, molstar        |
| `react-cheminfo/structure`  | the structure editor and renderer            | React, react-ocl, OCL |
| `react-cheminfo/chrome.css` | the shared tokens and site-header stylesheet | nothing               |

A backend serving an RIS endpoint, a prerender script writing a sitemap, and
every unit test of that logic therefore load no React at all — and a worker
sampling an orbital loads neither React nor molstar. `openchemlib`, `react-ocl`
and `molstar` are **optional** peers, so a site that only wants the Tools menu
downloads none of them.

`chrome.css` is served from `src/` because `tsc` does not copy CSS into `lib`.

## What is in it

| Area                    | `…/core`                                                                                                 | `…/ui`                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Site identity**       | `siteById`, `findSiteByHost`, `siteTokensCss`, `siteThemeColor`, `renderEcosystemLinksHtml`              | `SiteMark`, `Wordmark`, `SiteTheme`, `SiteTile`, `EcosystemButton`, `EcosystemLinks`                                                             |
| **Chrome**              | —                                                                                                        | `SiteHeader`, `SiteFooter`, `NavLink`, `NavMenuButton`, `MenuButton`, `useCompactHeader`                                                         |
| **Citation**            | `formatCitation`, `formatCitations`, `citationSegments`, `downloadCitation`, `citedReferences`, `doiUrl` | `CiteButton`, `CitationMenu`, `CitationPreview`                                                                                                  |
| **Share & embed**       | `parseShareConfig`, `applyShareConfig`, `buildShareUrl`, `buildEmbedCode`, `isHidden`, the param codecs  | `ShareDialog`, `ShareButton`, `HiddenPartsProvider`, `PagePart`, `useIsHidden`                                                                   |
| **Routing & head**      | `createTabRouter`, `createPageAddresses`, `adoptLegacyHashAddress`, `writeDocumentMeta`, `canonicalLink` | —                                                                                                                                                |
| **Pedagogy**            | `parseGlossaryMarkers`, `localStorageProgressStore`, `progressSummary`, `finishValidation`               | `GlossaryText`, `SyntaxTooltip`, `HintLadder`, `ExerciseActions`, `ExerciseProgressHeader`, `TutorialStepStrip`, `ReferenceGrid`, `TestCaseList` |
| **Clipboard & files**   | `writeToClipboard`, `downloadBlob`, `downloadText`, `sanitizeFileName`, `toDelimited`, `readDelimited`   | `CopyButton`, `CodeBlock`, `DelimitedTextDialog`                                                                                                 |
| **Formatting & colour** | `formatInteger`, `formatDecimal`, `formatBytes`, `pluralize`, `readableInk`, `contrastRatio`             | `ColorScaleLegend`                                                                                                                               |
| **Widgets**             | `CREDITS`, `credits`                                                                                     | `ErrorBoundary`, `CollapsibleSection`, `CapsuleFilter`, `HelpTooltip`, `CreditsList`                                                             |
| **Hooks & state**       | `createWorkerChannel`                                                                                    | `persistBucket`, `useDebouncedValue`, `useContainerSize`, `useListKeyboardNavigation`, `useDisclosure`                                           |
| **Chemistry**           | `atomicOrbitalsOf`, `configurationOf`, `classifyMolfile`, `readStructure`                                | `AtomicOrbitalViewer` (`/orbital`), `StructureEditor`, `Structure` (`/structure`)                                                                |

Everything in that table is exported from `./core`, `./ui` or `./structure` and
nothing else is: the sub-components a component is built from, the parsers a
helper calls and the internals of a hook stay inside the package, reachable only
by their own path. If it is exported, it is supported.

The rule for a new site is short: **`react-cheminfo` first, `react-science`
second, your own code last.** The full import table and the checklist live in
`websites/CLAUDE.md`.

## Seeing it

Storybook is the demo, and every exported component has one — 210 stories:

```console
npm run dev              # the book on http://localhost:10815
npm run test-e2e         # Playwright opens all 210 and fails on any console error
```

The **Brand** toolbar at the top retunes `--brand` / `--brand-alt`, so any story
can be read as it would look on any site of the family.

The sources are organised the other way round — one folder per feature
(`src/citation`, `src/ecosystem`, `src/share`, `src/pedagogy`, …), each holding a
`core/` and a `ui/` half — and `src/core.ts` and `src/ui.ts` are the barrels the
two entry points point at. ESLint forbids a `core/` folder from importing
`react`, `react-dom` or anything under a `ui/`, which is what keeps the
framework-free entry point honest.
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

A site is often built on more than one work — the tool it wraps, and the
platform it runs on — and a reader handed two references has to be told what is
what. Pass `works` rather than `reference`, each one carrying the words that say
what citing it credits:

```tsx
<CiteButton
  works={[
    {
      reference: SURGE_PAPER,
      what: 'The isomer generator',
      note: 'Cite it for the enumeration: every structure here comes from surge.',
    },
    {
      reference: PLATFORM_PAPER,
      what: 'The browser platform',
      note: 'Cite it for the site itself.',
    },
  ]}
/>
```

The menu then opens on a line asking for all of them — `guidance` writes that
line when the default does not fit — and lists every work with what it covers.
Each work holds its own article and its own reference, in the default style; the
sections below carry the whole set at once, so one copy pastes both citations and
one saved file holds both records (`references.ris`). Nothing changes for a site
asking for a single work.

### `EcosystemButton`

The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo and the two colours it owns.

```tsx
import { EcosystemButton } from 'react-cheminfo/ui';

<EcosystemButton currentSiteId="vcl" />;
```

- `currentSiteId` is the one thing that differs per site: that tile is shown
  with a _you are here_ label and is not a link. Passing nothing links them all.
- `compact` drops the text and the caret, leaving the icon alone to open the
  menu, for a header that has run out of room. The label stays what the pointer
  and a screen reader are told.
- A tile **lights up in the colour of the site it opens**, so running the
  pointer down the grid is what makes the pairs of colours read.

### `AtomicOrbitalViewer`

One hydrogen-like atomic orbital, screened by Slater's rules, sampled in the
browser and drawn as a signed isosurface with molstar.

```tsx
import { AtomicOrbitalViewer } from 'react-cheminfo/orbital';

<AtomicOrbitalViewer atomicNumber={26} orbitalId="3dz2" />;
```

- The **maths is exact**, not a cartoon: a hydrogen-like radial function with its
  `n − ℓ − 1` nodes, times a real spherical harmonic with its ℓ angular ones.
  The Slater orbital a hybridisation model uses is nodeless and would draw a 3s
  exactly like a 1s, only fatter.
- The canvas is behind a `React.lazy` boundary and **nothing this entry point
  exports pulls molstar in statically**, so a page that never draws an orbital
  never downloads it.
- A **WebGL probe runs before molstar is touched** (`probeViewerCapability`), so
  a locked-down school machine gets a sentence rather than a blank rectangle.
- Every orbital is drawn at one canonical size. Molstar's camera clamps its near
  plane, so uranium's 4f — which reaches 0.35 Å — would otherwise stay a dot in
  the corner; the true extent is reported as ⟨r⟩ instead.
- The **isovalue is a weighted quantile** of the samples (`isocontourCutoff`),
  never molstar's `computeOrbitalIsocontourValues`: that one abandons any field
  whose mean ψ² falls under an absolute `1e-5`, which reads the orbital's _size_
  rather than its shape, and left 2588 of 7460 orbitals blank. A quantile has no
  scale of its own.
- The isosurface is extracted **on the CPU** (`tryUseGpu: false`). Molstar's GPU
  marching cubes quantises the field to 255 steps on upload, which terraces
  xenon's 4p, and pits a diffuse outer lobe with voxel-sized dimples. The
  surface is a thin shell whatever the box holds, so the CPU path costs 13–44 ms
  even at 152³.
- `resolution` takes a `{ floor, cap }` pair as well as a number, and then each
  orbital picks its own: one resolution for a whole table leaves xenon's
  innermost 4p lobe spanning 6.6 voxels while the outer one spans 41. A nodeless
  orbital stays on the floor and costs nothing extra.
- `sample` accepts a worker-backed sampler when a site would rather not spend
  ~25 ms of its main thread per orbital. `runAtomicSample` from
  `react-cheminfo/core` is the function that worker calls, and it imports
  neither React nor molstar.

The maths is exported on its own from `react-cheminfo/core` —
`atomicOrbitalsOf`, `configurationOf`, `slaterScreening`, `radialProfile`,
`radialNodeRadii`, `sampleAtomicOrbital`, `orbitalContour` — so a site can draw
its own radial plot, list an element's orbitals, or print a screened charge
without mounting anything.

Each mark keeps the geometry of that site's own logo where it has one, redrawn
on a plate of the site's own colour so every mark of the family still reads as
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
