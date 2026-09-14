import type { WorkerEventLike, WorkerLike } from '../messages.ts';

/** A worker with no thread behind it: it records what it is sent and answers when told. */
export class FakeWorker implements WorkerLike {
  public readonly sent: unknown[] = [];
  public readonly transfers: Array<Transferable[] | undefined> = [];
  public terminated = false;
  public refusePostMessage = false;
  readonly #listeners = new Map<
    string,
    Array<(event: WorkerEventLike) => void>
  >();

  public postMessage(message: unknown, transfer?: Transferable[]): void {
    if (this.refusePostMessage) throw new Error('the job could not be cloned');
    this.sent.push(message);
    this.transfers.push(transfer);
  }

  public addEventListener(
    type: 'message' | 'error',
    listener: (event: WorkerEventLike) => void,
  ): void {
    const listeners = this.#listeners.get(type) ?? [];
    listeners.push(listener);
    this.#listeners.set(type, listeners);
  }

  public terminate(): void {
    this.terminated = true;
  }

  public emit(type: 'message' | 'error', event: WorkerEventLike): void {
    for (const listener of this.#listeners.get(type) ?? []) listener(event);
  }

  public reply(id: number, response: unknown): void {
    this.emit('message', { data: { id, ok: true, response } });
  }

  public fail(id: number, message: string): void {
    this.emit('message', { data: { id, ok: false, message } });
  }

  public progress(id: number, progress: unknown): void {
    this.emit('message', { data: { id, progress } });
  }
}

/**
 * A worker factory that keeps every worker it made.
 * @param created - Where the workers are kept, oldest first.
 * @returns The factory.
 */
export function recordingFactory(created: FakeWorker[]): () => FakeWorker {
  return () => {
    const worker = new FakeWorker();
    created.push(worker);
    return worker;
  };
}
