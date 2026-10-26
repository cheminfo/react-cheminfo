/**
 * Which items of a request each input of a tool takes, and the sentence a
 * host is answered with when the request loads nothing.
 */

import type { CheckedValue, KnownKind } from './kinds.ts';
import { checkValue, isKnownKind, kindAccepts } from './kinds.ts';
import type {
  HostError,
  HostItem,
  ToolInput,
  ToolInterface,
} from './protocol.ts';

/** The item an input took, and its value as the input's kind reads it. */
export interface LoadedInput {
  key: string;
  item: HostItem;
  checked: CheckedValue;
}

/** What choosing the items of a request gave. */
export type InputSelection =
  { ok: true; inputs: LoadedInput[] } | { ok: false; error: HostError };

/**
 * Give each input of the tool the items of a request it takes.
 *
 * Each input tries its kinds in its own order of preference, and takes the
 * first item that falls under one and passes that kind's schema: the tool
 * knows which notation serves it best, whatever order the host listed them in.
 * An input taking `many` takes every such item instead, in the host's order.
 * An item naming another input's `key` is left to that input.
 *
 * A required input left without an item refuses the request. An optional one
 * is passed over, unless no input got an item at all.
 * @param tool - What the tool takes.
 * @param items - What the host sent.
 * @returns The items the inputs took, or why the request loads nothing.
 */
export function selectInputs(
  tool: ToolInterface,
  items: readonly HostItem[],
): InputSelection {
  const inputs: LoadedInput[] = [];
  const passedOver: string[] = [];
  for (const input of tool.inputs) {
    const errors: string[] = [];
    const taken = input.many
      ? selectEvery(input, items, errors)
      : selectFirst(input, items, errors);
    if (taken.length > 0) {
      inputs.push(...taken);
    } else if (input.optional) {
      passedOver.push(...errors);
    } else {
      return { ok: false, error: refusal(tool, [input], errors) };
    }
  }
  if (inputs.length > 0 || tool.inputs.length === 0) {
    return { ok: true, inputs };
  }
  return { ok: false, error: refusal(tool, tool.inputs, passedOver) };
}

function selectFirst(
  input: ToolInput,
  items: readonly HostItem[],
  errors: string[],
): LoadedInput[] {
  for (const accepted of input.kinds) {
    if (!isKnownKind(accepted)) continue;
    for (const item of items) {
      if (!isFor(input, accepted, item)) continue;
      const loaded = checkItem(input.key, accepted, item, errors);
      if (loaded !== null) return [loaded];
    }
  }
  return [];
}

function selectEvery(
  input: ToolInput,
  items: readonly HostItem[],
  errors: string[],
): LoadedInput[] {
  const taken: LoadedInput[] = [];
  for (const item of items) {
    for (const accepted of input.kinds) {
      if (!isKnownKind(accepted) || !isFor(input, accepted, item)) continue;
      const loaded = checkItem(input.key, accepted, item, errors);
      if (loaded === null) continue;
      taken.push(loaded);
      break;
    }
  }
  return taken;
}

function isFor(input: ToolInput, accepted: KnownKind, item: HostItem): boolean {
  if (item.key !== undefined && item.key !== input.key) return false;
  return kindAccepts(accepted, item.kind);
}

function checkItem(
  key: string,
  accepted: KnownKind,
  item: HostItem,
  errors: string[],
): LoadedInput | null {
  const outcome = checkValue(accepted, item.value);
  if (outcome.valid) return { key, item, checked: outcome.checked };
  for (const error of outcome.errors) errors.push(`${item.kind} ${error}`);
  return null;
}

/**
 * Why a request loads nothing: some item had the wrong shape, or no item was
 * of a kind the inputs take.
 * @param tool - What the tool takes.
 * @param inputs - The inputs left without an item.
 * @param errors - What the schemas found.
 * @returns The error the host is answered with.
 */
function refusal(
  tool: ToolInterface,
  inputs: readonly ToolInput[],
  errors: string[],
): HostError {
  if (errors.length > 0) {
    const keys = inputs.map((input) => input.key);
    return {
      code: 'invalid',
      message: `No item for ${LIST.format(keys)} has the shape its kind requires, so ${tool.name} loaded nothing.`,
      errors,
    };
  }
  const kinds = inputs.flatMap((input) => input.kinds);
  return {
    code: 'no-input',
    message: `No item is a ${LIST.format(kinds)}, so ${tool.name} loaded nothing.`,
  };
}

const LIST = new Intl.ListFormat('en', { type: 'disjunction' });
