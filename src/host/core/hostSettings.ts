/**
 * What a host may set while a tool is open: how the tool shows what it holds,
 * rather than what it holds. A host's toolbar drives these without reloading
 * the tool, and hears when the tool's own visitor changes them.
 */

import type {
  ResultMessage,
  SettingsMessage,
  SettingsRequest,
  ToolSettingField,
  ToolSettings,
} from './protocol.ts';

/** Where a tool's settings are read and set, and how their changes are heard. */
export interface HostSettings {
  /** Every setting now, each value written as an address writes it. */
  read: () => ToolSettings;
  /**
   * Apply what a host asks. The values are untrusted: a name the tool does not
   * know, or a value it cannot read, is ignored.
   */
  apply: (settings: ToolSettings) => void;
  /** Be told whenever they may have changed; the returned function stops it. */
  subscribe: (listener: () => void) => () => void;
  /**
   * How a host draws a control for each setting, read with the values, so a
   * choice that follows what the tool holds — the conformers of the molecule
   * on screen — reaches the host whenever it changes.
   * @default undefined — the tool describes none
   */
  fields?: () => readonly ToolSettingField[];
}

/** What the connection tells the publisher. */
export interface SettingsPublisher {
  /** A host connected: it knows nothing yet, so it is told everything. */
  connected: () => void;
  /** The settings may have changed: the host is told if they did. */
  changed: () => void;
}

/**
 * Tell the host about the settings, once per change.
 * @param settings - Where they are read.
 * @param send - Posts a message to the host, when there is one.
 * @returns See {@link SettingsPublisher}.
 */
export function createSettingsPublisher(
  settings: HostSettings,
  send: (message: SettingsMessage) => void,
): SettingsPublisher {
  let sent: string | null = null;
  function message(): SettingsMessage {
    const values = settings.read();
    const fields = settings.fields?.();
    return fields === undefined
      ? { type: 'settings', settings: values }
      : { type: 'settings', settings: values, fields: [...fields] };
  }
  function publish(next = message()): void {
    sent = JSON.stringify(next);
    send(next);
  }
  return {
    connected: () => {
      publish();
    },
    changed() {
      if (sent === null) return;
      const next = message();
      if (JSON.stringify(next) !== sent) publish(next);
    },
  };
}

/**
 * Answer a host's `settings` request.
 * @param request - The request.
 * @param settings - Where the tool's settings are set, if it has any.
 * @returns The answer; what changed reaches the host through the publisher.
 */
export function applySettings(
  request: SettingsRequest,
  settings: HostSettings | undefined,
): ResultMessage {
  const { id } = request;
  if (settings === undefined) {
    return {
      type: 'result',
      id,
      ok: false,
      error: { code: 'invalid', message: 'This tool has no settings to set.' },
    };
  }
  settings.apply(request.settings);
  return { type: 'result', id, ok: true, used: [] };
}
