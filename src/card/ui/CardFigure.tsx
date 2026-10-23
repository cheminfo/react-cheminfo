import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import { FigureDownload } from '../../download/ui/FigureDownload.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayLayer } from '../../overlay/ui/OverlayLayer.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

/** What {@link CardFigure} draws and takes away. */
export interface CardFigureProps {
  /** The drawing: a chart, a structure, a grid of them. */
  children: ReactNode;
  /** What a saved file is called, without its extension. */
  fileName: string;
  /**
   * Glyphs drawn above the one copying the picture: the copy of the data the
   * figure is drawn from, the notations of its structure
   * (`StructureExportButton` of `react-cheminfo/structure`).
   * @default undefined - the picture's glyph alone
   */
  tools?: ReactNode;
  /**
   * Class of the box the drawing is in, which is what the picture holds.
   * @default undefined
   */
  className?: string;
  /**
   * Take the whole width the card gives, as a grid of structures does.
   * @default false - as wide as the drawing
   */
  fill?: boolean;
  /**
   * The drawing is HTML rather than one SVG or canvas — a grid of cells — and
   * the picture saved is painted from it as it is seen.
   * @default false
   */
  html?: boolean;
  /**
   * What the picture's glyph is called, for the pointer and a screen reader.
   * @default the chrome's own line, `Copy or save the picture`
   */
  label?: string;
}

/**
 * A figure of a card with the glyphs that take it away: the picture copied as
 * a PNG or saved as a PNG or an SVG, as the chat offers it for its own
 * figures, and whatever else the figure carries.
 *
 * The glyphs stand in a column beside the figure's top right corner rather
 * than over it, so they hide no part of a curve or an atom, and they fade
 * until the figure is pointed at or one of them holds the focus: a card shown
 * in a chat is read far more often than it is copied. `styles/card.css` draws
 * the column.
 * @param props - See {@link CardFigureProps}.
 * @returns The figure, with its column of glyphs.
 */
export function CardFigure(props: CardFigureProps): ReactElement {
  const { children, fileName, tools, className, label } = props;
  const { fill = false, html = false } = props;
  const t = useChromeT();
  const id = useId();
  return (
    <div className={joinClassNames('card-figure', fill && 'card-figure--fill')}>
      <div
        id={id}
        className={joinClassNames('card-figure__drawing', className)}
        data-figure={html ? 'html' : undefined}
      >
        {children}
      </div>
      {/* Compact: the glyphs of a figure shown in somebody else's page. */}
      <OverlayLayer density="compact" awake>
        <div className="card-figure__tools" data-testid="figure-tools">
          {tools}
          <FigureDownload
            targetId={id}
            fileName={fileName}
            label={label ?? t('card.copyPicture')}
            testId="card-save-figure"
          />
        </div>
      </OverlayLayer>
    </div>
  );
}
