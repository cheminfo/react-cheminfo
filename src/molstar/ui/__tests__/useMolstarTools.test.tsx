// @vitest-environment jsdom
/**
 * The toolbar's state reaches the viewer: the spin with the family's speed,
 * and the measuring tool picked — once the viewer exists, and again on a new
 * one.
 */

import type { RefObject } from 'react';
import { act, useEffect, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { MeasurementKind } from '../../../molecule3d/core/measurement.ts';
import { DEFAULT_SPIN_SPEED } from '../../core/camera.ts';
import type { MolstarTools, MolstarToolsViewer } from '../useMolstarTools.ts';
import { useMolstarTools } from '../useMolstarTools.ts';

let host: HTMLDivElement;
let root: Root;
let heard: string[];
/** What the probe's last render saw. */
const seen: { tools: MolstarTools | null } = { tools: null };

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  heard = [];
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

const viewer: MolstarToolsViewer = {
  setSpin: (spinning, speed) => {
    heard.push(`spin ${spinning} ${speed}`);
    return Promise.resolve();
  },
  setMeasureKind: (kind: MeasurementKind | null) => {
    heard.push(`measure ${kind ?? 'none'}`);
    return Promise.resolve();
  },
};

function current(): MolstarTools {
  if (seen.tools === null) throw new Error('the probe has not rendered');
  return seen.tools;
}

function Probe(props: { container: HTMLElement | null }) {
  const viewerRef: RefObject<MolstarToolsViewer | null> = useRef(viewer);
  const tools = useMolstarTools(viewerRef, props.container);
  useEffect(() => {
    seen.tools = tools;
  });
  return null;
}

test('the viewer is handed the spin and the tool at first, and every change', () => {
  act(() => {
    root.render(<Probe container={host} />);
  });
  act(() => {
    current().setSpinning(true);
  });
  act(() => {
    current().setMeasureKind('angle');
  });

  expect(heard).toStrictEqual([
    `spin false ${DEFAULT_SPIN_SPEED}`,
    'measure none',
    `spin true ${DEFAULT_SPIN_SPEED}`,
    'measure angle',
  ]);
  expect(current().spinning).toBe(true);
  expect(current().measureKind).toBe('angle');
});

test('a new container is a new viewer, handed the state again', () => {
  act(() => {
    root.render(<Probe container={host} />);
  });
  act(() => {
    current().setSpinning(true);
  });
  heard = [];
  act(() => {
    root.render(<Probe container={document.body} />);
  });

  expect(heard).toStrictEqual([
    `spin true ${DEFAULT_SPIN_SPEED}`,
    'measure none',
  ]);
});
