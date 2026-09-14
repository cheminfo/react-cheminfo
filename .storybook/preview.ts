// The family's tokens come from `chrome.css` itself, so a component is looked at
// under the values the sites load; `preview-head.html` only adds the canvas.
import '@blueprintjs/core/lib/css/blueprint.css';
import '../styles/chrome.css';

import type { Preview } from '@storybook/react-vite';

import { BRAND_SITES, DEFAULT_BRAND_SITE } from '../stories/brands.ts';

import { withBrand } from './withBrand.tsx';

const preview: Preview = {
  decorators: [withBrand],
  globalTypes: {
    brand: {
      description: 'The two colours the surrounding site owns',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: BRAND_SITES.map((site) => ({ value: site, title: site })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: DEFAULT_BRAND_SITE,
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
};

export default preview;
