import { afterEach, expect, test, vi } from 'vitest';

import { OCL_RESOURCES_FILE, oclResourcesUrl } from '../oclResourcesUrl.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the resources are resolved against the mount the page is served under', () => {
  vi.stubGlobal('document', { baseURI: 'https://www.cheminfo.org/3d/' });

  expect(oclResourcesUrl()).toBe(
    'https://www.cheminfo.org/3d/openchemlib-resources.json',
  );
  expect(oclResourcesUrl('ocl/resources.json')).toBe(
    'https://www.cheminfo.org/3d/ocl/resources.json',
  );
  expect(OCL_RESOURCES_FILE).toBe('openchemlib-resources.json');
});

test('outside a page there is no address to hand a worker', () => {
  expect(oclResourcesUrl()).toBeUndefined();
});
