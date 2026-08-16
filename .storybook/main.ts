import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (viteConfig, { configType }) =>
    // GitHub Pages serves the build from the repository's own path, so a build
    // addresses its assets relatively; the dev server stays at the root.
    configType === 'PRODUCTION' ? { ...viteConfig, base: './' } : viteConfig,
};

export default config;
