import type { ReactElement, ReactNode } from 'react';

import { OverlayLayer } from '../../overlay/ui/OverlayLayer.tsx';
import { structureSource } from '../core/structureSource.ts';

import type { StructureProps } from './Structure.tsx';
import { Structure } from './Structure.tsx';
import { StructureExportButton } from './StructureExportButton.tsx';

/** What {@link CardStructure} draws and hands over. */
export interface CardStructureProps extends StructureProps {
  /**
   * Base name of every file saved from the export, extension excluded.
   * @default 'structure'
   */
  name?: string;
  /**
   * Whether the structure is a query fragment, such as a toxicophore, whose
   * idCode is not a molecule's.
   * @default false
   */
  fragment?: boolean;
  /**
   * What the glyph is called, for the pointer and for a screen reader.
   * @default the chrome's own line, `Copy or save the structure: SMILES,
   *   molfile`
   */
  label?: string;
  /**
   * The drawing, when the site draws the structure itself — its own
   * highlights, its own numbering. The export still reads the notations.
   * @default a `Structure` drawn from the same notations, at the same size
   */
  children?: ReactNode;
}

/**
 * A structure of a card, with the glyph that hands it over: the export
 * dialog, which copies it as an SVG or a PNG, a SMILES or a molfile, V2000 or
 * V3000. Every structure an answer draws carries it, alone or in a grid, so
 * none has to be redrawn to be reused.
 *
 * The glyph stands beside the top right corner, faded until the structure is
 * pointed at, as the glyphs of `CardFigure` (`react-cheminfo/card`) do;
 * `styles/card.css` draws both. A structure with nothing to read draws its
 * placeholder alone.
 * @param props - The structure, its size, and the name of its files.
 * @returns The structure and its glyph.
 */
export function CardStructure(props: CardStructureProps): ReactElement {
  const { name, fragment, label, children, ...structure } = props;
  const { idCode, coordinates, molfile, smiles } = structure;
  const drawing = children ?? <Structure {...structure} />;
  const source = structureSource({ idCode, coordinates, molfile, smiles });
  if (source.kind === 'empty') return <>{drawing}</>;

  return (
    <div className="card-figure card-structure">
      <div className="card-figure__drawing">{drawing}</div>
      {/* Compact: the glyphs of a figure shown in somebody else's page. */}
      <OverlayLayer density="compact" awake>
        <div className="card-figure__tools" data-testid="figure-tools">
          <StructureExportButton
            idCode={idCode}
            coordinates={coordinates}
            molfile={molfile}
            smiles={smiles}
            name={name}
            fragment={fragment}
            label={label}
          />
        </div>
      </OverlayLayer>
    </div>
  );
}
