/**
 * The record a `MountProbe` keeps of standing up and being taken down.
 *
 * It sits apart from the component so that the file holding the component holds
 * nothing else — which is what fast refresh asks of any file exporting one.
 */

/**
 * What has been stood up and taken down since the record was last cleared.
 * @returns `+id` for every pane mounted and `-id` for every one unmounted, in
 * the order they came and went.
 */
export function mountLog(): readonly string[] {
  return mounted;
}

/**
 * Note that a pane has been stood up.
 * @param id - Which pane.
 */
export function noteMounted(id: string): void {
  mounted.push(`+${id}`);
}

/**
 * Note that a pane has been taken down.
 * @param id - Which pane.
 */
export function noteUnmounted(id: string): void {
  mounted.push(`-${id}`);
}

/** Forget what has happened so far, so the next change to the stack reads alone. */
export function clearMountLog(): void {
  mounted.length = 0;
}

/** Every pane stood up and taken down, in order, as its probe reported it. */
const mounted: string[] = [];
