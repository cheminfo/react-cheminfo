/** One molecule a source sends: its identifier, and exactly one notation. */
export interface MoleculeInput {
  /** The source's identifier for it, which its address is written with. */
  id: string;
  /**
   * The structure as SMILES.
   * @default undefined - another notation is given
   */
  smiles?: string;
  /**
   * The structure as a molfile.
   * @default undefined - another notation is given
   */
  molfile?: string;
  /**
   * The structure as an OpenChemLib idCode.
   * @default undefined - another notation is given
   */
  idCode?: string;
}

/** What molecules.cheminfo.org computed for a structure. */
export interface MoleculeInfo {
  mf: string;
  mw: number;
  em: number;
  charge: number;
  idCode: string;
  noStereoID: string;
  noStereoTautomerID: string;
  failedTautomerID: number;
  /** The 512-bit FragFp, sixteen signed 32-bit words. */
  ssIndex: number[];
  logS: number;
  logP: number;
  acceptorCount: number;
  donorCount: number;
  stereoCenterCount: number;
  rotatableBondCount: number;
  polarSurfaceArea: number;
  nbFragments: number;
  /**
   * The degree of unsaturation, when the formula has one.
   * @default undefined
   */
  unsaturation?: number;
  atoms: Record<string, number>;
  /** The hashes, as 16 hex digits: never JSON numbers, which would round them. */
  idCodeHash: string;
  noStereoHash: string;
  noStereoTautomerHash: string;
  createdAt: number | null;
}

/** What became of one molecule a source sent. */
export interface SubmitResult {
  id: string | null;
  /**
   * The structure it was read as.
   * @default undefined - it could not be read
   */
  idCode?: string;
  /**
   * Whether molecules.cheminfo.org held the structure already.
   * @default undefined - it could not be read
   */
  molecule?: 'created' | 'existing';
  /**
   * What became of the source's entry.
   * @default undefined - it could not be read
   */
  link?: 'added' | 'unchanged' | 'moved';
  /**
   * The computed properties, when they were asked for.
   * @default undefined
   */
  info?: MoleculeInfo;
  /**
   * Why the molecule was refused.
   * @default undefined - it was taken
   */
  error?: string;
}

/** How a batch was taken. */
export interface SubmitSummary {
  total: number;
  /** Molecules new to molecules.cheminfo.org. */
  created: number;
  /** Entries new to the source. */
  added: number;
  /** Identifiers moved to another structure. */
  moved: number;
  unchanged: number;
  failed: number;
}

/** What `POST /v1/submit` answers: one result per molecule, in their order. */
export interface SubmitResponse {
  source: string;
  results: SubmitResult[];
  summary: SubmitSummary;
}

/** What `POST /v1/imports` answers: the start of a full import. */
export interface ImportStarted {
  source: string;
  importKey: number;
  importStartedAt: number;
}

/** What `GET /v1/imports` answers: where the source's import stands. */
export interface ImportState {
  source: string;
  importKey: number;
  importStartedAt: number | null;
  updatedAt: number | null;
  entries: number;
  stale: number;
}

/** What a purge answers. */
export interface PurgeResponse {
  source: string;
  importKey: number;
  dryRun: boolean;
  /** The entries the import did not send again, removed or to be removed. */
  removed: number;
  /** The entries the source holds after. */
  remaining: number;
}

/** One answer of `POST /v1/batch`: the molecule a query reads as, or why not. */
export interface LookupResult {
  query: string;
  result: MoleculeInfo | null;
  /** Whether molecules.cheminfo.org lists it, rather than computing it now. */
  cached: boolean;
  /**
   * Why the query could not be read.
   * @default undefined - it was read
   */
  error?: string;
}

/** What `POST /v1/batch` answers: one result per query, in their order. */
export interface LookupResponse {
  results: LookupResult[];
}

/** Why a request is tried again, and when. */
export interface RetryDetails {
  method: string;
  path: string;
  attempt: number;
  /**
   * The status that was answered.
   * @default undefined - nothing was answered
   */
  status?: number;
  reason: string;
  delayMs: number;
}
