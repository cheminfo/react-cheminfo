import { act } from 'react';

/**
 * How long a check is given before it is let be, in milliseconds: a deadline
 * for a test that fails, never a delay a passing test waits out.
 */
const DEADLINE = 10_000;

/**
 * Let the event loop turn, a task at a time inside `act`, until the check
 * holds: a message port, a module loaded on demand or a digest, however
 * loaded the machine is.
 * @param check - What is waited for.
 */
export async function until(check: () => boolean): Promise<void> {
  await turn(check, performance.now() + DEADLINE);
}

async function turn(check: () => boolean, deadline: number): Promise<void> {
  if (check() || performance.now() > deadline) return;
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    });
  });
  await turn(check, deadline);
}
