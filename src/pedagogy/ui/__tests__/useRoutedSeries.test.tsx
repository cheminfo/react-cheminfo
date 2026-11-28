/**
 * A graded series reads its seed and its row's share off the address, and
 * writes both back through the site's practice router.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

import { createTabRouter } from '../../../router/core/tabRouter.ts';
import { splitParam } from '../../../split/core/split.ts';
import { createAttemptStore } from '../../core/attempts.ts';
import type { RoutedSeriesProps } from '../useRoutedSeries.ts';
import { useRoutedSeries } from '../useRoutedSeries.ts';

type Tab = 'mass' | 'about';

const router = createTabRouter<Tab>({
  tabs: [
    { id: 'mass', path: '/' },
    { id: 'about', path: '/about' },
  ],
  home: 'mass',
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function read(search: string, writes: string[]): RoutedSeriesProps {
  vi.stubGlobal('location', { pathname: '/', search, hash: '' });
  let props: RoutedSeriesProps | undefined;
  function Probe() {
    props = useRoutedSeries<Tab, 'mass'>({
      series: {
        router,
        writeSeries: (tab, value, history) => {
          writes.push(`series ${tab} ${String(value)} ${history}`);
        },
        writeSplit: (tab, share) => {
          writes.push(`split ${tab} ${String(share)}`);
        },
      },
      tab: 'mass',
      split: {
        codec: splitParam({ min: 20, max: 60 }),
        opening: 40,
        range: { min: 20, max: 60 },
      },
      stackBelow: 720,
      store: createAttemptStore({ key: 'test-routed' }),
      count: 10,
      onCount: () => undefined,
    });
    return null;
  }
  renderToStaticMarkup(<Probe />);
  if (!props) throw new Error('the probe did not render');
  return props;
}

test('the seed and the share come from the address, the rest from the site', () => {
  const props = read('?seed=42&split=70', []);

  expect(props.seed).toBe(42);
  expect(props.split).toBe(60);
  expect(props.defaultSplit).toBe(40);
  expect(props.splitRange).toStrictEqual({ min: 20, max: 60 });
  expect(props.stackBelow).toBe(720);
  expect(props.count).toBe(10);
});

test('an address naming no series opens a fresh one, and a pick is written back', () => {
  const writes: string[] = [];
  const props = read('', writes);
  props.onSeed(7, 'push');
  props.onSplit(null);

  expect(props.seed).toBeNull();
  expect(props.split).toBeNull();
  expect(writes).toStrictEqual(['series mass 7 push', 'split mass null']);
});
