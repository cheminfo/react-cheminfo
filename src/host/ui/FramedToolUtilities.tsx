import { Dialog } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { CitationMenu } from '../../citation/ui/CitationMenu.tsx';
import { HelpBody } from '../../help/ui/HelpBody.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ToolDocument } from '../core/connectTool.ts';
import type { ToolHello } from '../core/toolMessages.ts';
import { toolAboutUrl } from '../core/toolPage.ts';

import { openTool } from './openTool.ts';

/** The framed tool {@link FramedToolUtilities} speaks for. */
export interface FramedToolUtilitiesProps {
  /** The framed address, `?embed=1` included. */
  url: string;
  /** The tool's host, as the reader knows it, e.g. `3d.cheminfo.org`. */
  name: string;
  /** What the tool said of itself, once it has. */
  tool: ToolHello | null;
  /** How the host introduces itself to the tool's own page. */
  host: string;
  /**
   * What the frame shows, handed to the tool's own page when it is opened.
   * @default null — the page opens as it is
   */
  document?: ToolDocument | null;
  /**
   * Whether the tool's site has an About at `/about`. Without one, neither
   * the About nor a greyed Cite is offered.
   * @default true
   */
  about?: boolean;
  /**
   * Told when the browser would not open the tool's own page.
   * @default undefined
   */
  onBlocked?: () => void;
}

/**
 * The utilities of a framed tool, as toolbar items: its About, how to cite it,
 * help on the page framed when it offers some, and the page opened on its own
 * site — the same About · Cite a site's header carries, for the tool rather
 * than for the page around it.
 *
 * The About is the tool's own page, framed: it says what the tool's site
 * says, in the version that site runs. The works to cite and the help come
 * from the tool's `hello`, so Cite is greyed until the tool has said.
 * Render inside a `Toolbar` of `react-science`.
 * @param props - See {@link FramedToolUtilitiesProps}.
 * @returns The toolbar items.
 */
export function FramedToolUtilities(
  props: FramedToolUtilitiesProps,
): ReactElement {
  const { url, name, tool, host, document = null, onBlocked } = props;
  const { about: hasAbout = true } = props;
  const t = useChromeT();
  const [aboutOpen, setAboutOpen] = useState(false);
  const about = t('framedTool.about', { host: name });
  const cite = t('framedTool.cite', { host: name });
  const help = t('framedTool.help', { host: name });
  const open = t('framedTool.open', { host: name });
  const works = tool?.cite;

  return (
    <>
      {hasAbout ? (
        <Toolbar.Item
          icon="info-sign"
          tooltip={about}
          aria-label={about}
          onClick={() => {
            setAboutOpen(true);
          }}
        />
      ) : null}
      {works === undefined ? (
        hasAbout ? (
          <Toolbar.Item
            icon="citation"
            tooltip={t('framedTool.citeUnknown', { host: name })}
            aria-label={cite}
            disabled
          />
        ) : null
      ) : (
        <Toolbar.PopoverItem
          placement="bottom-end"
          content={<CitationMenu works={works} />}
          itemProps={{ icon: 'citation', tooltip: cite, 'aria-label': cite }}
        />
      )}
      {tool?.help === undefined ? null : (
        <Toolbar.PopoverItem
          placement="bottom-end"
          popoverClassName="help-tooltip"
          content={<HelpBody content={tool.help} />}
          itemProps={{ icon: 'help', tooltip: help, 'aria-label': help }}
        />
      )}
      <Toolbar.Item
        icon="share"
        tooltip={open}
        aria-label={open}
        onClick={() => {
          if (!openTool({ url, host, document })) onBlocked?.();
        }}
      />
      <Dialog
        isOpen={hasAbout && aboutOpen}
        onClose={() => {
          setAboutOpen(false);
        }}
        title={about}
        icon="info-sign"
        className="framed-tool-about"
      >
        <iframe
          className="framed-tool-about__frame"
          title={about}
          src={toolAboutUrl(url)}
        />
      </Dialog>
    </>
  );
}
