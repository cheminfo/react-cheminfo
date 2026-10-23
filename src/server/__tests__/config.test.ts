import { expect, test } from 'vitest';

import { readHttpAddress, readServerConfig } from '../config.ts';
import { readEnvNumber } from '../envNumber.ts';
import { parseTrustProxy } from '../trustProxy.ts';

const SITE = { siteId: 'osiris', port: 10_620 } as const;

test('an empty environment gives every default', () => {
  expect(readServerConfig({}, SITE)).toStrictEqual({
    port: 10_620,
    host: '0.0.0.0',
    trackingScript: undefined,
    siteUrl: 'https://osiris.cheminfo.org/',
    publicUrl: 'http://localhost:10620/',
    trustProxy: false,
    root: 'dist',
    basePath: '',
  });
});

test('blank variables, as compose forwards them, are unset', () => {
  const config = readServerConfig(
    {
      PORT: '',
      HOST: '  ',
      TRACKING_SCRIPT: ' ',
      SITE_URL: '',
      PUBLIC_URL: '',
      TRUST_PROXY: '',
      SERVER_ROOT: '',
      BASE_PATH: '',
    },
    { ...SITE, root: '/app/dist' },
  );

  expect(config).toStrictEqual({
    port: 10_620,
    host: '0.0.0.0',
    trackingScript: undefined,
    siteUrl: 'https://osiris.cheminfo.org/',
    publicUrl: 'http://localhost:10620/',
    trustProxy: false,
    root: '/app/dist',
    basePath: '',
  });
});

test('every variable a deployment sets is read', () => {
  const config = readServerConfig(
    {
      PORT: '8080',
      HOST: 'localhost',
      TRACKING_SCRIPT: ' <script src="https://datami.example/s.js"></script> ',
      SITE_URL: 'https://www.cheminfo.org/osiris?x=1#top',
      PUBLIC_URL: 'https://osiris.c6h6.org',
      TRUST_PROXY: '192.168.1.5, 10.0.0.0/8',
      SERVER_ROOT: '/public',
      BASE_PATH: 'osiris/',
    },
    SITE,
  );

  expect(config).toStrictEqual({
    port: 8080,
    host: 'localhost',
    trackingScript: '<script src="https://datami.example/s.js"></script>',
    siteUrl: 'https://www.cheminfo.org/osiris/',
    publicUrl: 'https://osiris.c6h6.org/',
    trustProxy: '192.168.1.5, 10.0.0.0/8',
    root: '/public',
    basePath: '/osiris',
  });
});

test('the public address defaults to the port actually read', () => {
  expect(readServerConfig({ PORT: '3000' }, SITE).publicUrl).toBe(
    'http://localhost:3000/',
  );
});

test('a malformed port or address refuses to start', () => {
  expect(() => readServerConfig({ PORT: 'eighty' }, SITE)).toThrow(
    'PORT must be an integer from 1 to 65535, not "eighty".',
  );
  expect(() => readServerConfig({ PORT: '70000' }, SITE)).toThrow(
    'PORT must be an integer from 1 to 65535, not "70000".',
  );
  expect(() =>
    readServerConfig({ SITE_URL: 'osiris.cheminfo.org' }, SITE),
  ).toThrow('SITE_URL must be an http(s) address, not "osiris.cheminfo.org".');
  expect(() =>
    readServerConfig({ PUBLIC_URL: 'ftp://osiris.cheminfo.org' }, SITE),
  ).toThrow(
    'PUBLIC_URL must be an http(s) address, not "ftp://osiris.cheminfo.org".',
  );
});

test('an address keeps its path, ends in a slash, and loses its query', () => {
  const env = { SITE_URL: 'https://learn.cheminfo.org/surge/?embed=1' };

  expect(readHttpAddress(env, 'SITE_URL', 'https://x.org')).toBe(
    'https://learn.cheminfo.org/surge/',
  );
  expect(readHttpAddress({}, 'SITE_URL', 'https://x.org')).toBe(
    'https://x.org/',
  );
});

test('the proxies are named, never counted', () => {
  expect(parseTrustProxy(undefined)).toBe(false);
  expect(parseTrustProxy('')).toBe(false);
  expect(parseTrustProxy(' false ')).toBe(false);
  expect(parseTrustProxy('FALSE')).toBe(false);
  expect(parseTrustProxy('true')).toBe(true);
  expect(parseTrustProxy('True')).toBe(true);
  expect(parseTrustProxy(' 192.168.1.5 ')).toBe('192.168.1.5');
  expect(parseTrustProxy('172.16.0.0/12,192.168.1.5')).toBe(
    '172.16.0.0/12,192.168.1.5',
  );
  expect(() => parseTrustProxy('1')).toThrow(
    "TRUST_PROXY=1 is a hop count, which trusts nothing. Name the proxy's address or CIDR instead.",
  );
  expect(() => parseTrustProxy(' 2 ')).toThrow(
    "TRUST_PROXY=2 is a hop count, which trusts nothing. Name the proxy's address or CIDR instead.",
  );
});

test('a number from the environment falls back when blank and refuses a guess', () => {
  const env = {
    BLANK: '  ',
    INTERVAL: ' 3600 ',
    RATIO: '0.25',
    WORD: 'often',
    NEGATIVE: '-1',
    FRACTION: '1.5',
  };

  expect(readEnvNumber(env, 'MISSING', 60)).toBe(60);
  expect(readEnvNumber(env, 'BLANK', 60)).toBe(60);
  expect(readEnvNumber(env, 'INTERVAL', 60, { min: 1, integer: true })).toBe(
    3600,
  );
  expect(readEnvNumber(env, 'RATIO', 1, { max: 1 })).toBe(0.25);
  expect(() => readEnvNumber(env, 'WORD', 60)).toThrow(
    'WORD must be a number, not "often".',
  );
  expect(() => readEnvNumber(env, 'NEGATIVE', 60, { min: 0 })).toThrow(
    'NEGATIVE must be a number of at least 0, not "-1".',
  );
  expect(() => readEnvNumber(env, 'FRACTION', 1, { integer: true })).toThrow(
    'FRACTION must be an integer, not "1.5".',
  );
  expect(() => readEnvNumber(env, 'INTERVAL', 1, { max: 60 })).toThrow(
    'INTERVAL must be a number of at most 60, not "3600".',
  );
});
