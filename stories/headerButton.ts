import type { PopoverNextProps } from '@blueprintjs/core';
import type { ArgTypes } from '@storybook/react-vite';

/** The sides a header button is ever opened on. */
export const PLACEMENTS = [
  'bottom-end',
  'bottom-start',
  'bottom',
  'top-end',
  'top-start',
  'top',
  'left-start',
  'right-start',
] as const satisfies ReadonlyArray<NonNullable<PopoverNextProps['placement']>>;

/**
 * The controls every button of a site header takes, so the stories describe
 * them once rather than each in its own words. The prose comes from the props'
 * own JSDoc; only the shape of the control is set here.
 */
export const HEADER_BUTTON_ARG_TYPES: Partial<ArgTypes> = {
  label: { control: 'text' },
  compact: { control: 'boolean' },
  placement: { control: 'select', options: PLACEMENTS },
};
