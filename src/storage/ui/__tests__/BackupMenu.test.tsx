import type { AlertProps, PopoverNextProps } from '@blueprintjs/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { BackupMenu } from '../BackupMenu.tsx';

vi.mock('@blueprintjs/core', async (importOriginal) => {
  const blueprint = await importOriginal<Record<string, unknown>>();
  return {
    ...blueprint,
    PopoverNext: (props: PopoverNextProps) => (
      <div data-popover="">
        {props.children}
        <div data-content="">{props.content}</div>
      </div>
    ),
    Alert: (props: AlertProps) => (
      <div data-alert="" data-open={String(props.isOpen)}>
        {props.confirmButtonText}
      </div>
    ),
  };
});

const backup = () => Promise.resolve();
const restore = () => Promise.resolve('Restored.');

test('one button that prints nothing, with the backup and the restore behind it', () => {
  const html = renderToStaticMarkup(
    <BackupMenu onBackup={backup} onRestore={restore} accept=".json" />,
  );

  expect(html).toContain(
    'aria-label="Back up or restore everything this site keeps in your browser"',
  );
  expect(html).toContain('no-print');
  expect(html).toContain('Back up everything…');
  expect(html).toContain('Restore a backup…');
  expect(html).toContain('accept=".json"');
  expect(html).toContain('<div data-alert="" data-open="false">Close</div>');
});

test('a site names what its backup holds', () => {
  const html = renderToStaticMarkup(
    <BackupMenu
      title="Back up or restore every script"
      onBackup={backup}
      onRestore={restore}
      accept=".json"
    />,
  );

  expect(html).toContain('aria-label="Back up or restore every script"');
});
