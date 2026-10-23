import type { ReactElement } from 'react';
import { MF } from 'react-mf';

import type { ClickToCopyElement } from '../../clipboard/ui/ClickToCopy.tsx';
import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { formulaHtml } from '../core/formulaText.ts';
import { normalizeFormula } from '../core/normalizeFormula.ts';

/** What {@link CopyableFormula} draws and copies. */
export interface CopyableFormulaProps {
  /** The formula, as the data writes it: `NO3-`, `CuSO4.5H2O`, `C6H12O6`. */
  formula: string;
  /**
   * The element drawn: a cell of its own inside a table.
   * @default 'span'
   */
  as?: Extract<ClickToCopyElement, 'span' | 'td'>;
  /**
   * What the value is called in the hover title.
   * @default the chrome's own word for it, in the language of the page
   */
  label?: string;
  /**
   * Class the value carries, in addition to `click-to-copy`.
   * @default undefined
   */
  className?: string;
}

/**
 * A formula drawn with its subscripts and copied by a click: as text for
 * another tool, and as HTML, so a paste into a document keeps the subscripts
 * and the charge.
 * @param props - The formula, the element it is drawn as, and its label.
 * @returns The formula.
 */
export function CopyableFormula(props: CopyableFormulaProps): ReactElement {
  const { formula, as = 'span', label, className } = props;
  const t = useChromeT();
  return (
    <ClickToCopy
      as={as}
      className={className}
      label={label ?? t('formula.copyLabel')}
      value={{ text: formula, html: formulaHtml(formula) }}
    >
      <MF mf={normalizeFormula(formula)} />
    </ClickToCopy>
  );
}
