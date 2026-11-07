import { afterEach, expect, test, vi } from 'vitest';

import { canShareFile, shareFile } from '../shareFile.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a browser with no share sheet shares nothing', async () => {
  vi.stubGlobal('navigator', {});

  expect(canShareFile('plate.svg', 'image/svg+xml')).toBe(false);
  await expect(shareFile(svgFile())).resolves.toBe('unsupported');
});

test('a type the sheet refuses is not offered, and never reaches it', async () => {
  const sheet = stubSheet({ refuse: 'image/svg+xml' });

  expect(canShareFile('plate.svg', 'image/svg+xml')).toBe(false);
  expect(canShareFile('plate.png', 'image/png')).toBe(true);
  await expect(shareFile(svgFile())).resolves.toBe('unsupported');
  expect(sheet.shared).toHaveLength(0);
});

test('a sheet whose check throws is a sheet that takes nothing', () => {
  vi.stubGlobal('navigator', {
    share: () => Promise.resolve(),
    canShare: () => {
      throw new TypeError('Illegal invocation');
    },
  });

  expect(canShareFile('plate.png', 'image/png')).toBe(false);
});

test('the sheet is asked for before anything is awaited', async () => {
  const sheet = stubSheet();

  const outcome = shareFile(svgFile());

  expect(sheet.shared).toHaveLength(1);

  await expect(outcome).resolves.toBe('sent');
});

test('the file goes with its name, its bytes and a type with no parameter', async () => {
  const sheet = stubSheet();

  await shareFile(svgFile());

  const [file] = sheet.shared;

  expect(file?.name).toBe('plate.svg');
  expect(file?.type).toBe('image/svg+xml');
  await expect(file?.text()).resolves.toBe('<svg/>');
});

test('a file whose type is already bare goes as it is', async () => {
  const sheet = stubSheet();
  const png = new File(['png'], 'plate.png', { type: 'image/png' });

  await shareFile(png);

  expect(sheet.shared[0]).toBe(png);
});

test('a sheet closed without picking an app is a cancel', async () => {
  stubSheet({ fail: 'AbortError' });

  await expect(shareFile(svgFile())).resolves.toBe('cancelled');
});

test('a press no longer fresh is an expired send', async () => {
  stubSheet({ fail: 'NotAllowedError' });

  await expect(shareFile(svgFile())).resolves.toBe('expired');
});

test('any other refusal is the browser’s own error', async () => {
  stubSheet({ fail: 'DataError' });

  await expect(shareFile(svgFile())).rejects.toThrow('DataError');
});

function svgFile(): File {
  return new File(['<svg/>'], 'plate.svg', {
    type: 'image/svg+xml;charset=utf-8',
  });
}

interface SheetOptions {
  /** A type the sheet does not take. */
  refuse?: string;
  /** The name of the error the sheet rejects with. */
  fail?: string;
}

/**
 * A share sheet as Chrome and Safari expose it.
 * @param options - See {@link SheetOptions}.
 * @returns The files it was handed.
 */
function stubSheet(options: SheetOptions = {}): { shared: File[] } {
  const shared: File[] = [];
  vi.stubGlobal('navigator', {
    canShare: (data: ShareData) =>
      (data.files ?? []).every((file) => file.type !== options.refuse),
    share: (data: ShareData) => {
      shared.push(...(data.files ?? []));
      return options.fail === undefined
        ? Promise.resolve()
        : Promise.reject(new DOMException(options.fail, options.fail));
    },
  });
  return { shared };
}
