import type { IconName } from '@blueprintjs/core';
import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
} from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { Arrangement } from '../core/arrangement.ts';

import { ArrangeIcon } from './ArrangeIcon.tsx';

/** The fewest blocks each kind of arrangement can do anything with. */
const FEWEST_ALIGNED = 2;
const FEWEST_DISTRIBUTED = 3;

/** One line of the menu. */
interface AlignChoice {
  arrangement: Arrangement;
  text: string;
  icon: IconName | ReactElement;
}

// Blueprint names its two centre icons after the axis drawn, so aligning the
// centres across takes the vertical one, and the middles the horizontal one.
const HORIZONTAL: readonly AlignChoice[] = [
  { arrangement: 'left', text: 'Align left', icon: 'alignment-left' },
  {
    arrangement: 'centre',
    text: 'Align centre',
    icon: 'alignment-vertical-center',
  },
  { arrangement: 'right', text: 'Align right', icon: 'alignment-right' },
];

const VERTICAL: readonly AlignChoice[] = [
  { arrangement: 'top', text: 'Align top', icon: 'alignment-top' },
  {
    arrangement: 'middle',
    text: 'Align middle',
    icon: 'alignment-horizontal-center',
  },
  { arrangement: 'bottom', text: 'Align bottom', icon: 'alignment-bottom' },
];

const DISTRIBUTED: readonly AlignChoice[] = [
  {
    arrangement: 'distribute-horizontally',
    text: 'Distribute horizontally',
    icon: 'horizontal-distribution',
  },
  {
    arrangement: 'distribute-vertically',
    text: 'Distribute vertically',
    icon: 'vertical-distribution',
  },
];

const LINED_UP: readonly AlignChoice[] = [
  {
    arrangement: 'row',
    text: 'Arrange in a row',
    icon: <ArrangeIcon along="row" />,
  },
  {
    arrangement: 'column',
    text: 'Arrange in a column',
    icon: <ArrangeIcon along="column" />,
  },
];

/** What {@link AlignButton} is given. */
export interface AlignButtonProps {
  /** How many blocks the selection holds, a group counting as one. */
  blocks: number;
  /** Called with the arrangement picked from the menu. */
  onArrange: (arrangement: Arrangement) => void;
  /**
   * What the button is wrapped in, such as the tooltip naming its command and
   * its key.
   * @default the button alone
   */
  wrapButton?: (button: ReactElement) => ReactElement;
}

/**
 * The menu lining up what is selected along an edge or a middle, spacing it
 * out evenly, or both at once as a row or a column. It opens from two blocks;
 * spacing out alone asks for three.
 * @param props - See {@link AlignButtonProps}.
 * @returns The button and its menu.
 */
export function AlignButton(props: AlignButtonProps): ReactElement {
  const { blocks, onArrange, wrapButton = unwrapped } = props;
  const disabled = blocks < FEWEST_ALIGNED;
  const lines = (choices: readonly AlignChoice[], fewest: number) =>
    choices.map(({ arrangement, text, icon }) => (
      <MenuItem
        key={arrangement}
        icon={icon}
        text={text}
        disabled={blocks < fewest}
        onClick={() => {
          onArrange(arrangement);
        }}
      />
    ));

  return (
    <PopoverNext
      placement="bottom-start"
      disabled={disabled}
      content={
        <Menu aria-label="Align and distribute">
          {lines(HORIZONTAL, FEWEST_ALIGNED)}
          <MenuDivider />
          {lines(VERTICAL, FEWEST_ALIGNED)}
          <MenuDivider />
          {lines(DISTRIBUTED, FEWEST_DISTRIBUTED)}
          <MenuDivider />
          {lines(LINED_UP, FEWEST_ALIGNED)}
        </Menu>
      }
    >
      {wrapButton(
        <Button
          variant="minimal"
          icon="alignment-left"
          text="Align"
          endIcon="caret-down"
          disabled={disabled}
        />,
      )}
    </PopoverNext>
  );
}

function unwrapped(button: ReactElement): ReactElement {
  return button;
}
