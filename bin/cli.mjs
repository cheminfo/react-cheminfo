/*
 * The plumbing every checker of this package shares: how a comma-separated
 * option is read, how a count is written in the summary line, and how a call
 * the script cannot honour is reported. A checker only has to say what it
 * checks, and stays the one place that ends the process.
 */
import process from 'node:process';

import { formatInteger, pluralize } from '../lib/core.js';

/**
 * A comma-separated option, without the empty entries a trailing comma leaves.
 * @param {string} value - What was written after the `=`.
 * @returns {string[]} The entries, trimmed.
 */
export function listOption(value) {
  const entries = [];
  for (const entry of value.split(',')) {
    if (entry.trim() !== '') entries.push(entry.trim());
  }
  return entries;
}

/**
 * A count with its noun, so a summary line reads as a sentence.
 * @param {number} total - How many.
 * @param {string} noun - What of, in the singular.
 * @returns {string} The grouped count and the noun that agrees with it.
 */
export function countOf(total, noun) {
  return `${formatInteger(total)} ${pluralize(total, noun)}`;
}

/**
 * Report a call the script cannot honour, which is not a clean scan.
 * @param {string} tool - The checker's name, as the message is prefixed.
 * @param {string} message - What was wrong with the call.
 * @returns {number} The status a wrong call exits with, for `process.exit`.
 */
export function usageError(tool, message) {
  process.stderr.write(`${tool}: ${message}\n`);
  return 2;
}
