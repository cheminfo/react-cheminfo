/**
 * The spectra a host handed over, and the bands handed back for each.
 *
 * A notebook sends a sample's spectra with the bands it keeps for them. They
 * open in the viewer of their technique, and whatever the visitor then does to
 * their bands goes back under the name the notebook gave each one. Only those
 * go back: a file the visitor dropped is theirs. The chart on screen goes back
 * too, as a picture made when a host asks for it.
 *
 * The site's own signals hold the state, handed in, so the library never
 * depends on `@preact/signals` itself.
 */

import { figureSvg } from '../../download/core/figureSvg.ts';
import type { HostOutputs } from '../../host/core/hostOutputs.ts';
import type { HostItem } from '../../host/core/protocol.ts';
import type { Cell, SignalTools } from '../../state/core/cells.ts';

import type { HostItemName, HostSpectra } from './hostSpectraRead.ts';
import { NO_HOST_SPECTRA } from './hostSpectraRead.ts';
import type { IrBand } from './irBand.ts';
import { IR_FIGURE_SELECTOR } from './irEditorApi.ts';
import type { IrSpectrum } from './irSpectrum.ts';

/** One viewer whose host spectra hand their bands back. */
export interface HostSpectraTab {
  /** The spectra open in it, the visitor's own included. */
  spectra: Cell<readonly IrSpectrum[]>;
  /** The key of the item the bands go back as, e.g. `irPeaks`. */
  key: string;
  /** Its kind, e.g. `spectra.ir.peaks`. */
  kind: string;
  /** The bands as the kind carries them: `irPeaksFromBands`, … */
  peaks: (bands: readonly IrBand[]) => unknown[];
}

/** What {@link createHostSpectraSession} is given. */
export interface HostSpectraSessionOptions<TTab extends string> {
  /** The viewers, by tab: one for a site of one technique. */
  tabs: Readonly<Record<TTab, HostSpectraTab>>;
  /** `signal` from the site's signals, which the session keeps its own in. */
  signal: <T>(value: T) => Cell<T>;
  /** `batch`, `effect` and `untracked` from the site's signals. */
  tools: SignalTools;
  /**
   * The tab whose chart a host's figure is drawn from.
   * @default the first tab
   */
  chartTab?: () => TTab | undefined;
}

/** What {@link createHostSpectraSession} gives a site. */
export interface HostSpectraSession<TTab extends string> {
  /** What the site hands back: the bands, and the chart drawn when asked. */
  outputs: HostOutputs;
  /**
   * Open a document's spectra, each tab's in place of what the previous
   * document opened there, and hand their bands back from now on. A tab left
   * out got none: what the previous document opened there closes, and the
   * visitor's own stay.
   */
  open: (read: Partial<Record<TTab, HostSpectra>>) => void;
  /**
   * How many documents a host has opened: a viewer is opened afresh on each,
   * the way it would be on the notebook's own page.
   */
  documents: Cell<number>;
}

/**
 * The host session of the measured spectra of a site.
 * @param options - The viewers, and the site's signals.
 * @returns The outputs, the opener and the count of documents.
 */
export function createHostSpectraSession<TTab extends string>(
  options: HostSpectraSessionOptions<TTab>,
): HostSpectraSession<TTab> {
  const { tabs, signal, tools } = options;
  const names = Object.keys(tabs) as TTab[];
  const links = {} as Record<TTab, Cell<ReadonlyMap<string, HostItemName>>>;
  const opened = {} as Record<TTab, ReadonlySet<string>>;
  for (const name of names) {
    links[name] = signal<ReadonlyMap<string, HostItemName>>(new Map());
    opened[name] = new Set();
  }
  const documents = signal(0);
  const chartTab = options.chartTab ?? (() => names[0]);

  function read(): HostItem[] {
    const items: HostItem[] = [];
    for (const name of names) {
      const { spectra, key, kind, peaks } = tabs[name];
      const tabLinks = links[name].value;
      for (const spectrum of spectra.value) {
        const link = tabLinks.get(spectrum.id);
        if (link === undefined) continue;
        items.push({
          key,
          kind,
          ...link,
          value: { peaks: peaks(spectrum.bands ?? []) },
        });
      }
    }
    return items;
  }

  function chartFigure(): HostItem | undefined {
    const tab = chartTab();
    if (tab === undefined || tabs[tab].spectra.peek().length === 0) {
      return undefined;
    }
    const chart = globalThis.document?.querySelector(IR_FIGURE_SELECTOR);
    if (!chart) return undefined;
    const { markup } = figureSvg(chart);
    return { key: 'figure', kind: 'image.svg', value: { svg: markup } };
  }

  return {
    documents,
    outputs: {
      read,
      subscribe: (listener) =>
        tools.effect(() => {
          read();
          tools.untracked(listener);
        }),
      render: { figure: () => Promise.resolve(chartFigure()) },
    },
    open(document) {
      tools.batch(() => {
        for (const name of names) {
          const given = document[name] ?? NO_HOST_SPECTRA;
          const { spectra } = tabs[name];
          const previous = opened[name];
          if (given.spectra.length > 0) {
            spectra.value = given.spectra;
          } else {
            const kept: IrSpectrum[] = [];
            for (const spectrum of spectra.value) {
              if (!previous.has(spectrum.id)) kept.push(spectrum);
            }
            spectra.value = kept;
          }
          links[name].value = given.links;
          const ids = new Set<string>();
          for (const spectrum of given.spectra) ids.add(spectrum.id);
          opened[name] = ids;
        }
        documents.value++;
      });
    },
  };
}
