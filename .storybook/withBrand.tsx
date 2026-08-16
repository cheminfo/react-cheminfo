import type { Decorator } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { brandNamed } from '../stories/brands.ts';

import { BrandTokens } from './BrandTokens.tsx';

/**
 * Reads the Brand toolbar and hands its pair to the story, so a component is
 * looked at under the two colours a real site would give it.
 * @param Story - The story being rendered.
 * @param context - The story's context, which carries the toolbar's values.
 * @returns The story, under the colours the toolbar names.
 */
export const withBrand: Decorator = (Story, context): ReactElement => (
  <BrandTokens brand={brandNamed(context.globals.brand)}>
    <Story />
  </BrandTokens>
);
