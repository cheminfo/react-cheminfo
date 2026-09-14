/** What a site got wrong where a token was called for. */
export type TokenViolationKind =
  | 'blueprint-grey'
  | 'blueprint-blue'
  | 'retyped-token'
  | 'redeclared-brand'
  | 'drifted-fallback';
