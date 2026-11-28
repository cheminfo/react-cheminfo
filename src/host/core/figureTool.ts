/**
 * A tool whose whole exchange with a host is one figure: the picture of what
 * is on screen goes back when a host asks, and one of the site's own figures,
 * handed back on `FIGURE_INPUT`, opens again as it was drawn.
 *
 * The page that draws the figure mounts only while it is open, while the tool
 * lives as long as the shell, so the page says how its figure is taken
 * through a registry the tool reads.
 */

import type {
  CarriedFigureStates,
  FigureStates,
} from '../../download/core/figureState.ts';

import { FIGURE_INPUT, loadedFigureStates } from './figureDocument.ts';
import type { HostOutputs } from './hostOutputs.ts';
import type { ToolInterface } from './protocol.ts';
import type { LoadedInput } from './selectInputs.ts';

/** How the page on screen gives its figure. */
export interface ScreenFigure {
  /** The figure, as an SVG document holding the picture of the view. */
  readonly svg: () => Promise<string | undefined>;
  /** What the picture taken last carries, or `undefined` while there is none. */
  readonly states: () => FigureStates | undefined;
}

/** Where the tool finds the figure of the page on screen. */
export interface ScreenFigureRegistry {
  /**
   * Say how the page on screen gives its figure.
   * @param page - The page.
   * @returns Forget it, once the page is gone.
   */
  register: (page: ScreenFigure) => () => void;
  /**
   * The figure of the page on screen.
   * @returns The SVG, or `undefined` when nothing is on screen.
   */
  svg: () => Promise<string | undefined>;
  /**
   * What a figure of the page on screen carries.
   * @returns The states, or `undefined` when there is nothing to carry.
   */
  states: () => FigureStates | undefined;
}

/**
 * The registry of the page whose figure a tool hands back.
 * @returns The registry.
 */
export function createScreenFigure(): ScreenFigureRegistry {
  let page: ScreenFigure | null = null;
  return {
    register(next) {
      page = next;
      return () => {
        if (page === next) page = null;
      };
    },
    svg: () => page?.svg() ?? Promise.resolve(undefined),
    states: () => page?.states(),
  };
}

/** What {@link figureTool} is given. */
export interface FigureToolOptions {
  /** The site, as `hello` announces it and its figures name it, e.g. `pdb`. */
  name: string;
  /**
   * The figure on screen, made when a host asks for it.
   * @returns The SVG, or `undefined` while there is none.
   */
  figure: () => Promise<string | undefined>;
  /**
   * Open one of the site's figures a host handed back. Throwing refuses it,
   * and nothing changes then.
   * @param states - What the figure carries.
   */
  open: (states: CarriedFigureStates) => void;
}

/** A tool that exchanges one figure with its host. */
export interface FigureTool {
  /** The site, as `hello` announces it. */
  tool: ToolInterface;
  /** What the site hands back: the figure, rendered the moment a host asks. */
  outputs: HostOutputs;
  /**
   * Take a document a host sends: one of the site's figures opens as it was
   * drawn; a document without one changes nothing.
   * @param inputs - What the host's document gave the inputs.
   */
  load: (inputs: readonly LoadedInput[]) => Promise<void>;
}

/**
 * The host side of a site whose exchange is one figure.
 * @param options - The site, how its figure is made, and how one opens.
 * @returns The tool record, its outputs and its loader.
 */
export function figureTool(options: FigureToolOptions): FigureTool {
  const { name, figure, open } = options;
  return {
    tool: {
      name,
      inputs: [FIGURE_INPUT],
      outputs: [{ key: 'figure', kind: 'image.svg' }],
    },
    outputs: {
      read: () => [],
      subscribe: () => stopListening,
      render: {
        figure: async () => {
          const svg = await figure();
          return svg === undefined
            ? undefined
            : { key: 'figure', kind: 'image.svg', value: { svg } };
        },
      },
    },
    async load(inputs) {
      const carried = await loadedFigureStates(inputs, name);
      if (carried === undefined) return;
      open(carried);
    },
  };
}

function stopListening(): void {
  // Nothing is ever sent unasked: the figure is made when a host asks.
}
