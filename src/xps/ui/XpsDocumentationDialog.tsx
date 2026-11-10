import { DocumentationDialogFrame } from '../../panel/ui/DocumentationDialogFrame.tsx';

import { xpsDocumentationSections } from './xpsDocumentationSections.tsx';

export interface XpsDocumentationDialogProps {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when it is dismissed. */
  onClose: () => void;
}

/**
 * How the viewer is used, written in the viewer.
 *
 * Documentation that lives on a website is documentation nobody reads with a
 * spectrum half interrogated: this ships with the component, so the answer is
 * one click away from the chart and can never be a version behind the tool.
 * Only the words are the viewer's own; the dialog is the family's.
 * @param props - Component props.
 * @returns The dialog.
 */
export function XpsDocumentationDialog(props: XpsDocumentationDialogProps) {
  const { isOpen, onClose } = props;

  return (
    <DocumentationDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      sections={xpsDocumentationSections}
    />
  );
}
