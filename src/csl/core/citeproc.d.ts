/**
 * The part of citeproc-js this package calls, which ships no types of its own: a
 * processor built from a CSL style, formatting the citations of a document in
 * order and the reference list they make.
 */
declare module 'citeproc' {
  /** How the processor reads the works and the terms of a language. */
  export interface Sys {
    retrieveLocale: (language: string) => string;
    retrieveItem: (id: string) => object | undefined;
  }

  /** One citation of the text: the works it cites. */
  export interface Citation {
    citationID: string;
    citationItems: Array<{ id: string }>;
    properties: { noteIndex: number };
  }

  /** A processor for one style. */
  export interface Engine {
    rebuildProcessorState: (
      citations: Citation[],
      mode?: 'html' | 'text' | 'rtf',
      uncited?: string[],
    ) => Array<[string, number, string]>;
    /**
     * The reference list: how it is laid out — `entry_ids` holding the work
     * each entry lists — then its entries.
     */
    makeBibliography: () => false | [Record<string, unknown>, string[]];
  }

  const CSL: {
    Engine: new (
      sys: Sys,
      style: string,
      language?: string,
      force?: boolean,
    ) => Engine;
  };
  export default CSL;
}
