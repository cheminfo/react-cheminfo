// The family's own tokens are in `preview-head.html`, which is what puts them
// on the canvas the stories render in.
import '@blueprintjs/core/lib/css/blueprint.css';

import type { Preview } from '@storybook/react-vite';

import { BRANDS, DEFAULT_BRAND } from '../stories/brands.ts';

import { withBrand } from './withBrand.tsx';

const preview: Preview = {
  decorators: [withBrand],
  globalTypes: {
    brand: {
      description: 'The two colours the surrounding site owns',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: BRANDS.map((brand) => ({
          value: brand.name,
          title: brand.name,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: DEFAULT_BRAND.name,
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
};

export default preview;
