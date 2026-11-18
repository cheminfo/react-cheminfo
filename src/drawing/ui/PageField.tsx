import { FormGroup, HTMLSelect, SegmentedControl } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import type { Orientation } from '../core/pages.ts';
import {
  PAGE_SIZES,
  orientationOf,
  pickedPage,
  samePaper,
  turnedTo,
} from '../core/pages.ts';
import type { DrawPage } from '../core/types.ts';

import { PageSideInput } from './PageSideInput.tsx';

const CUSTOM = 'custom';

/** How a new size of page was asked for. */
export type PageChange = 'picked' | 'typed';

/** What {@link PageField} is given. */
export interface PageFieldProps {
  /** The paper or the slide the drawing is laid out on. */
  page: DrawPage;
  /**
   * Called with the page asked for, its place left to the editor: `picked`
   * from the menu or turned, after which the whole page is usually framed, or
   * `typed` side by side.
   */
  onChange: (page: DrawPage, how: PageChange) => void;
  /**
   * What is said under the fields, such as `pagesLine`'s count of sheets.
   * @default undefined — nothing
   */
  helperText?: ReactNode;
}

/**
 * The page setup of an editor, the same in every one of the family: the paper
 * or the slide the drawing is laid out on, portrait or landscape, and its two
 * sides in centimetres. `react-cheminfo/styles/drawing.css` lays it out.
 * @param props - See {@link PageFieldProps}.
 * @returns A row of a form.
 */
export function PageField(props: PageFieldProps): ReactElement {
  const { page, onChange, helperText } = props;
  const matched = PAGE_SIZES.find((paper) => samePaper(paper.size, page));
  return (
    <FormGroup label="Page" helperText={helperText}>
      <HTMLSelect
        iconName="caret-down"
        fill
        value={matched?.id ?? CUSTOM}
        aria-label="Page size"
        options={[
          ...PAGE_SIZES.map((paper) => ({
            value: paper.id,
            label: paper.name,
          })),
          ...(matched ? [] : [{ value: CUSTOM, label: 'Another size' }]),
        ]}
        onChange={(event) => {
          const { value } = event.currentTarget;
          const chosen = PAGE_SIZES.find((paper) => paper.id === value);
          if (chosen) onChange(pickedPage(chosen.size, page), 'picked');
        }}
      />
      {page.width === page.height ? null : (
        <SegmentedControl
          className="page-field__orientation"
          aria-label="Page orientation"
          size="small"
          fill
          value={orientationOf(page)}
          options={[
            { label: 'Portrait', value: 'portrait' },
            { label: 'Landscape', value: 'landscape' },
          ]}
          onValueChange={(orientation) => {
            onChange(turnedTo(page, orientation as Orientation), 'picked');
          }}
        />
      )}
      <div className="page-field__size">
        <PageSideInput
          label="Page width"
          value={page.width}
          onChange={(width) => {
            onChange({ ...page, width }, 'typed');
          }}
        />
        <span aria-hidden="true">×</span>
        <PageSideInput
          label="Page height"
          value={page.height}
          onChange={(height) => {
            onChange({ ...page, height }, 'typed');
          }}
        />
        <span className="page-field__unit">cm</span>
      </div>
    </FormGroup>
  );
}
