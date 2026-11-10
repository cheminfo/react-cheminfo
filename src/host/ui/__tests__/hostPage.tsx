import type { ReactElement } from 'react';

import type { ToolInterface } from '../../core/protocol.ts';
import type { HostHandlers } from '../useHostConnection.ts';

/**
 * A page of the tool, loaded afresh: a host is greeted once per page, so a
 * test that wants a greeting resets the modules and loads one of its own.
 * @param tool - What the tool takes and gives.
 * @returns The tool's component, and the figure helpers of that same page.
 */
export async function loadToolPage(tool: ToolInterface) {
  const [connection, revision, pageSource] = await Promise.all([
    import('../useHostConnection.ts'),
    import('../../../download/core/figureRevision.ts'),
    import('../../../download/core/pageFigureSource.ts'),
  ]);
  function Tool(props: { handlers: HostHandlers }): ReactElement {
    connection.useHostConnection(tool, props.handlers);
    return <p>tool</p>;
  }
  return {
    Tool,
    figureRevision: revision.figureRevision,
    withPageFigureSource: pageSource.withPageFigureSource,
  };
}

/**
 * A host window recording what the tool posts to it.
 * @returns The window, and what it received.
 */
export function hostWindow() {
  const posted: unknown[] = [];
  return {
    posted,
    window: {
      postMessage(message: unknown) {
        posted.push(message);
      },
    },
  };
}

/**
 * Answer the tool's hello as its host does, from the host's window, handing
 * it one end of a real `MessageChannel`.
 * @param source - The host's window, as the tool greeted it.
 * @returns What arrives on the host's end, and the means to send and close.
 */
export function connectAsHost(source: unknown) {
  const channel = new MessageChannel();
  const answers: unknown[] = [];
  channel.port1.addEventListener('message', (event) => {
    answers.push(event.data);
  });
  channel.port1.start();
  const connect = new Event('message');
  Object.defineProperties(connect, {
    data: { value: { type: 'cheminfo:connect', version: 1, host: {} } },
    source: { value: source },
    ports: { value: [channel.port2] },
  });
  globalThis.dispatchEvent(connect);
  return {
    answers,
    send: (request: unknown) => {
      channel.port1.postMessage(request);
    },
    close: () => {
      channel.port1.close();
    },
  };
}
