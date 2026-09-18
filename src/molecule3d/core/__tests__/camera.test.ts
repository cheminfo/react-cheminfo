import { expect, test } from 'vitest';

import type { Molecule3DCamera } from '../camera.ts';
import {
  DEFAULT_MOLECULE_3D_CAMERA,
  formatMolecule3DCamera,
  molecule3DCameraParam,
  normalizeMolecule3DCamera,
  parseMolecule3DCamera,
  sameMolecule3DCamera,
} from '../camera.ts';

const TURNED: Molecule3DCamera = {
  rotation: [0, 0.7071, 0, 0.7071],
  zoom: 2.5,
  offset: [0, 0, 0],
};

test('a camera looking at the centre writes five numbers', () => {
  expect(formatMolecule3DCamera(TURNED)).toBe('0,0.7071,0,0.7071,2.5');
});

test('a panned camera writes its target offset as three more', () => {
  const panned = { ...TURNED, offset: [0.5, -0.25, 0] as const };

  expect(formatMolecule3DCamera(panned)).toBe(
    '0,0.7071,0,0.7071,2.5,0.5,-0.25,0',
  );
});

test('what a link carries reads back as the camera that wrote it', () => {
  const text = formatMolecule3DCamera(TURNED);
  const read = parseMolecule3DCamera(text);

  expect(read).not.toBeNull();
  expect(sameMolecule3DCamera(read, TURNED)).toBe(true);
  expect(formatMolecule3DCamera(read as Molecule3DCamera)).toBe(text);
});

test('a panned camera survives the round trip too', () => {
  const panned: Molecule3DCamera = { ...TURNED, offset: [0.5, -0.25, 1.75] };
  const read = parseMolecule3DCamera(formatMolecule3DCamera(panned));

  expect(read?.offset).toStrictEqual([0.5, -0.25, 1.75]);
  expect(sameMolecule3DCamera(read, panned)).toBe(true);
});

test('a rotation a link carries is made a unit quaternion', () => {
  const camera = parseMolecule3DCamera('0,2,0,0,1');

  expect(camera?.rotation).toStrictEqual([0, 1, 0, 0]);
});

test('a zoom beyond what the viewer serves is brought back into range', () => {
  expect(parseMolecule3DCamera('0,0,0,1,1000')?.zoom).toBe(100);
  expect(parseMolecule3DCamera('0,0,0,1,0')?.zoom).toBe(0.01);
});

test('text that does not describe a camera reads as none', () => {
  expect(parseMolecule3DCamera('')).toBeNull();
  expect(parseMolecule3DCamera('0,0,0,1')).toBeNull();
  expect(parseMolecule3DCamera('0,0,0,1,1,0')).toBeNull();
  expect(parseMolecule3DCamera('0,0,0,front,1')).toBeNull();
  // Four zeros are no rotation at all, so there is nothing to look from.
  expect(parseMolecule3DCamera('0,0,0,0,1')).toBeNull();
});

test('a camera whose rotation is degenerate falls back to the front view', () => {
  expect(
    normalizeMolecule3DCamera({
      rotation: [0, 0, 0, 0],
      zoom: 3,
      offset: [1, 1, 1],
    }),
  ).toStrictEqual(DEFAULT_MOLECULE_3D_CAMERA);
});

test('the codec leaves the address alone while nobody has turned the model', () => {
  const codec = molecule3DCameraParam();

  expect(codec.serialize(DEFAULT_MOLECULE_3D_CAMERA)).toBeNull();
  expect(codec.serialize(null)).toBeNull();
  expect(codec.serialize(TURNED)).toBe('0,0.7071,0,0.7071,2.5');
});

test('the codec reads a missing or malformed parameter as no camera', () => {
  const codec = molecule3DCameraParam();

  expect(codec.parse(null)).toBeNull();
  expect(codec.parse('nonsense')).toBeNull();
  expect(
    sameMolecule3DCamera(codec.parse('0,0.7071,0,0.7071,2.5'), TURNED),
  ).toBe(true);
});

test('two cameras a link cannot tell apart are one camera', () => {
  expect(sameMolecule3DCamera(TURNED, { ...TURNED, zoom: 2.5001 })).toBe(true);
  expect(sameMolecule3DCamera(TURNED, { ...TURNED, zoom: 2.6 })).toBe(false);
  expect(sameMolecule3DCamera(null, null)).toBe(true);
  expect(sameMolecule3DCamera(null, TURNED)).toBe(false);
});
