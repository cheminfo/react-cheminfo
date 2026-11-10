import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import { StateTransform } from 'molstar/lib/mol-state/index.js';

/** One trajectory of the stand-in's state tree. */
export interface StandInTrajectory {
  /** How many frames it holds. */
  frames: number;
  /** The frame its model shows. */
  shown: number;
}

/** How the stand-in plugin starts. */
export interface TrajectoryStandInOptions {
  /**
   * The trajectories on screen, each with the model showing one of its frames.
   * @default []
   */
  trajectories?: StandInTrajectory[];
  /**
   * Whether molstar's animation is running.
   * @default false
   */
  animating?: boolean;
}

/**
 * A plugin holding only what the trajectory helpers read: a state tree of
 * trajectories, each with one model under it, and an animation manager. Every
 * call that changes something is written down in `log`, in order.
 * @param options - See {@link TrajectoryStandInOptions}.
 * @returns The plugin, the log, and the frame each model shows.
 */
export function trajectoryStandIn(options: TrajectoryStandInOptions = {}) {
  const { trajectories = [], animating = false } = options;
  const log: string[] = [];
  const root = StateTransform.RootRef;
  const transforms = new Map<string, Transform>([
    [root, { ref: root, parent: root }],
  ]);
  const cells = new Map<string, unknown>([[root, { obj: undefined }]]);
  const models: Array<{ transform: Transform }> = [];
  for (const [index, { frames, shown }] of trajectories.entries()) {
    const trajectory = `trajectory-${index}`;
    const model = `model-${index}`;
    transforms.set(trajectory, { ref: trajectory, parent: root });
    cells.set(trajectory, {
      obj: {
        type: PluginStateObject.Molecule.Trajectory.type,
        data: { frameCount: frames },
      },
    });
    const transform = {
      ref: model,
      parent: trajectory,
      params: { modelIndex: shown },
    };
    transforms.set(model, transform);
    models.push({ transform });
  }
  const animation = {
    isAnimating: animating,
    async play(
      _animation: unknown,
      params: {
        mode: { name: string; params: { direction: string } };
        duration: { name: string; params: { maxFps: number } };
      },
    ) {
      const { mode, duration } = params;
      log.push(
        `play ${mode.name} ${mode.params.direction} ${duration.name} at ${duration.params.maxFps} fps`,
      );
      animation.isAnimating = true;
    },
    async stop() {
      log.push('stop');
      animation.isAnimating = false;
    },
  };
  const plugin = {
    state: {
      data: {
        tree: { transforms },
        cells,
        select: () => models,
      },
    },
    managers: { animation },
    build() {
      const updates: Array<() => void> = [];
      const described: string[] = [];
      return {
        to(cell: { transform: Transform }) {
          return {
            update(params: { modelIndex: number }) {
              described.push(`${cell.transform.ref}→${params.modelIndex}`);
              updates.push(() => {
                cell.transform.params = params;
              });
            },
          };
        },
        async commit() {
          for (const update of updates) update();
          log.push(`commit ${described.join(' ')}`);
        },
      };
    },
  } as unknown as PluginContext;
  return {
    plugin,
    log,
    shownFrames: () =>
      models.map((model) => model.transform.params?.modelIndex),
  };
}

interface Transform {
  ref: string;
  parent: string;
  params?: { modelIndex: number };
}
