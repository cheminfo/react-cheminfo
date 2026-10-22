import type {
  MoleculesTokenCheck,
  MoleculesTokenVerdict,
} from './moleculesToken.ts';

/** The verdicts only a new token, written in the server's `.env`, fixes. */
const NEEDS_NEW_TOKEN: ReadonlySet<MoleculesTokenVerdict> = new Set([
  'unset',
  'refused',
  'otherSource',
]);

/**
 * The checks whose token has to be replaced: none is set, molecules.cheminfo.org
 * refuses it, or it was issued for another source. A token that could not be
 * checked is not among them, since nothing written in the `.env` fixes that.
 * @param checks - The last checks.
 * @returns Those to fix, in the order given.
 */
export function tokensToFix(
  checks: readonly MoleculesTokenCheck[],
): MoleculesTokenCheck[] {
  return checks.filter((check) => NEEDS_NEW_TOKEN.has(check.verdict));
}

/**
 * The command molecules.cheminfo.org issues a check's token with, on its
 * server. The source is quoted, since a name like `NP Atlas` holds a space;
 * the email is left for the reader to write.
 * @param check - The check, whose first source the token is issued for.
 * @returns The command.
 */
export function issueTokenCommand(
  check: Pick<MoleculesTokenCheck, 'sources'>,
): string {
  return `npm run tokens -- issue '${check.sources[0] ?? 'SOURCE'}' EMAIL`;
}
