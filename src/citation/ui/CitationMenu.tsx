import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { SvgLogoDoi } from 'cheminfo-font';
import type { CSSProperties, ReactElement } from 'react';

import { CITATION_DOWNLOADS } from '../core/formats.ts';
import type { Reference } from '../core/reference.ts';
import { doiUrl } from '../core/reference.ts';
import type { CitedWork } from '../core/works.ts';
import { citedReferences } from '../core/works.ts';

import { CopyFormatEntries } from './CopyFormatEntries.tsx';
import { WorkEntry } from './WorkEntry.tsx';
import { DownloadEntry } from './entries.tsx';
import { useCopyFeedback } from './useCopyFeedback.ts';

const MENU_STYLE: CSSProperties = { minWidth: 240 };
// A set names what each work covers, which needs the room a title does not.
const SET_MENU_STYLE: CSSProperties = { minWidth: 300 };
const DOI_ICON_STYLE: CSSProperties = { width: 16, height: 16 };

/** What a site asks to be cited when it is one work. */
export interface CitedReferenceProps {
  /** The work being cited. */
  reference: Reference;
}

/** What a site asks to be cited when it is built on several works. */
export interface CitedWorksProps {
  /** The works being cited, in the order the site names them. */
  works: readonly CitedWork[];
  /**
   * The line heading the menu, saying which of the works a reader is expected
   * to cite.
   * @default 'Please cite both works', or 'Please cite every work' past two
   */
  guidance?: string;
}

export type CitationMenuProps = CitedReferenceProps | CitedWorksProps;

/**
 * What the Cite button opens: the article at its DOI, the reference copied in
 * the style a journal asks for, and the files a reference manager imports. A
 * site built on several works lists them all, each behind what citing it
 * credits, and the copy and download entries then carry every reference at
 * once.
 * @param props - The work, or the works, being cited.
 * @returns The citation menu.
 */
export function CitationMenu(props: CitationMenuProps): ReactElement {
  if ('works' in props) {
    if (props.works.length > 1) {
      return <WorkSetMenu works={props.works} guidance={props.guidance} />;
    }
    const first = props.works[0];
    if (first === undefined) {
      throw new Error('a citation menu needs at least one work to cite');
    }
    return <OneWorkMenu reference={first.reference} />;
  }
  return <OneWorkMenu reference={props.reference} />;
}

/**
 * The menu of a site asking for a single work: the article, then everything a
 * reader does with its reference.
 * @param props - The work being cited.
 * @returns The menu.
 */
function OneWorkMenu(props: CitedReferenceProps): ReactElement {
  const { reference } = props;
  const feedback = useCopyFeedback();
  const references = [reference];

  return (
    <Menu className="citation-menu" style={MENU_STYLE}>
      <MenuItem
        icon={<SvgLogoDoi style={DOI_ICON_STYLE} />}
        text={`${reference.journalAbbreviation} ${reference.year}`}
        label={reference.doi}
        href={doiUrl(reference)}
        target="_blank"
        rel="noreferrer"
      />
      <MenuDivider title="Copy the reference as" />
      <CopyFormatEntries references={references} feedback={feedback} />
      <ImportSection references={references} />
    </Menu>
  );
}

/**
 * The menu of a site asking for several works: what each one covers, then the
 * whole set copied or saved at once.
 * @param props - The works being cited, and the line heading them.
 * @returns The menu.
 */
function WorkSetMenu(props: CitedWorksProps): ReactElement {
  const { works, guidance } = props;
  const feedback = useCopyFeedback();
  const references = citedReferences(works);
  const both = works.length === 2;

  return (
    <Menu className="citation-menu" style={SET_MENU_STYLE}>
      <MenuDivider
        title={
          guidance ??
          (both ? 'Please cite both works' : 'Please cite every work')
        }
      />
      {works.map((work) => (
        <WorkEntry key={work.reference.doi} work={work} feedback={feedback} />
      ))}
      <MenuDivider
        title={both ? 'Copy both references as' : 'Copy every reference as'}
      />
      <CopyFormatEntries references={references} feedback={feedback} />
      <ImportSection references={references} />
    </Menu>
  );
}

/**
 * The files a reference manager imports, holding every reference the menu is
 * about.
 * @param props - The references saved by the entries.
 * @param props.references - The works being saved.
 * @returns The last section of the menu.
 */
function ImportSection(props: {
  references: readonly Reference[];
}): ReactElement {
  const { references } = props;
  return (
    <>
      <MenuDivider title="Import into a reference manager" />
      {CITATION_DOWNLOADS.map((download) => (
        <DownloadEntry
          key={download.format}
          references={references}
          download={download}
        />
      ))}
    </>
  );
}
