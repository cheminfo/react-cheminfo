# Changelog

## [0.24.0](https://github.com/cheminfo/react-cheminfo/compare/v0.23.0...v0.24.0) (2026-09-26)


### ⚠ BREAKING CHANGES

* install openchemlib with the package and require React 19
* give conformers their own door, so core still costs nothing

### Features

* draw a clipboard cursor over a copyable value ([b87ab02](https://github.com/cheminfo/react-cheminfo/commit/b87ab02ea3bd9e99a968cce18c618bdffe237770))
* generate conformers here, and refine them with GFN2-xTB on demand ([05ec3a3](https://github.com/cheminfo/react-cheminfo/commit/05ec3a393af9ec2388d961610298534d310f9b3a))
* give an atomic orbital the energy needed to remove its electron ([0753c9c](https://github.com/cheminfo/react-cheminfo/commit/0753c9c1bf4e0257860a8e688aa05dde10d04a33))
* own the translation of a site, from ICU catalogs to the overlay session ([8ebcd8b](https://github.com/cheminfo/react-cheminfo/commit/8ebcd8bfe4bedf5fcee40cc3bef0937fa9ae2cfe))


### Bug Fixes

* declare xtb-wasm as a devDependency, so tsc resolves its types ([5ec718e](https://github.com/cheminfo/react-cheminfo/commit/5ec718eb1475698af03e3cb99362bb69eb938d70))
* give conformers their own door, so core still costs nothing ([812e095](https://github.com/cheminfo/react-cheminfo/commit/812e095d58eef0ccbf330cea6609adbc91387b5e))
* install openchemlib with the package and require React 19 ([4c3b530](https://github.com/cheminfo/react-cheminfo/commit/4c3b530cb49a243cb656f54132d139350cac79de))

## [0.23.0](https://github.com/cheminfo/react-cheminfo/compare/v0.22.0...v0.23.0) (2026-09-25)


### ⚠ BREAKING CHANGES

* ProjectionSamples takes `groupings` instead of `groups`, `groupOrder`, `groupLabel` and `groupColors`; `colorBy` names a grouping or `none`, and `ProjectionColorBy` is removed; `resolveProjectionGroups` takes one grouping.

### Features

* compare two groupings on one projection map ([6ff380f](https://github.com/cheminfo/react-cheminfo/commit/6ff380f1c5f3d6e45573a58480ec608ad79f7f1a))

## [0.22.0](https://github.com/cheminfo/react-cheminfo/compare/v0.21.0...v0.22.0) (2026-09-24)


### Features

* copy values with a click and keep the tool text unselectable ([3540f97](https://github.com/cheminfo/react-cheminfo/commit/3540f97019fcb6d4d785fcb388468a7f17581ccc))
* **ecosystem:** add the three practice sites under a Practice topic ([5d5f750](https://github.com/cheminfo/react-cheminfo/commit/5d5f7505b30ad92186b4aaf6ff4eef302c281893))


### Bug Fixes

* **build:** read the commit of a build made in a linked git worktree ([dcfe638](https://github.com/cheminfo/react-cheminfo/commit/dcfe6386f4c9ecde0c901f66686f9b0bc6135485))
* copy a value when the click lands on one of its children ([cbc5ef0](https://github.com/cheminfo/react-cheminfo/commit/cbc5ef078a258fc9403eac5aa4787db412fc9da7))

## [0.21.0](https://github.com/cheminfo/react-cheminfo/compare/v0.20.0...v0.21.0) (2026-09-18)


### Features

* **chrome:** draw a site outside the family from its own record ([b8258b6](https://github.com/cheminfo/react-cheminfo/commit/b8258b651950388f19de891635f209f1d98d1933))

## [0.20.0](https://github.com/cheminfo/react-cheminfo/compare/v0.19.0...v0.20.0) (2026-09-18)


### Features

* **about:** date the build badge, and name an unreleased build by its commit ([185c32a](https://github.com/cheminfo/react-cheminfo/commit/185c32ac30203bf11ebeeb2b600b08ec1f4e0ac8))

## [0.19.0](https://github.com/cheminfo/react-cheminfo/compare/v0.18.0...v0.19.0) (2026-09-18)


### Features

* **about:** show the version in the hero and name only public sources ([a68081d](https://github.com/cheminfo/react-cheminfo/commit/a68081d58ed4ed3c2a5b52e9920c0fff5ed96973))
* **molecule3d:** carry the camera in a shareable link ([333d480](https://github.com/cheminfo/react-cheminfo/commit/333d48046e3950bb7a0d10a222bf97e811cb4a57))

## [0.18.0](https://github.com/cheminfo/react-cheminfo/compare/v0.17.0...v0.18.0) (2026-09-18)


### Features

* **structure:** explain the editor toolbar and its keys ([b2e4462](https://github.com/cheminfo/react-cheminfo/commit/b2e44628ccd8402eb1daa7b3dc2b02e0c227e7f1))
* **structure:** hand the drawn molecule to onChange ([375fbd8](https://github.com/cheminfo/react-cheminfo/commit/375fbd8bca79650492847ebbcdd9b0eaecb23008))


### Bug Fixes

* **structure:** deliver the last edit when the editor unmounts ([51ccf0f](https://github.com/cheminfo/react-cheminfo/commit/51ccf0fc4d86efd7f518115586c2ea8963c012d3))

## [0.17.0](https://github.com/cheminfo/react-cheminfo/compare/v0.16.0...v0.17.0) (2026-09-17)


### Features

* **parallel:** keep several intervals per axis, and move an axis by its name ([731fa09](https://github.com/cheminfo/react-cheminfo/commit/731fa09c585001012b68d5dc44587220514cbd4b))


### Bug Fixes

* **parallel:** break a line at an axis the row has no value on ([41ccbde](https://github.com/cheminfo/react-cheminfo/commit/41ccbdefbcb4312d64e8a9aa298a1b802ca84835))

## [0.16.0](https://github.com/cheminfo/react-cheminfo/compare/v0.15.0...v0.16.0) (2026-09-17)


### Features

* **ecosystem:** add dbe, ocl-cache, symmetry and osiris ([e940edf](https://github.com/cheminfo/react-cheminfo/commit/e940edfed8d5cb817e8b5e699474241fb1c705ae))
* **parallel:** add ParallelCoordinates ([05c2a14](https://github.com/cheminfo/react-cheminfo/commit/05c2a1415b4116f576c5a3cd84c3fc83d874c3e3))


### Bug Fixes

* **ecosystem:** drop ocl-cache, which is not indexed ([4171995](https://github.com/cheminfo/react-cheminfo/commit/417199513e3f29161bd26d5dd356d48e270c3d24))
* **structure:** size the editor when its toolbar arrives ([c25464a](https://github.com/cheminfo/react-cheminfo/commit/c25464a650a3bf9bb7e9ccabeefd3036cedcdc65))

## [0.15.0](https://github.com/cheminfo/react-cheminfo/compare/v0.14.0...v0.15.0) (2026-09-16)


### Features

* **about:** say which build is running ([5f54f65](https://github.com/cheminfo/react-cheminfo/commit/5f54f65f6295d15bd4f5bc5461d34f334c46beb8))

## [0.14.0](https://github.com/cheminfo/react-cheminfo/compare/v0.13.0...v0.14.0) (2026-09-15)


### Features

* **molecule3d:** add frameNewMolecule to frame a new molecule from the front ([8c5525f](https://github.com/cheminfo/react-cheminfo/commit/8c5525ff3a60ae011a9474c21f5060d11ad7603b))

## [0.13.0](https://github.com/cheminfo/react-cheminfo/compare/v0.12.0...v0.13.0) (2026-09-15)


### ⚠ BREAKING CHANGES

* persistBucket and its types (BucketRead, PersistBucketOptions, PersistedBucket) are exported from react-cheminfo/core only.

### Features

* remove the persistBucket re-export from react-cheminfo/ui ([85421e0](https://github.com/cheminfo/react-cheminfo/commit/85421e0ab381cf570b32c817d47c0ae7185cd454))


### Bug Fixes

* **chrome:** name a text NavLink by its label, not its title ([8cd9a87](https://github.com/cheminfo/react-cheminfo/commit/8cd9a876b57c6428c3a27d1af3bfbd0d05ced349))

## [0.12.0](https://github.com/cheminfo/react-cheminfo/compare/v0.11.0...v0.12.0) (2026-09-15)


### ⚠ BREAKING CHANGES

* spectra moves to react-cheminfo/spectra; persistBucket, toError, scatterGroupSpread, scatterPairEllipse and CloudGesture move to react-cheminfo/core; GlossaryTooltipBody is renamed GlossaryDefinition; ColorScaleLegend `stops` is now `scale`; the colourBlindSafe palette id is colorBlindSafe; react-markdown, rehype-raw and rehype-sanitize are optional peers of react-cheminfo/slides; removed createPageAddresses, documentTitle, canonicalLink, siteThemeColor, renderEcosystemLinksHtml, VIRIDIS_SCALE, colorFromScale, swatchFromScale, rowsToDelimited, formatTalkOrigin, TALK_ORIGIN_PARAM, CloudPointLayer, the deploy checker from react-cheminfo/core, and the OverlayBar onCollapsedChange and ScatterEllipseLayer onSkippedGroups props.

### Features

* consolidate the library and add molecule3d, share presets and site providers ([856f587](https://github.com/cheminfo/react-cheminfo/commit/856f587c13e168f058c9a929ea9efeee0614e969))


### Bug Fixes

* **slides:** install the Markdown stack as dependencies ([7639dfd](https://github.com/cheminfo/react-cheminfo/commit/7639dfd2e1d853b50e42787c8792d91f25ee8875))

## [0.11.0](https://github.com/cheminfo/react-cheminfo/compare/v0.10.0...v0.11.0) (2026-09-10)


### Features

* **ecosystem:** add metabo, and let a nav item be greyed ([06aa274](https://github.com/cheminfo/react-cheminfo/commit/06aa2745b75314b896cbc997970e4402275f0f4e))
* **scatter3d:** a cloud you can turn, with a glass shell per group ([0a93484](https://github.com/cheminfo/react-cheminfo/commit/0a93484825487779a5049a721f58f69c1a43eb32))
* **scatter:** open a point on a double click ([7be2da8](https://github.com/cheminfo/react-cheminfo/commit/7be2da8954ac927c3c99535d05500011294c8a66))


### Bug Fixes

* **download:** paint the key into the saved figure ([acf09c5](https://github.com/cheminfo/react-cheminfo/commit/acf09c55ef1a04a949365943180a3c5a24c48fe9))

## [0.10.0](https://github.com/cheminfo/react-cheminfo/compare/v0.9.0...v0.10.0) (2026-09-09)


### Features

* **color:** choose the colours a quantity is read with ([0309867](https://github.com/cheminfo/react-cheminfo/commit/030986710033d279b7a5352f9122011497eb7c5a))
* **credits:** register SQLite Wasm, PouchDB and ChemExper ([933b4f0](https://github.com/cheminfo/react-cheminfo/commit/933b4f0a755a5b7d9a5f821ef42035b4bc92b408))
* draw a dimension reduction, and the charts it is read in ([692f01a](https://github.com/cheminfo/react-cheminfo/commit/692f01a22cb5a55d11da056d240d8768ea6e30be))
* **ecosystem:** add database.cheminfo.org ([9276922](https://github.com/cheminfo/react-cheminfo/commit/92769225216a809c32592ebd1c8834acbaf5853d))


### Bug Fixes

* **e2e:** follow the bar to where it now folds, and list the two new stories ([63875d5](https://github.com/cheminfo/react-cheminfo/commit/63875d5e2c416d805cdf3b45f019d59d2542ea9f))
* **share:** write a plus as %2B, so every reader reads it back ([0a29a7d](https://github.com/cheminfo/react-cheminfo/commit/0a29a7de9a04c8c210f7f2d30eaf8ad0966ec0f4))

## [0.9.0](https://github.com/cheminfo/react-cheminfo/compare/v0.8.0...v0.9.0) (2026-08-23)


### Features

* add the shared slideshow, the About page and a token guard ([a20d5c3](https://github.com/cheminfo/react-cheminfo/commit/a20d5c36c640f39d0135c00fbcb920fa891a5ab8))
* **credits:** register Lexical, KaTeX, dnd kit, Signals, Fastify and SQLite ([63c951e](https://github.com/cheminfo/react-cheminfo/commit/63c951e9ba6662705927526b657b43b147d4d1c9))
* **orbital:** export createAtomicOrbitalEvaluator, and clear every surface ([4c88758](https://github.com/cheminfo/react-cheminfo/commit/4c88758913e95ddb607335831f28e9914b7aa6e8))
* **slides:** add the embed layout, so a live tool is a slide ([5110880](https://github.com/cheminfo/react-cheminfo/commit/5110880f08c1eb14ed1210de1750d4d632f56fd0))
* **slides:** let the site own fullscreen, and export isModifiedClick ([b9993f7](https://github.com/cheminfo/react-cheminfo/commit/b9993f73e13359d44856d4f5bc5b4af25852ae2b))
* **slides:** play a deck away from home, and read one without React ([e0bccca](https://github.com/cheminfo/react-cheminfo/commit/e0bccca4a8a64d1095af3933c89d7b1687eb20ee))
* **slides:** show a note when nothing is published, and demo the new components ([633010e](https://github.com/cheminfo/react-cheminfo/commit/633010e09ea26508cfcc75f91cc5327e815b8f00))


### Bug Fixes

* **slides:** the embedded tool fills the slide ([54f5ff9](https://github.com/cheminfo/react-cheminfo/commit/54f5ff9190abbd7976e39d659cd81ef1e84fd977))

## [0.8.0](https://github.com/cheminfo/react-cheminfo/compare/v0.7.0...v0.8.0) (2026-08-18)


### Features

* **citation:** add the teaching paper as a citable work ([9348149](https://github.com/cheminfo/react-cheminfo/commit/9348149257465a72c9972b71f78dbcfc10571b76))
* let a strip take any step carrying a title and a level ([3fdd1ec](https://github.com/cheminfo/react-cheminfo/commit/3fdd1ecd080604304c4ce6ea05082e1e720f847b))


### Bug Fixes

* make every tutorial step button the same square so strips line up ([c0e8751](https://github.com/cheminfo/react-cheminfo/commit/c0e8751631777f0b2adc0740dfc314517ec886a8))

## [0.7.0](https://github.com/cheminfo/react-cheminfo/compare/v0.6.0...v0.7.0) (2026-08-18)


### Features

* add a shared periodic table ([e1cc34f](https://github.com/cheminfo/react-cheminfo/commit/e1cc34f5a780dc017ecee36b16e55289757bf2f1))
* **citation:** export the platform paper as a shared work ([2f5019d](https://github.com/cheminfo/react-cheminfo/commit/2f5019d535741ba335da6bb84a57b2ae7e36d120))


### Bug Fixes

* **ecosystem:** give chemcalc a rose second colour ([0fb49ec](https://github.com/cheminfo/react-cheminfo/commit/0fb49ec389466d62612561dcda3b1e3ff46847f1))

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
