/**
 * Frame a tool of the family and talk to it: hand it the document to show,
 * keep what it sends back, and ask it for other values.
 */

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  LoadOutcome,
  ToolConnection,
  ToolDocument,
} from '../core/connectTool.ts';
import { connectTool } from '../core/connectTool.ts';
import type {
  HostItem,
  ToolSettingField,
  ToolSettings,
} from '../core/protocol.ts';
import type { ToolHello } from '../core/toolMessages.ts';

import type {
  FramedTool,
  FramedToolOptions,
  FramedToolStatus,
} from './framedToolTypes.ts';

export type {
  FramedTool,
  FramedToolOptions,
  FramedToolStatus,
} from './framedToolTypes.ts';

/**
 * How long a tool has to say `hello`, in milliseconds: a cold start fetches the
 * tool's page, its scripts and its fonts, on a slow line as well.
 */
export const HELLO_TIMEOUT = 20_000;

const NO_OUTPUTS: ReadonlyMap<string, HostItem> = new Map();

const NO_FIELDS: readonly ToolSettingField[] = [];

/**
 * Frame a tool, and keep it showing a document.
 *
 * The frame is opened once and stays: a new document goes to the tool through
 * the protocol, the way a host hands over data, rather than as a new address
 * that would reload the tool and lose what its visitor did in it. A tool that
 * reloads all the same is handed the document again.
 * @param options - See {@link FramedToolOptions}.
 * @returns See {@link FramedTool}.
 */
export function useFramedTool(options: FramedToolOptions): FramedTool {
  const {
    url,
    host,
    document,
    helloTimeout = HELLO_TIMEOUT,
    onOutput,
  } = options;
  const frame = useRef<HTMLIFrameElement | null>(null);
  const attachFrame = useCallback((element: HTMLIFrameElement | null) => {
    frame.current = element;
  }, []);
  const connection = useRef<ToolConnection | null>(null);
  const visible = useFrameVisibility(frame);
  // What the tool is to show: the document, but only once the frame is seen.
  const [shown, setShown] = useState<ToolDocument | null>(null);
  if (visible && shown !== document) setShown(document);
  const latest = useRef(shown);
  const told = useRef(onOutput);
  const [link, setLink] = useState<Link | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const [said, setSaid] = useState<Said | null>(null);

  useEffect(() => {
    latest.current = shown;
    told.current = onOutput;
  });

  useEffect(() => {
    const element = frame.current;
    if (element === null) return;
    let greeted = false;
    const opened = connectTool({
      frame: () => element.contentWindow,
      origin: new URL(url, globalThis.location.href).origin,
      host: { name: host },
      listen: (listener) => {
        globalThis.addEventListener('message', listener);
        return () => {
          globalThis.removeEventListener('message', listener);
        };
      },
      onHello: (tool) => {
        greeted = true;
        setLink({ url, status: 'connected', tool });
      },
      onOutput: (message) => {
        setHeld((previous) =>
          hold(previous, `${url}\n${message.document}`, message.items),
        );
        if (message.document === latest.current?.document) {
          told.current?.(message.items);
        }
      },
      onSettings: (settings, fields) => {
        setSaid({ url, settings, fields });
      },
    });
    connection.current = opened;
    const timer = setTimeout(() => {
      if (!greeted) setLink({ url, status: 'unavailable', tool: null });
    }, helloTimeout);
    // Set once the listener exists, and again when the effect runs anew, so
    // the tool greets this listener rather than one already closed.
    element.src = url;
    return () => {
      clearTimeout(timer);
      opened.close();
      if (connection.current === opened) connection.current = null;
    };
  }, [url, host, helloTimeout]);

  const name = shown?.document ?? null;
  useEffect(() => {
    const opened = connection.current;
    const handed = latest.current;
    if (opened === null || handed === null) return;
    const key = `${url}\n${handed.document}`;
    void opened.load(handed).then(async (outcome) => {
      setAnswer({ key, outcome });
      const accept = handed.accept ?? [];
      if (outcome.status !== 'loaded' || accept.length === 0) return;
      // What the tool held once it showed the document is never sent unasked.
      const items = await opened.get(accept).catch(() => []);
      setHeld((previous) => hold(previous, key, items));
    });
  }, [name, url, host]);

  const fullscreen = useCallback(async () => {
    const element = frame.current;
    if (element === null) throw new Error('The tool is not open.');
    await element.requestFullscreen();
  }, []);

  const get = useCallback(async (keys: readonly string[]) => {
    const opened = connection.current;
    if (opened === null) {
      throw new Error('The tool is not open, so it has nothing to give.');
    }
    return opened.get(keys);
  }, []);

  const setSettings = useCallback((settings: ToolSettings) => {
    connection.current?.setSettings(settings);
  }, []);

  const key = name === null ? null : `${url}\n${name}`;
  const current = link?.url === url ? link : null;
  return {
    attachFrame,
    fullscreen,
    status: current?.status ?? 'connecting',
    tool: current?.tool ?? null,
    outcome: answer !== null && answer.key === key ? answer.outcome : null,
    outputs: held !== null && held.key === key ? held.outputs : NO_OUTPUTS,
    get,
    settings: said?.url === url ? said.settings : null,
    settingFields: said?.url === url ? said.fields : NO_FIELDS,
    setSettings,
  };
}

/**
 * Whether the frame can be seen. Nothing counts as seen before the first
 * report, so a frame mounted hidden is handed nothing in between; where the
 * browser cannot tell, the frame always counts as seen.
 * @param frame - The frame.
 * @returns Whether it is shown.
 */
function useFrameVisibility(
  frame: RefObject<HTMLIFrameElement | null>,
): boolean {
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );
  useEffect(() => {
    const element = frame.current;
    if (element === null || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.at(-1);
      if (entry !== undefined) setVisible(entry.isIntersecting);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [frame]);
  return visible;
}

interface Link {
  url: string;
  status: Exclude<FramedToolStatus, 'connecting'>;
  tool: ToolHello | null;
}

interface Answer {
  key: string;
  outcome: LoadOutcome;
}

interface Held {
  key: string;
  outputs: ReadonlyMap<string, HostItem>;
}

interface Said {
  url: string;
  settings: ToolSettings;
  fields: readonly ToolSettingField[];
}

function hold(
  previous: Held | null,
  key: string,
  items: readonly HostItem[],
): Held {
  const outputs = new Map(
    previous?.key === key ? previous.outputs : NO_OUTPUTS,
  );
  for (const item of items) {
    if (item.key !== undefined) outputs.set(item.key, item);
  }
  return { key, outputs };
}
