/**
 * The host protocol: a page that frames a tool — an electronic lab notebook, a
 * course — hands it typed data, checked against pipeline.cheminfo.org's kinds.
 *
 * Its own door because the schemas are checked with ajv. `useHostConnection`
 * fetches ajv and the connection only when the page is framed, so a site that
 * calls it ships nothing extra to a visitor who opened it directly.
 */

export * from './host/core/index.ts';
export * from './host/ui/index.ts';
