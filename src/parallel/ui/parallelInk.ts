/**
 * The colours the canvas is painted with, read off the figure itself.
 *
 * A canvas takes a colour, not a CSS declaration, so `var(--accent)` means
 * nothing to it — and the family's accent is the one colour a site owns, so it
 * cannot be written into a shared library either. The figure therefore asks
 * the browser what its own tokens resolved to, once it is on the page, and
 * paints with the answer.
 */

import { useCallback, useMemo, useState } from 'react';

import { parseHexColor } from '../../color/core/hex.ts';
import { FAMILY_TOKEN_VALUES } from '../../tokens/core/familyTokens.ts';
import { PARALLEL_INCLUDED_ALPHA } from '../core/parallelPaint.ts';

import type { ParallelInk } from './parallelCoordinatesProps.ts';

/**
 * The rows a brush left out. A light grey rather than a translucent black:
 * overlapping segments of one stroked path accumulate alpha, so a translucent
 * black saturates wherever the library is dense, while this is the colour the
 * pile can only converge on.
 */
const EXCLUDED = 'rgba(171, 179, 191, 0.16)';

/** How solid the halo under a singled-out line is. */
const HALO_ALPHA = 0.85;

/** The halo a page that declares no surface colour still gets. */
const WHITE_HALO = `rgba(255, 255, 255, ${HALO_ALPHA})`;

/** The four tokens the figure paints from, as the page resolved them. */
export interface ParallelTokenInk {
  /** What `--text` resolved to. */
  text: string;
  /** What `--text-muted` resolved to. */
  textMuted: string;
  /** What `--surface` resolved to. */
  surface: string;
  /** What `--accent` resolved to, or the text colour when a site declares none. */
  accent: string;
}

/** Every colour the figure paints with, resolved to something a canvas takes. */
export interface ParallelInkValues {
  /** The rows a brush left out. */
  excluded: string;
  /** The rows nothing is colouring. */
  line: string;
  /** The row under the pointer. */
  hover: string;
  /** The rows singled out elsewhere. */
  selection: string;
  /** The halo a singled-out line is drawn over. */
  halo: string;
  /** The axis lines, their ticks and their labels. */
  axis: string;
  /** How strongly a kept line is drawn. */
  includedAlpha: number;
}

/**
 * What the figure's own tokens resolved to.
 * @param element - The figure, once it is on the page, or `null` before it is.
 * @returns The four colours. Off the page — a server render, a test — the
 * family's own token values stand in, so the figure never paints with nothing.
 */
export function readParallelTokens(element: Element | null): ParallelTokenInk {
  const text = tokenColor(element, '--text', FAMILY_TOKEN_VALUES['--text']);
  return {
    text,
    textMuted: tokenColor(
      element,
      '--text-muted',
      FAMILY_TOKEN_VALUES['--text-muted'],
    ),
    surface: tokenColor(element, '--surface', FAMILY_TOKEN_VALUES['--surface']),
    // A site that declares no accent still singles a row out, in its ink.
    accent: tokenColor(element, '--accent', text),
  };
}

/**
 * The inks to paint with, from the page's tokens and the caller's overrides.
 * @param tokens - What the figure's own tokens resolved to.
 * @param ink - What the caller insists on, over every one of them.
 * @returns The inks.
 */
export function parallelInkFrom(
  tokens: ParallelTokenInk,
  ink: ParallelInk = {},
): ParallelInkValues {
  return {
    excluded: ink.excluded ?? EXCLUDED,
    line: ink.line ?? tokens.textMuted,
    hover: ink.hover ?? tokens.text,
    selection: ink.selection ?? tokens.accent,
    halo: ink.halo ?? haloOf(tokens.surface),
    axis: ink.axis ?? tokens.textMuted,
    includedAlpha: ink.includedAlpha ?? PARALLEL_INCLUDED_ALPHA,
  };
}

/**
 * The inks to paint with, read off one element.
 * @param element - The figure, once it is on the page, or `null` before it is.
 * @param ink - What the caller insists on, over everything read off the page.
 * @returns The inks.
 */
export function readParallelInk(
  element: Element | null,
  ink: ParallelInk = {},
): ParallelInkValues {
  return parallelInkFrom(readParallelTokens(element), ink);
}

/** The inks, and the ref that has to reach the figure for them to be read. */
export interface ParallelInkBinding {
  /** The colours to paint with. */
  ink: ParallelInkValues;
  /** Put on the figure's outermost element. */
  ref: (element: Element | null) => void;
}

/**
 * The inks, with the page's own tokens read the moment the figure is mounted.
 *
 * A callback ref rather than an effect, because the question is asked once, of
 * the element itself, and there is nothing to keep in step afterwards.
 * @param ink - What the caller insists on.
 * @returns The inks and the ref. See {@link ParallelInkBinding}.
 */
export function useParallelInk(ink: ParallelInk = {}): ParallelInkBinding {
  const [tokens, setTokens] = useState<ParallelTokenInk>(readFamilyTokens);
  const { excluded, line, hover, selection, halo, axis, includedAlpha } = ink;

  const ref = useCallback((element: Element | null) => {
    if (element !== null) setTokens(readParallelTokens(element));
  }, []);

  const resolved = useMemo(
    () =>
      parallelInkFrom(tokens, {
        excluded,
        line,
        hover,
        selection,
        halo,
        axis,
        includedAlpha,
      }),
    [tokens, excluded, line, hover, selection, halo, axis, includedAlpha],
  );

  return { ink: resolved, ref };
}

function readFamilyTokens(): ParallelTokenInk {
  return readParallelTokens(null);
}

function tokenColor(
  element: Element | null,
  name: string,
  fallback: string,
): string {
  const resolve = globalThis.getComputedStyle;
  if (element === null || typeof resolve !== 'function') return fallback;
  const declared = resolve(element).getPropertyValue(name).trim();
  return declared === '' ? fallback : declared;
}

function haloOf(surface: string): string {
  try {
    const { red, green, blue } = parseHexColor(surface);
    return `rgba(${red}, ${green}, ${blue}, ${HALO_ALPHA})`;
  } catch {
    // A surface written as anything but a hex colour still gets a halo.
    return WHITE_HALO;
  }
}
