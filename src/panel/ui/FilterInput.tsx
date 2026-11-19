import { InputGroup } from '@blueprintjs/core';

import { useChromeT } from '../../i18n/ui/useT.ts';

import { ClearButton } from './ClearButton.tsx';

export interface FilterInputProps {
  /** What the user typed. */
  value: string;
  /** Called with what the user typed, and with `''` when the cross is clicked. */
  onValueChange: (value: string) => void;
  /** What the box says while it is empty. */
  placeholder: string;
  /**
   * Whether the box takes the caret as it appears, for the times it is revealed
   * by a click on a toolbar item somewhere else.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * What a screen reader calls the box.
   * @default undefined — the placeholder names it
   */
  ariaLabel?: string;
  /**
   * Called when Enter is pressed in the box, to open the entry the filter
   * leads to.
   * @default undefined — Enter does nothing
   */
  onEnter?: () => void;
}

/**
 * The box a list is filtered through, with a cross to empty it again.
 *
 * A filter left behind hides entries that are still there, and a peak table is
 * exactly where that goes unnoticed — a spectrum with three peaks in it looks
 * like a spectrum with three peaks in it. So every list that offers a filter
 * also offers one click back to the whole of it rather than a held backspace.
 *
 * Every correction the browser offers is turned off: a formula, an m/z and a
 * residue name are neither words nor sentences, and a mobile keyboard
 * capitalising `mNa+` or autocorrecting `Hex` is how a query stops matching
 * anything.
 * @param props - Component props.
 * @returns The box.
 */
export function FilterInput(props: FilterInputProps) {
  const { value, onValueChange, placeholder, autoFocus = false } = props;
  const { ariaLabel, onEnter } = props;
  const t = useChromeT();

  return (
    <InputGroup
      autoFocus={autoFocus}
      leftIcon="search"
      size="small"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      rightElement={
        value.length > 0 ? (
          <ClearButton
            label={t('panel.clearFilter')}
            onClick={() => onValueChange('')}
          />
        ) : undefined
      }
      onValueChange={onValueChange}
      onKeyDown={
        onEnter === undefined
          ? undefined
          : (event) => {
              if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
                return;
              }
              event.preventDefault();
              onEnter();
            }
      }
    />
  );
}
