# Changelog

## [0.6.0](https://github.com/cheminfo/react-cheminfo/compare/v0.5.0...v0.6.0) (2026-08-18)


### Features

* draw a labelled cartesian frame, and turn the scene slower ([9539698](https://github.com/cheminfo/react-cheminfo/commit/95396985def8628fce680259b1b06a87a0b42b82))

## [0.5.0](https://github.com/cheminfo/react-cheminfo/compare/v0.4.1...v0.5.0) (2026-08-18)


### ⚠ BREAKING CHANGES

* index.html must carry <!--cheminfo:head-->, and <!--cheminfo:body--> unless noscript is false; a page without the head marker throws rather than shipping headless. injectPageMeta no longer rewrites an existing title or description, and insertBeforeHeadEnd is gone from ./core. ogCardHtml returns a promise. origin must be an absolute http(s) address. sitemapXml throws on an empty route table, and cheminfoPrerender validates the route table when the config is evaluated.

### Features

* add DerepFlow to the ecosystem ([c2644e4](https://github.com/cheminfo/react-cheminfo/commit/c2644e4517e1455b7b28e8c017753c87186d73cc))
* follow the route with one shared startDocumentMeta ([ace0668](https://github.com/cheminfo/react-cheminfo/commit/ace06681cc53611ff0a2ae8ce430c7588741fed7))
* write the page head from a template marker ([b747cdd](https://github.com/cheminfo/react-cheminfo/commit/b747cdde9d9fb5801155c80fd0f863b3cbf23c0b))


### Bug Fixes

* keep react, react-dom, blueprint and react-science required peers ([19a25c7](https://github.com/cheminfo/react-cheminfo/commit/19a25c7711a97f8418808c6c6e61258b56b3bcb0))

## [0.4.1](https://github.com/cheminfo/react-cheminfo/compare/v0.4.0...v0.4.1) (2026-08-17)


### Bug Fixes

* write pt's wordmark as PeriodicTable, not pt.cheminfo ([0d7a34c](https://github.com/cheminfo/react-cheminfo/commit/0d7a34c9fe997aa65f94a926b7f14df883fea0dc))

## [0.4.0](https://github.com/cheminfo/react-cheminfo/compare/v0.3.0...v0.4.0) (2026-08-17)


### ⚠ BREAKING CHANGES

* ./core no longer exports renderHtml, renderMarkdown, renderText, assertAtomicNumber, superscript, groupRank, ENCLOSED_WEIGHT, createAtomicOrbitalEvaluator, atomicGridBox, sampleAtomicOrbital, AtomicGridOptions, orbitalId or sampleInProcess. No site imported any of them.

### Features

* add the clipboard, download, delimited, format and colour modules ([13055fc](https://github.com/cheminfo/react-cheminfo/commit/13055fc81cc81536afac5819ceea51f98c570c37))
* add the generic widgets and hooks ([75b3b1a](https://github.com/cheminfo/react-cheminfo/commit/75b3b1a99d45fc9f9fcbe82842c4276cbd8c8fdf))
* add the pedagogy modules ([97ee2bc](https://github.com/cheminfo/react-cheminfo/commit/97ee2bc3ae829e0a71e941fff339d637a22035dd))
* add the routing, document head, persistence and worker modules ([d819286](https://github.com/cheminfo/react-cheminfo/commit/d8192867f8a7a1d355dee2725956f4f20d18836d))
* add the share and embed vocabulary ([acae717](https://github.com/cheminfo/react-cheminfo/commit/acae717657ccc2314fec65bc68833139c302c803))
* add the shared site chrome and identity ([50e1f80](https://github.com/cheminfo/react-cheminfo/commit/50e1f80443200368254c0f22b13ba22b7916bad8))
* add the structure editor on a fourth entry point ([2652b7e](https://github.com/cheminfo/react-cheminfo/commit/2652b7eb95f392fc629caaf5969fb34b22cdd061))
* cite several works, each with what citing it credits ([cdfcee4](https://github.com/cheminfo/react-cheminfo/commit/cdfcee4ac9e69c3fa3435cce85f5f777cedc373c))
* export MenuButton ([e490555](https://github.com/cheminfo/react-cheminfo/commit/e49055546ccd8c9f00dc4d86cd59d032fc8f962d))
* narrow ./core to what a site actually imports ([ce44f69](https://github.com/cheminfo/react-cheminfo/commit/ce44f693da1e920237e4e2f03a78102377c9cab9))
* pick the isovalue and the resolution from the orbital's own shape ([ca81c7b](https://github.com/cheminfo/react-cheminfo/commit/ca81c7b70cbcf7554d207bcf99b60c4a303a20d0))
* reach the new modules from ./core and ./ui ([31c62fb](https://github.com/cheminfo/react-cheminfo/commit/31c62fbbf8da2b83e39124a1eefae6f009575c74))
* read a site's mount path off the page ([d92a0ca](https://github.com/cheminfo/react-cheminfo/commit/d92a0caf4be1f9cf9acb767aed3db917e8f74cd4))


### Bug Fixes

* keep ./structure importable without react-ocl ([7a98a45](https://github.com/cheminfo/react-cheminfo/commit/7a98a455faea9f62c475dda60743cab4c1d80c17))
* ship the stylesheet as a wildcard styles subpath ([c0b76f1](https://github.com/cheminfo/react-cheminfo/commit/c0b76f1397b990df01f5246c2a788a254ab74908))

## [0.3.0](https://github.com/cheminfo/react-cheminfo/compare/v0.2.0...v0.3.0) (2026-08-17)


### Features

* add the atomic orbital viewer on a third entry point ([5068a42](https://github.com/cheminfo/react-cheminfo/commit/5068a42552ef2fed4c23415098dc4910e3b7e381))

## [0.2.0](https://github.com/cheminfo/react-cheminfo/compare/v0.1.0...v0.2.0) (2026-08-16)


### Features

* add the elucidation, equilibrium and polycarp sites ([3525139](https://github.com/cheminfo/react-cheminfo/commit/3525139d574a93e533f037fd7ecbdc63bb4a55a0))


### Bug Fixes

* accept React 18 and react-science 20 as peers ([296c81e](https://github.com/cheminfo/react-cheminfo/commit/296c81ef692d94a4dc78aa874e1461e4b0c05623))
* cite an article number as one page, not a range ([88ccb8e](https://github.com/cheminfo/react-cheminfo/commit/88ccb8ea861ea48ee88911975f02ded5af8110b0))

## 0.1.0 (2026-08-16)


### Features

* cite button and ecosystem menu components ([ed12686](https://github.com/cheminfo/react-cheminfo/commit/ed126861eb2c6e2bb85db734e96366e39faa5dae))


### Miscellaneous Chores

* release 0.1.0 ([b507f99](https://github.com/cheminfo/react-cheminfo/commit/b507f999caf684c15f6758b423eabe7a43359727))
