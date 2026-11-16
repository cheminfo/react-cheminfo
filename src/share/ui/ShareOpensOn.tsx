import { H6, HTMLSelect, Radio } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  OpensOnChoice,
  OpensOnLinks,
  OpensOnTarget,
  ShareExample,
} from '../core/opensOn.ts';

/** Props of {@link ShareOpensOn}. */
export interface ShareOpensOnProps {
  /** What the dialog can hand out for the page on screen. */
  links: OpensOnLinks;
  /** What the link opens on. */
  choice: OpensOnChoice;
  /** Called with the choice the reader makes. */
  onChange: (choice: OpensOnChoice) => void;
  /** The examples a link can open on, in the order they are listed. */
  examples: readonly ShareExample[];
  /**
   * What the site calls what is on screen: "This circuit", "This drawing".
   * @default the chrome's own words
   */
  screenLabel?: string;
  /**
   * What a site adds under the choice: the style a link sets, say.
   * @default undefined — nothing
   */
  children?: ReactNode;
}

/**
 * The section of the Share dialog saying what the link opens on: what is on
 * screen, when a link can carry it; any of the examples, whatever is on
 * screen; or the page alone.
 * @param props - See {@link ShareOpensOnProps}.
 * @returns The section's content.
 */
export function ShareOpensOn(props: ShareOpensOnProps): ReactElement {
  const { links, choice, onChange, examples, screenLabel, children } = props;
  const t = useChromeT();
  const group = useId();
  const select = (opensOn: OpensOnTarget) => () => {
    onChange({ ...choice, opensOn });
  };
  const tooLarge = links.screen === 'too-large';
  const shown = examples.find((example) => example.id === choice.example);
  const changed = links.changed && choice.example === links.example;
  return (
    <div
      role="radiogroup"
      aria-label={t('share.opensOn')}
      className="share-opens-on"
    >
      <H6>{t('share.opensOn')}</H6>
      {links.screen === undefined ? null : (
        <Radio
          name={group}
          value="screen"
          checked={choice.opensOn === 'screen'}
          disabled={tooLarge}
          onChange={select('screen')}
          labelElement={
            <Option
              title={screenLabel ?? t('share.opensOnScreen')}
              note={
                tooLarge
                  ? t('share.opensOnTooLarge')
                  : t('share.opensOnScreenNote')
              }
            />
          }
        />
      )}
      {examples.length === 0 ? null : (
        <>
          <Radio
            name={group}
            value="example"
            checked={choice.opensOn === 'example'}
            onChange={select('example')}
            label={t('share.opensOnExample')}
          />
          <div className="share-opens-on__under">
            <HTMLSelect
              fill
              aria-label={t('share.opensOnExampleLabel')}
              value={choice.example}
              onChange={(event) => {
                onChange({ opensOn: 'example', example: event.target.value });
              }}
            >
              <ExampleOptions examples={examples} />
            </HTMLSelect>
            {shown?.description ? (
              <span className="share-opens-on__note">{shown.description}</span>
            ) : null}
            {changed ? (
              <span className="share-opens-on__note">
                {t('share.opensOnChanged')}
              </span>
            ) : null}
          </div>
        </>
      )}
      <Radio
        name={group}
        value="none"
        checked={choice.opensOn === 'none'}
        onChange={select('none')}
        labelElement={
          <Option
            title={t('share.opensOnNone')}
            note={t('share.opensOnNoneNote')}
          />
        }
      />
      {children}
    </div>
  );
}

// The title in a span of its own, so it is what a click on the words finds.
function Option(props: { title: string; note: string }): ReactElement {
  return (
    <>
      <span className="share-opens-on__title">{props.title}</span>
      <span className="share-opens-on__note">{props.note}</span>
    </>
  );
}

// Listed under their groups when they have any, in the order they come.
function ExampleOptions(props: {
  examples: readonly ShareExample[];
}): ReactElement {
  const groups = new Map<string, ShareExample[]>();
  const loose: ShareExample[] = [];
  for (const example of props.examples) {
    if (example.group === undefined) {
      loose.push(example);
      continue;
    }
    const group = groups.get(example.group);
    if (group) group.push(example);
    else groups.set(example.group, [example]);
  }
  return (
    <>
      {loose.map((example) => (
        <option key={example.id} value={example.id}>
          {example.name}
        </option>
      ))}
      {[...groups].map(([label, members]) => (
        <optgroup key={label} label={label}>
          {members.map((example) => (
            <option key={example.id} value={example.id}>
              {example.name}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
