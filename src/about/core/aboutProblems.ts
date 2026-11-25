import type { AboutContent } from './about.ts';
import { affiliationProblems } from './affiliations.ts';
import { COORDINATOR } from './team.ts';

/**
 * What is wrong with a record before anyone reads the page it draws.
 *
 * Short and efficient prose is the house style, and prose is exactly what no
 * test, lint rule or type ever checks: a `what` that runs to a paragraph and a
 * `can` list of a dozen lines both compile. This is where that is caught, so a
 * site can assert it in its own suite rather than discover it in review.
 * @param content - What the site wrote about itself.
 * @returns One line per problem, in reading order; empty when there is none.
 */
export function aboutProblems(content: AboutContent): string[] {
  const problems: string[] = [];

  if (content.what.length > WHAT_LIMIT) {
    problems.push(
      `\`what\` is ${content.what.length} characters: one sentence of at most ${WHAT_LIMIT} says what the tool is.`,
    );
  }

  const can = content.can;
  if (can.length < CAN_MIN || can.length > CAN_MAX) {
    problems.push(
      `\`can\` lists ${can.length} entries: between ${CAN_MIN} and ${CAN_MAX} is what a visitor reads before deciding to stay.`,
    );
  }
  for (let index = 0; index < can.length; index++) {
    const line = can[index] ?? '';
    if (line.length > CAN_LINE_LIMIT) {
      problems.push(
        `\`can\` entry ${index + 1} is ${line.length} characters: one line of at most ${CAN_LINE_LIMIT}, not a sentence about it.`,
      );
    }
  }

  const paragraphs = content.paragraphs ?? [];
  if (paragraphs.length > PARAGRAPH_MAX) {
    problems.push(
      `\`paragraphs\` holds ${paragraphs.length}: at most ${PARAGRAPH_MAX} short paragraphs of context, and the rest belongs in the README.`,
    );
  }
  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index] ?? '';
    if (paragraph.length > PARAGRAPH_LIMIT) {
      problems.push(
        `paragraph ${index + 1} is ${paragraph.length} characters: at most ${PARAGRAPH_LIMIT}, or it is documentation rather than context.`,
      );
    }
  }

  for (const person of [
    ...(content.leads ?? []),
    ...(content.people ?? []),
    ...(content.contributors ?? []),
  ]) {
    if (
      person.role !== undefined &&
      person.name === COORDINATOR &&
      !content.leads?.length
    ) {
      problems.push(
        `${person.name} is one of the family's people: every site lists them with the same role, so leave \`role\` out.`,
      );
    }
    const linksOrganisation = person.role?.includes('{organisation}') ?? false;
    if (linksOrganisation !== (person.organisation !== undefined)) {
      problems.push(
        `${person.name}: \`organisation\` and \`{organisation}\` in the role go together, or the link is lost or the placeholder shows.`,
      );
    }
  }

  problems.push(
    ...affiliationProblems(content.people ?? [], content.providedBy ?? []),
  );

  if (content.credits.length === 0) {
    problems.push(
      '`credits` is empty: every page of ours stands on borrowed work, and naming it is what the section is for.',
    );
  }

  return problems;
}

const WHAT_LIMIT = 160;
const CAN_MIN = 3;
const CAN_MAX = 6;
const CAN_LINE_LIMIT = 90;
const PARAGRAPH_MAX = 2;
const PARAGRAPH_LIMIT = 400;
