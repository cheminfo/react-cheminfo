import { H6, Icon } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { formatInteger } from '../../format/core/index.ts';
import type { HelpContent } from '../../help/ui/index.ts';
import { HelpIcon } from '../../help/ui/index.ts';
import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { useDebouncedValue } from '../../hooks/ui/useDebouncedValue.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { SharePreviewDeviceKey, ShareRegion } from '../core/index.ts';
import {
  SHARE_REGIONS_REQUEST,
  readShareRegions,
  sharePreviewAddress,
  sharePreviewScale,
  sharePreviewSize,
} from '../core/index.ts';

import { SharePreviewDevices } from './SharePreviewDevices.tsx';

/** Room the window's own bar takes, which the page is not scaled into. */
const CHROME_HEIGHT = 26;

/** How often the framed page is asked again while it has answered nothing. */
const ASK_INTERVAL = 300;

/** How many times, so a page with nothing to report is left alone. */
const ASK_LIMIT = 10;

export interface SharePreviewProps {
  /** The address the frame loads — the link as it stands. */
  url: string;
  /** What a screen reader announces the frame as. */
  title: string;
  /**
   * The part the reader is pointing at in the list, drawn on the page so the
   * name in the list and the thing on the page are the same thing.
   * @default null — nothing is pointed at
   */
  highlight?: { part: string; label: string } | null;
}

/**
 * The page as the link hands it out, live, beside the options that write it.
 *
 * It is drawn as a window of its own — named above it, with the address it
 * loads on its own bar — because a page scaled into a pane otherwise reads as
 * the site itself, and a reader who takes the preview for the tool ticks a box
 * in it and believes the link now carries it.
 *
 * The frame is laid out at the screen the reader picks — their own window, a
 * phone, a laptop or a large display — and scaled into whatever room the pane
 * has, so a course tile can be checked at the size a student will meet it.
 * @param props - The address and the name of the frame.
 * @returns The preview pane.
 */
export function SharePreview(props: SharePreviewProps): ReactElement {
  const { url, title, highlight = null } = props;
  const t = useChromeT();
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const pane = useContainerSize(stage);
  const [device, setDevice] = useState<SharePreviewDeviceKey>('window');
  const [regions, setRegions] = useState<readonly ShareRegion[]>(NO_REGIONS);
  const mark = useRef<HTMLDivElement>(null);
  // Every box ticked reloads the frame; a number typed into a tool's own field
  // would otherwise reload it once per keystroke.
  const src = useDebouncedValue(url, 400);

  const windowSize = {
    width: globalThis.innerWidth,
    height: globalThis.innerHeight,
  };
  const page = sharePreviewSize(device, windowSize);
  const scale = sharePreviewScale(
    { width: pane.width, height: pane.height - CHROME_HEIGHT },
    page,
  );
  const region =
    highlight === null ? undefined : regionOf(regions, highlight.part);
  const help: HelpContent = {
    title: t('share.preview'),
    body: [t('share.previewWhat'), t('share.previewLive')],
  };

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.source !== frame.current?.contentWindow) return;
      const reported = readShareRegions(event.data);
      if (reported !== null) setRegions(reported);
    }

    globalThis.addEventListener('message', onMessage);
    return () => {
      globalThis.removeEventListener('message', onMessage);
    };
  }, []);

  // A region further down the page than the stage shows is brought into view,
  // or pointing at a row would mark something the reader cannot see.
  useEffect(() => {
    mark.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [highlight?.part]);

  // The frame's own load says the document is there, never that the page it
  // builds is listening: a React tree mounts in a task of its own, after it.
  // So the question is repeated until it is answered — there is no event on
  // this side to wait for, and a page that answers nothing is a page with no
  // parts to point at, which costs ten messages and stops.
  useEffect(() => {
    if (regions.length > 0) return undefined;
    let asked = 0;
    const timer = setInterval(() => {
      asked += 1;
      if (asked > ASK_LIMIT) {
        clearInterval(timer);
        return;
      }
      frame.current?.contentWindow?.postMessage(
        { type: SHARE_REGIONS_REQUEST },
        '*',
      );
    }, ASK_INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, [regions, src]);

  return (
    <section className="share-preview" aria-label={t('share.preview')}>
      <header className="share-preview__header">
        <H6 className="share-preview__label">
          <Icon icon="eye-open" size={13} />
          {t('share.preview')}
          <HelpIcon content={help} />
        </H6>
        <SharePreviewDevices
          value={device}
          onChange={setDevice}
          windowSize={windowSize}
        />
      </header>
      <div className="share-preview__stage" ref={stage}>
        <div
          className="share-preview__device"
          style={{ width: page.width * scale }}
        >
          <div className="share-preview__chrome">
            <Icon icon="eye-open" size={11} />
            <span className="share-preview__address">
              {sharePreviewAddress(url)}
            </span>
            <span className="share-preview__size">
              {sizeNote(page.width, page.height, scale)}
            </span>
          </div>
          <div
            className="share-preview__page"
            style={{ height: page.height * scale }}
          >
            <iframe
              ref={frame}
              className="share-preview__frame"
              src={src}
              title={title}
              style={frameStyle(page.width, page.height, scale)}
              onLoad={() => {
                // What the page before it reported is where its own parts
                // were, so it is dropped rather than drawn over this one.
                setRegions(NO_REGIONS);
                frame.current?.contentWindow?.postMessage(
                  { type: SHARE_REGIONS_REQUEST },
                  '*',
                );
              }}
            />
            {region === undefined || highlight === null ? null : (
              <div
                ref={mark}
                className="share-preview__region"
                style={regionStyle(region, scale)}
              >
                <span className="share-preview__region-name">
                  {highlight.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const NO_REGIONS: readonly ShareRegion[] = [];

function regionOf(
  regions: readonly ShareRegion[],
  part: string,
): ShareRegion | undefined {
  for (const region of regions) {
    if (region.part === part) return region;
  }
  return undefined;
}

function regionStyle(region: ShareRegion, scale: number): CSSProperties {
  return {
    left: region.x * scale,
    top: region.y * scale,
    width: region.width * scale,
    height: region.height * scale,
  };
}

function frameStyle(
  width: number,
  height: number,
  scale: number,
): CSSProperties {
  return {
    width,
    height,
    border: 0,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };
}

function sizeNote(width: number, height: number, scale: number): string {
  const size = `${formatInteger(width)} × ${formatInteger(height)}`;
  return scale === 1 ? size : `${size} · ${Math.round(scale * 100)}%`;
}
