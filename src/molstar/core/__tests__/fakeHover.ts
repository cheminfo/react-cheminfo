import type { Loci } from 'molstar/lib/mol-model/loci.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

/**
 * A plugin whose hover behaviour the test drives: `emit` is the pointer coming
 * to rest on a loci, as molstar reports it.
 * @returns The plugin, the way to move the pointer, and how many times the
 * subscription was ended.
 */
export function fakeHover() {
  let listener: ((event: { current: { loci: Loci } }) => void) | undefined;
  const state = { unsubscribed: 0 };
  const plugin = {
    behaviors: {
      interaction: {
        hover: {
          subscribe: (next: typeof listener) => {
            listener = next;
            return {
              unsubscribe: () => {
                state.unsubscribed++;
                listener = undefined;
              },
            };
          },
        },
      },
    },
  } as unknown as PluginContext;
  return {
    plugin,
    emit: (loci: Loci) => listener?.({ current: { loci } }),
    get unsubscribed() {
      return state.unsubscribed;
    },
  };
}
