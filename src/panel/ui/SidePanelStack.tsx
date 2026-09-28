import type { ReactNode } from 'react';
import type { ActivityBarItemProps } from 'react-science/ui';
import { Accordion, AccordionProvider, Button } from 'react-science/ui';

/** What a rail reads about one panel, wherever that rail is drawn. */
export interface PanelDescriptor {
  /** Identity, as the activity bar and the list of open panels address it. */
  id: string;
  /** What the header says, and what the icon's tooltip reads. */
  title: string;
  /** The icon stacked in the rail. */
  icon: ActivityBarItemProps['icon'];
}

export interface SidePanelStackProps<TPanel extends PanelDescriptor> {
  /** Every panel on offer, in the order their icons are stacked. */
  panels: readonly TPanel[];
  /** Which of them are open, named as each editor's own view names them. */
  openPanelIds: readonly string[];
  /**
   * Called with the panel whose close cross was pressed. It is the id of one of
   * `panels` rather than any string, so an editor whose panels are a fixed set
   * hands its own `togglePanel` straight in.
   * @param id - Identity of that panel.
   */
  onClose: (id: TPanel['id']) => void;
  /**
   * What to draw inside one panel.
   * @param panel - The panel to draw.
   * @returns Its body.
   */
  children: (panel: TPanel) => ReactNode;
}

/**
 * The panels that are open, stacked one under the other down the side.
 *
 * Every open panel gets a share of the height rather than a turn: the things
 * they hold are read together — which spectrum is selected and what its peaks
 * are, the residues to pick from and what the drawing adds up to — so closing
 * one to see the other would be a step backwards. A header click still folds a
 * single panel away, and shift-click folds every other one.
 *
 * They are drawn in the order the rail stacks their icons rather than the order
 * they were switched on, so a panel always comes back where it was.
 *
 * The header carries the shell's own two gestures and nothing about what the
 * panel holds: the chevron that folds it away and the cross that closes it.
 * What a panel switches on and off is a toolbar at the top of its own body, so
 * it travels with the panel when it is folded, reordered or lent to another
 * editor, and every header in every editor reads the same — which is the reason
 * this is one component rather than one per editor.
 *
 * The chevron is there because nothing else says which panels are folded. The
 * accordion draws every header identically and hides only the body, so a side
 * of four closed panels and a side of four open ones differ by white space, and
 * a reader looking for a panel that is already open reaches for its icon and
 * closes it. It is a real button rather than a glyph because the header's own
 * click never reaches the toolbar — clicks there are stopped so the close cross
 * does not also fold the panel — so a chevron that did nothing when pressed
 * would be an affordance that lies.
 * @param props - Component props.
 * @returns The stack.
 */
export function SidePanelStack<TPanel extends PanelDescriptor>(
  props: SidePanelStackProps<TPanel>,
) {
  const { panels, openPanelIds, onClose, children } = props;
  const open = panels.filter((panel) => openPanelIds.includes(panel.id));

  return (
    <AccordionProvider>
      <Accordion>
        {open.map((panel) => (
          <Accordion.Item
            key={panel.id}
            id={panel.id}
            title={panel.title}
            defaultOpen
            renderToolbar={({ isOpen, controls }) => (
              <>
                <Button
                  variant="minimal"
                  icon={isOpen ? 'chevron-down' : 'chevron-right'}
                  data-panel-open={isOpen}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Fold' : 'Unfold'} the ${panel.title.toLowerCase()} panel`}
                  tooltipProps={{
                    content: isOpen ? 'Fold this panel away' : 'Unfold it',
                  }}
                  onClick={() => controls.toggle()}
                />
                <Button
                  variant="minimal"
                  icon="cross"
                  tooltipProps={{ content: 'Close this panel' }}
                  aria-label={`Close the ${panel.title.toLowerCase()} panel`}
                  onClick={() => onClose(panel.id)}
                />
              </>
            )}
          >
            {children(panel)}
          </Accordion.Item>
        ))}
      </Accordion>
    </AccordionProvider>
  );
}
