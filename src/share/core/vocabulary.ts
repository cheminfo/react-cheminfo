import type { ShareParamCodec } from './params.ts';

/**
 * A part of a page a shared link can switch off through `?hide=`.
 *
 * The label is written positively — the dialog shows a ticked box for a part
 * that stays visible — and the description says what switching it off does,
 * for the person building the link rather than for the visitor.
 */
export interface HideablePart {
  /** The name this part takes in `?hide=`, in lowerCamelCase. */
  key: string;
  /** How the part is named in the dialog. */
  label: string;
  /** What hiding it does. */
  description: string;
  /**
   * Whether the dialog starts with this part already switched off, because it
   * is noise inside somebody else's page.
   * @default false
   */
  hiddenByDefault?: boolean;
}

/**
 * The codecs of a tool's own parameters, keyed by the name each takes in the
 * query string.
 */
export type ShareParamCodecs = Readonly<
  Record<string, ShareParamCodec<unknown>>
>;

/** The value each codec of a set reads and writes. */
export type ShareParamValues<Codecs extends ShareParamCodecs> = {
  [Key in keyof Codecs]: Codecs[Key] extends ShareParamCodec<infer Value>
    ? Value
    : never;
};

/**
 * Everything one site's links can say: the parts they can switch off, and the
 * typed parameters they carry beyond `embed` and `hide`.
 *
 * This is the only place that knows those names. A key it does not list is a
 * tool input, left alone by every function here.
 */
export interface ShareVocabulary<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /**
   * The hideable parts, in the order `?hide=` and the dialog list them, so one
   * selection always produces one link.
   */
  parts: readonly HideablePart[];
  /**
   * The tool's own parameters — a series length, a zoom, a seed.
   * @default {}
   */
  params?: Codecs;
}
