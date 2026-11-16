import { Button, Callout } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { ConfirmButton } from '../../confirm/ui/ConfirmButton.tsx';
import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ToolDocument } from '../core/connectToolTypes.ts';
import { readOutput } from '../core/kinds.ts';

import { FramedToolNotice } from './FramedToolNotice.tsx';
import { croppedToolFigure } from './croppedToolFigure.ts';
import { useFramedTool } from './useFramedTool.ts';

/** Props of {@link ToolSwitchView}. */
export interface ToolSwitchViewProps {
  /** The tool's address, framed: `?embed=1` and whatever page it opens on. */
  url: string;
  /** The host of the page that frames it, as the protocol announces it. */
  host: string;
  /** The framed site's host, as the bar names it: `draw.cheminfo.org`. */
  name: string;
  /** What the bar says, e.g. "A new structure, on draw.cheminfo.org". */
  title: ReactNode;
  /** What the view is, to a screen reader: "Making the structure on …". */
  label: string;
  /** The label of the button that keeps the figure: "Add to the figure". */
  doneLabel: string;
  /** What Cancel asks, e.g. "What was done on … is lost, and …". */
  cancelQuestion: string;
  /** What the notice says Cancel does when the tool cannot be used. */
  next: string;
  /** What the tool is handed: the figure changed, or nothing for a new one. */
  document: ToolDocument | null;
  /**
   * The output the figure is read from.
   * @default 'figure'
   */
  output?: string;
  /** Called with the figure, cropped; the view closes once it resolves. */
  onDone: (svg: string) => Promise<void> | void;
  /** Called to close the view, by Cancel and once the figure is kept. */
  onClose: () => void;
}

/**
 * A figure made or changed on another site of the family, over the whole page:
 * the site framed under a bar, Cancel asking before it drops what was done
 * there, and Done reading the figure back and handing it over cropped. Leaving
 * the page while it is open asks first.
 * @param props - See {@link ToolSwitchViewProps}.
 * @returns The view.
 */
export function ToolSwitchView(props: ToolSwitchViewProps): ReactElement {
  const { url, host, name, title, label, doneLabel, cancelQuestion } = props;
  const { next, document, output = 'figure', onDone, onClose } = props;
  const t = useChromeT();
  const { attachFrame, ...tool } = useFramedTool({ url, host, document });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  // A deployed site older than the page may not hand a figure back at all.
  const gives =
    tool.tool === null || tool.tool.outputs.some(({ key }) => key === output);
  const ready = tool.status === 'connected' && gives && !busy;

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    globalThis.addEventListener('beforeunload', onLeave);
    return () => {
      globalThis.removeEventListener('beforeunload', onLeave);
    };
  }, []);

  function done(): void {
    setBusy(true);
    setFailure(null);
    tool
      .get([output])
      .then(async (items) => {
        const figure = readOutput(items, output, 'image.svg');
        if (figure?.kind !== 'image.svg') {
          throw new Error(t('toolSwitch.nothingBack', { host: name }));
        }
        await onDone(await croppedToolFigure(figure.value.svg));
        onClose();
      })
      .catch((error: unknown) => {
        // Said here: whatever status line the page has is under the frame.
        setFailure(errorMessage(error));
        setBusy(false);
      });
  }

  const cancel =
    tool.status === 'connected' ? (
      <ConfirmButton
        icon="cross"
        intent="danger"
        variant="minimal"
        text={t('toolSwitch.cancel')}
        question={cancelQuestion}
        confirmLabel={t('toolSwitch.leave', { host: name })}
        cancelLabel={t('toolSwitch.keepWorking')}
        onConfirm={onClose}
      />
    ) : (
      <Button
        icon="cross"
        intent="danger"
        variant="minimal"
        text={t('toolSwitch.cancel')}
        onClick={onClose}
      />
    );

  return (
    <div
      className="tool-switch"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="tool-switch__bar">
        <span className="tool-switch__title">{title}</span>
        <span className="tool-switch__spacer" />
        {cancel}
        <Button
          icon="tick"
          intent="success"
          text={doneLabel}
          disabled={!ready}
          loading={busy}
          onClick={done}
        />
      </div>
      <FramedToolNotice
        tool={tool}
        url={url}
        output={output}
        next={next}
        className="tool-switch__note"
      />
      {failure === null ? null : (
        <Callout compact intent="danger" className="tool-switch__note">
          {failure}
        </Callout>
      )}
      <iframe
        ref={attachFrame}
        onLoad={(event) => {
          takeKeys(event.currentTarget);
        }}
        className="tool-switch__frame"
        title={label}
        allow="fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}

function takeKeys(frame: HTMLIFrameElement): void {
  // Not the empty page a frame holds before it has an address, and not again:
  // a focused frame focused anew drops the focus held inside it.
  if (frame.getAttribute('src') === null) return;
  if (globalThis.document.activeElement === frame) return;
  frame.focus({ preventScroll: true });
}
