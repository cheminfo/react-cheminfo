/**
 * Whether this machine can show the 3D viewer at all, asked *before* molstar is
 * loaded.
 *
 * molstar renders through WebGL and ships no canvas or SVG fallback, so on a
 * locked-down school machine — the audience these teaching sites are built for
 * — a failed context is a blank rectangle with no explanation. Probing first
 * lets the page say what is wrong instead. This module imports nothing, so a
 * page can ask the question before paying for molstar.
 */

/** What the machine can do, and what to tell the student. */
export interface ViewerCapability {
  /** A 3D scene can be rendered at all. Everything else is degradation. */
  supported: boolean;
  /**
   * Computed-orbital isosurfaces can be built on the GPU. When false molstar
   * falls back to its CPU collocation: the same picture, several seconds later.
   */
  gpuOrbitals: boolean;
  /** One sentence for the visitor. Never empty, including when all is well. */
  message: string;
}

/**
 * Probe the browser's WebGL support on a throw-away canvas.
 * @returns What the machine can render, and a message to show.
 */
export function probeViewerCapability(): ViewerCapability {
  if (typeof document === 'undefined') {
    return {
      supported: false,
      gpuOrbitals: false,
      message: 'The 3D viewer needs a browser window.',
    };
  }
  const canvas = document.createElement('canvas');
  const probe = getContext(canvas);
  if (probe === null) {
    return {
      supported: false,
      gpuOrbitals: false,
      message:
        'This browser could not create a WebGL context, so the 3D viewer cannot start. Enable hardware acceleration, or update the graphics driver.',
    };
  }
  const gpuOrbitals = hasFloatTextures(probe);
  loseContext(probe.context);
  if (!gpuOrbitals) {
    return {
      supported: true,
      gpuOrbitals: false,
      message:
        'This graphics driver has no floating-point textures, so computed orbitals are built on the processor instead. Everything works, but each orbital takes a few seconds.',
    };
  }
  return {
    supported: true,
    gpuOrbitals: true,
    message: 'This browser can render the 3D viewer and computed orbitals.',
  };
}

/** A context and which WebGL version it is, which changes the GPU verdict. */
interface ContextProbe {
  context: WebGL2RenderingContext | WebGLRenderingContext;
  /** molstar prefers WebGL2 too, so the same branch is taken there. */
  isWebGL2: boolean;
}

function getContext(canvas: HTMLCanvasElement): ContextProbe | null {
  const attributes: WebGLContextAttributes = {
    failIfMajorPerformanceCaveat: false,
  };
  const webgl2 = canvas.getContext('webgl2', attributes);
  if (webgl2 !== null) return { context: webgl2, isWebGL2: true };
  const webgl = canvas.getContext('webgl', attributes);
  if (webgl !== null) return { context: webgl, isWebGL2: false };
  return null;
}

/**
 * molstar's `canComputeGrid3dOnGPU` reduces to `getTextureFloat`, which treats
 * every* WebGL2 context as capable and only asks WebGL1 for
 * `OES_texture_float`. Asking WebGL2 for `EXT_color_buffer_float` instead would
 * be the stricter question, but it is not the one molstar answers, so the
 * message would promise a CPU fallback that never happens.
 * @param probe - The context and which WebGL version it is.
 * @returns True when floating-point textures are available.
 */
function hasFloatTextures(probe: ContextProbe): boolean {
  if (probe.isWebGL2) return true;
  return probe.context.getExtension('OES_texture_float') !== null;
}

function loseContext(
  context: WebGL2RenderingContext | WebGLRenderingContext,
): void {
  const lose: { loseContext: () => void } | null =
    context.getExtension('WEBGL_lose_context');
  lose?.loseContext();
}
