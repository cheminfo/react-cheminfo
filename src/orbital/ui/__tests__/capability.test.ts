// @vitest-environment jsdom
/**
 * What the machine is told before molstar is loaded: whether a WebGL context
 * can be had at all, and whether computed orbitals can be built on the GPU —
 * asked of a canvas whose `getContext` answers as a given browser would.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { probeViewerCapability } from '../capability.ts';

interface Browser {
  /** The context kinds the browser hands out. */
  contexts: Array<'webgl2' | 'webgl'>;
  /** The extensions its contexts know. */
  extensions: string[];
}

let asked: string[];
let lost: number;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a WebGL2 browser renders the viewer and builds orbitals on the GPU, and the probe gives its context back', () => {
  answerAs({
    contexts: ['webgl2', 'webgl'],
    extensions: ['WEBGL_lose_context'],
  });

  expect(probeViewerCapability()).toStrictEqual({
    reason: 'ready',
    supported: true,
    gpuOrbitals: true,
    message: 'This browser can render the 3D viewer and computed orbitals.',
  });
  expect(asked).toStrictEqual(['webgl2 lenient']);
  expect(lost).toBe(1);
});

test('a WebGL1 browser with float textures is as capable as a WebGL2 one', () => {
  answerAs({
    contexts: ['webgl'],
    extensions: ['OES_texture_float', 'WEBGL_lose_context'],
  });

  expect(probeViewerCapability().reason).toBe('ready');
  expect(asked).toStrictEqual(['webgl2 lenient', 'webgl lenient']);
});

test('a WebGL1 browser without float textures renders, but builds orbitals on the processor', () => {
  answerAs({ contexts: ['webgl'], extensions: ['WEBGL_lose_context'] });

  expect(probeViewerCapability()).toStrictEqual({
    reason: 'noFloatTextures',
    supported: true,
    gpuOrbitals: false,
    message:
      'This graphics driver has no floating-point textures, so computed orbitals are built on the processor instead. Everything works, but each orbital takes a few seconds.',
  });
  expect(lost).toBe(1);
});

test('a context that cannot be lost on purpose is simply left', () => {
  answerAs({ contexts: ['webgl2'], extensions: [] });

  expect(probeViewerCapability().reason).toBe('ready');
  expect(lost).toBe(0);
});

test('a browser with no WebGL at all says what to do about it', () => {
  answerAs({ contexts: [], extensions: [] });

  expect(probeViewerCapability()).toStrictEqual({
    reason: 'noContext',
    supported: false,
    gpuOrbitals: false,
    message:
      'This browser could not create a WebGL context, so the 3D viewer cannot start. Enable hardware acceleration, or update the graphics driver.',
  });
});

test('with no document there is no viewer to show', () => {
  vi.stubGlobal('document', undefined);

  expect(probeViewerCapability()).toStrictEqual({
    reason: 'noWindow',
    supported: false,
    gpuOrbitals: false,
    message: 'The 3D viewer needs a browser window.',
  });
});

/**
 * Make every canvas answer `getContext` as `browser` would.
 * @param browser - See {@link Browser}.
 */
function answerAs(browser: Browser): void {
  asked = [];
  lost = 0;
  const context = {
    getExtension(name: string) {
      if (!browser.extensions.includes(name)) return null;
      return name === 'WEBGL_lose_context'
        ? {
            loseContext: () => {
              lost++;
            },
          }
        : {};
    },
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((
    kind: string,
    attributes?: WebGLContextAttributes,
  ) => {
    const lenient = attributes?.failIfMajorPerformanceCaveat === false;
    asked.push(`${kind} ${lenient ? 'lenient' : 'strict'}`);
    return browser.contexts.includes(kind as 'webgl') ? context : null;
  }) as unknown as HTMLCanvasElement['getContext']);
}
