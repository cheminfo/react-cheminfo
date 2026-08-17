import { Checkbox } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { HideablePart } from '../core/index.ts';

const OPTION_STYLE: CSSProperties = { marginBottom: 8 };

const DESCRIPTION_STYLE: CSSProperties = {
  display: 'block',
  marginLeft: 26,
  color: '#5b6875',
  fontSize: 12,
};

export interface SharePartOptionsProps {
  /** The parts this page can switch off, in the order the vocabulary lists them. */
  parts: readonly HideablePart[];
  /** The parts the draft currently switches off. */
  hidden: readonly string[];
  /** Called with the part and whether the link should switch it off. */
  onChange: (part: string, hidden: boolean) => void;
}

/**
 * One box per part of the page, worded positively: a ticked box is a part the
 * link keeps, which is how somebody building a course tile thinks about it.
 * @param props - The parts, what is switched off, and how to change it.
 * @returns The list of boxes.
 */
export function SharePartOptions(props: SharePartOptionsProps): ReactElement {
  const { parts, hidden, onChange } = props;

  return (
    <>
      {parts.map((part) => (
        <div key={part.key} style={OPTION_STYLE} className="share-part">
          <Checkbox
            checked={!hidden.includes(part.key)}
            label={part.label}
            onChange={(event) => {
              onChange(part.key, !event.currentTarget.checked);
            }}
          />
          <span style={DESCRIPTION_STYLE} className="share-part-description">
            {part.description}
          </span>
        </div>
      ))}
    </>
  );
}
